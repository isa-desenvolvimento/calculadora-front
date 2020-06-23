import { Component, OnInit } from '@angular/core';

import { Lancamento, InfoParaCalculo } from '../../../_models/ChequeEmpresarial';
import { ChequeEmpresarialService } from '../../../_services/cheque-empresarial.service';

import { IndicesService } from '../../../_services/indices.service';
import { LogService } from '../../../_services/log.service';
import { PastasContratosService } from '../../../_services/pastas-contratos.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; // add this 1 of 4
import { timeout } from 'rxjs/operators';
import { element } from 'protractor';

import { getCurrentDate, formatDate, formatCurrency } from '../../util/util';
import { listIndices } from '../../util/constants'

import { Observable } from 'rxjs';

import 'datatables.net';
import 'datatables.net-buttons';

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'cheque-empresarial-cmp',
  moduleId: module.id,
  templateUrl: 'cheque-empresarial.component.html'
})

export class ChequeEmpresarialComponent implements OnInit {

  ceForm: FormGroup;
  ceFormRiscos: FormGroup;
  ceFormAmortizacao: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payloadLancamento: Lancamento;
  tableData: TableData;
  tableLoading = false;
  updateLoading = false;
  alertType = '';
  updateLoadingBtn = false;
  controleLancamentos = 0;
  tableHeader = [];
  form_riscos: any = {};

  indice_field = listIndices;

  // total
  total_date_now: any;
  total_data_calculo: any;
  subtotal_data_calculo: any;
  total_honorarios = 0;
  total_multa_sob_contrato = 0;
  total_subtotal = 0;
  total_grandtotal = 0;
  contractRef = ' ';

  dtOptions: DataTables.Settings = {};
  last_data_table: Object;
  min_data: string;
  ultima_atualizacao: String;
  loop = 0;

  indices = {
    dataBase: 0,
    dataBaseAtual: 0
  };
  formDefaultValues: InfoParaCalculo = {
    formDataCalculo: getCurrentDate("YYYY-MM-DD"),
    formMulta: 0,
    formJuros: 0,
    formHonorarios: 0,
    formMultaSobContrato: 0,
    formIndice: "---",
    formIndiceEncargos: 1
  };

  constructor(
    private formBuilder: FormBuilder,
    private chequeEmpresarialService: ChequeEmpresarialService,
    private indicesService: IndicesService,
    private logService: LogService,
    private pastasContratosService: PastasContratosService
  ) {
  }

  ngOnInit() {
    this.ceForm = this.formBuilder.group({
      ce_pasta: ['', Validators.required],
      ce_contrato: ['', Validators.required],
      ce_tipo_contrato: ['', Validators.required]
    });
    // this.ceFormRiscos = this.formBuilder.group({
    //   ce_indice: [],
    //   ce_encargos_monietarios: [],
    //   ce_data_calculo: getCurrentDate('YYYY-MM-DD'),
    //   ce_ultima_atualizacao: '',
    //   ce_encargos_contratuais: [],
    //   ce_multa: [],
    //   ce_juros_mora: [],
    //   ce_honorarios: [],
    //   ce_multa_sobre_constrato: []
    // });
    this.tableData = {
      dataRows: []
    }
    this.ceFormAmortizacao = this.formBuilder.group({
      ceFA_data_vencimento: [],
      ceFa_saldo_devedor: [],
      ceFA_data_base_atual: ['', Validators.required],
      ceFA_valor_lancamento: ['', Validators.required],
      ceFA_tipo_lancamento: ['', Validators.required],
      // ceFA_tipo_amortizacao: []
    });

    this.tableHeader = [
      'Data Base',
      'Índice',
      'Índice Data Base',
      'Data Base Atual',
      'Índice',
      'Valor Devedor',
      'Correção pelo Índice',
      'Encargos Monetários',
      'Lançamento',
      'Valor Devedor Atualizado'
    ]

    this.dtOptions = {
      paging: false,
      ordering: false,
      searching: false,
      dom: 'Bfrtip',
      buttons: [{
        extend: 'pdfHtml5',
        orientation: 'landscape',
        header: true,
        footer: true,
        pageSize: 'LEGAL',
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        },
        customize: doc => {

          doc['defaultStyle'] = { ...doc['defaultStyle'], fontSize: 8 }
          doc['styles']['tableHeader'] = { ...doc['styles']['tableHeader'], fontSize: 8, color: 'black', fillColor: 'white' }
          doc['styles']['tableFooter'] = { ...doc['styles']['tableFooter'], fontSize: 8, color: 'black', fillColor: 'white' }

          doc['content'][0].text = 'MOVIMENTAÇÕES POSTERIORES AO VENCIMENTO';
          doc['content'][1]['table']['widths'] = [80, 100, 40, 50, 100, 40, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

          const footer = doc['content'][1]['table']['body'].pop();
          const valor = footer.pop();
          footer.map((value, index) => {
            if (index !== 0) {
              value.text = "";
            }
          })
          footer.push(valor);
          doc['content'][1]['table']['body'].push(footer);

          doc['content'][1]['table']['body'].map((row, index) => {
            if (index !== 0 && this.tableData.dataRows.length - 1 >= index - 1) {
              row[1].text = this.tableData.dataRows[index - 1]['indiceDB'];
              row[4].text = this.tableData.dataRows[index - 1]['indiceBA'];

              row.map(item => item.alignment = 'center');
            }
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 20, 10, 0],
            text: `Honorários ${this.formDefaultValues.formHonorarios || 0}% : ${this.formatCurrency(this.total_honorarios)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 0, 10, 0],
            text: `Multa sob contrato ${this.formDefaultValues.formMultaSobContrato || 0}% : ${this.formatCurrency(this.total_multa_sob_contrato)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 0, 10, 0],
            text: `TOTAL APURADO EM ${this.total_data_calculo || "---------"} : ${this.formatCurrency(this.total_multa_sob_contrato)}`
          })

        }
      }],
      // pagingType: 'full_numbers',
      language: {
        "decimal": "",
        "emptyTable": "Sem dados para exibir",
        "info": "Mostrando _START_ de _END_ de _TOTAL_ registros",
        "infoEmpty": "Mostrando 0 de 0 de 0 registros",
        "infoFiltered": "(filtered from _MAX_ total registros)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrando _MENU_ registros",
        "loadingRecords": "Carregando...",
        "processing": "Processando...",
        "search": "Buscar:",
        "zeroRecords": "Nenhum registro encontrado com esses parâmetros",
        "paginate": {
          "first": "Primeira",
          "last": "Última",
          "next": "Próxima",
          "previous": "Anterior"
        },
        "aria": {
          "sortAscending": ": Ordernar para cima",
          "sortDescending": ": Ordernar para baixo"
        }
      }
    };
  }

  atualizarRisco() {
    this.controleLancamentos = 0;

    const payload = this.tableData.dataRows.map(lancamento => {

      this.updateLoadingBtn = true;
      let lancamentoLocal = { ...lancamento };
      lancamentoLocal['encargosMonetarios'] = JSON.stringify(lancamentoLocal['encargosMonetarios']);
      lancamentoLocal['infoParaCalculo'] = JSON.stringify(this.formDefaultValues);
      lancamentoLocal['valorDevedor'] = parseFloat(lancamentoLocal['valorDevedor']);
      lancamentoLocal['valorDevedorAtualizado'] = parseFloat(lancamentoLocal['valorDevedorAtualizado']);
      lancamentoLocal['contractRef'] = this.contractRef;
      lancamentoLocal['ultimaAtualizacao'] = getCurrentDate('YYYY-MM-DD');

      return lancamentoLocal;
    });

    const payloadPut = payload.filter((lancamento => lancamento['id']));

    payloadPut.length > 0 && this.chequeEmpresarialService.updateLancamento(payloadPut).subscribe(chequeEmpresarialList => {
      this.updateLoadingBtn = false;
      this.controleLancamentos = this.controleLancamentos + 1;
      this.formartTable('Atualização de Risco');

      if (this.tableData.dataRows.length === this.controleLancamentos) {
        this.ultima_atualizacao = getCurrentDate('YYYY-MM-DD');
      }
      this.alertType = 'risco-atualizado';
      this.toggleUpdateLoading()
    }, err => {
      this.errorMessage = "Falha ao atualizar risco.";
    });

    const payloadPost = payload.filter((lancamento => !lancamento['id']));

    payloadPost.length > 0 && this.chequeEmpresarialService.addLancamento(payloadPost).subscribe(chequeEmpresarialListUpdated => {
      this.updateLoadingBtn = false;
      this.controleLancamentos = this.controleLancamentos + 1;
      this.formartTable('Atualização de Risco');

      if (this.tableData.dataRows.length === this.controleLancamentos) {
        this.ultima_atualizacao = getCurrentDate('YYYY-MM-DD');
      }
      this.alertType = 'risco-atualizado';
      this.toggleUpdateLoading()
      // lancamento["id"] = lancamentoLocal["id"] = chequeEmpresarialListUpdated["id"];
    }, err => {
      this.tableLoading = false;
      this.alertType = 'registro-nao-incluido';
      this.toggleUpdateLoading()

      this.errorMessage = "Falha ao atualizar risco."; //registro-nao-incluido
    });

    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 5000);
  }

  // convenience getter for easy access to form fields
  get ce_form() { return this.ceForm.controls; }
  get ce_form_amortizacao() { return this.ceFormAmortizacao.controls; }

  resetFields(form) {
    this[form].reset()
  }

  formatCurrency(value) {
    return formatCurrency(value)
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  getLastLine() {
    return this.tableData.dataRows.length === 0 ? this.tableData.dataRows.length : this.tableData.dataRows.length - 1;
  }

  formartTable(acao) {
    const inter = setInterval(() => {
      let table = document.getElementById('tableCheque').innerHTML;

      if (table) {
        table = table.replace(/log-visible-false/g, 'log-visible-true ');
        table = table.replace(/log-hidden-false/g, 'log-hidden-true ');
        clearInterval(inter)
        this.logService.addLog([{
          data: getCurrentDate("YYYY-MM-DD"),
          usuario: window.localStorage.getItem('username').toUpperCase(),
          pasta: this.ce_form.ce_pasta.value,
          contrato: this.ce_form.ce_contrato.value,
          tipoContrato: this.ce_form.ce_tipo_contrato.value,
          dataSimulacao: this.form_riscos.data_calculo,
          acao: acao,
          infoTabela: table
        }]).subscribe(log => { })
      }
    }, 0);
  }

  incluirLancamentos() {

    if (!this.formDefaultValues.formIndice) {
      this.updateLoadingBtn = true;
      this.toggleUpdateLoading()
      this.alertType = 'preencher-indice';
      return;
    }

    this.updateLoadingBtn = false;
    this.tableLoading = true;

    const localDataBase = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFA_data_vencimento.value : this.tableData.dataRows[this.getLastLine()]["dataBaseAtual"];
    const localValorDevedor = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFa_saldo_devedor.value : this.tableData.dataRows[this.getLastLine()]["valorDevedorAtualizado"];

    this.total_date_now = moment(localDataBase).format("DD/MM/YYYY");
    this.total_data_calculo = moment(this.form_riscos.data_calculo).format("DD/MM/YYYY") || getCurrentDate();
    this.subtotal_data_calculo = this.total_date_now;
    this.last_data_table = [...this.tableData.dataRows].pop();

    const localLancamentos = this.ce_form_amortizacao.ceFA_valor_lancamento.value;
    const localTipoLancamento = this.ce_form_amortizacao.ceFA_tipo_lancamento.value;
    const localDataBaseAtual = this.ce_form_amortizacao.ceFA_data_base_atual.value;

    const localTypeIndice = this.formDefaultValues.formIndice;

    if (localTypeIndice === "Encargos Contratuais %") {
      const localTypeValue = this.form_riscos.encargos_contratuais;

      const localInfoParaCalculo: InfoParaCalculo = {
        formMulta: this.form_riscos.multa,
        formJuros: this.form_riscos.juros_mora,
        formHonorarios: this.form_riscos.honorarios,
        formMultaSobContrato: this.form_riscos.multa_sobre_constrato,
        formIndice: null,
        formIndiceEncargos: null
      };

      setTimeout(() => {
        this.payloadLancamento = ({
          dataBase: localDataBase,
          indiceDB: localTypeIndice,
          indiceDataBase: localTypeValue,
          indiceBA: localTypeIndice,
          indiceDataBaseAtual: localTypeValue,
          dataBaseAtual: localDataBaseAtual,
          valorDevedor: localValorDevedor,
          encargosMonetarios: {
            correcaoPeloIndice: null,
            jurosAm: {
              dias: null,
              percentsJuros: null,
              moneyValue: null,
            },
            multa: null,
          },
          lancamentos: localLancamentos,
          tipoLancamento: localTipoLancamento,
          valorDevedorAtualizado: null,
          contractRef: this.contractRef,
          ultimaAtualizacao: '',
          infoParaCalculo: { ...localInfoParaCalculo }
        });
        // Removendo inicio e fim amortizacao
        // this.ce_form_amortizacao.ceFA_tipo_amortizacao.value ? this.tableData.dataRows.unshift(this.payloadLancamento) : this.tableData.dataRows.push(this.payloadLancamento);
        this.tableData.dataRows.push(this.payloadLancamento)
        this.tableLoading = false;
      }, 0);
      this.resetFields('ceFormAmortizacao');

      setTimeout(() => {
        this.toggleUpdateLoading()
        this.alertType = 'lancamento-incluido';
        this.valorDevedor();
        this.simularCalc(true)
      }, 1000)
    } else {
      const dataBase = this.ce_form_amortizacao.ceFA_data_vencimento.value || this.last_data_table['dataBase'];
      this.indicesService.getIndiceData(localTypeIndice, this.ce_form_amortizacao.ceFA_data_base_atual.value).subscribe(indiceDataBaseAtual => {
        this.indicesService.getIndiceData(localTypeIndice, dataBase).subscribe(indiceDataBase => {

          const localTypeDBAValue = indiceDataBaseAtual['valor'];
          const localTypeDBValue = indiceDataBase['valor'];

          const localInfoParaCalculo: InfoParaCalculo = {
            formMulta: this.form_riscos.multa,
            formJuros: this.form_riscos.juros_mora,
            formHonorarios: this.form_riscos.honorarios,
            formMultaSobContrato: this.form_riscos.multa_sobre_constrato,
            formIndice: null,
            formIndiceEncargos: null
          };

          setTimeout(() => {
            this.payloadLancamento = ({
              dataBase: localDataBase,
              indiceDB: localTypeIndice,
              indiceDataBase: localTypeDBValue,
              indiceBA: localTypeIndice,
              indiceDataBaseAtual: localTypeDBAValue,
              dataBaseAtual: localDataBaseAtual,
              valorDevedor: localValorDevedor,
              encargosMonetarios: {
                correcaoPeloIndice: null,
                jurosAm: {
                  dias: null,
                  percentsJuros: null,
                  moneyValue: null,
                },
                multa: null,
              },
              lancamentos: localLancamentos,
              tipoLancamento: localTipoLancamento,
              valorDevedorAtualizado: null,
              contractRef: this.contractRef,
              ultimaAtualizacao: '',
              infoParaCalculo: { ...localInfoParaCalculo }
            });
            // Removendo inicio e fim amortizacao
            // this.ce_form_amortizacao.ceFA_tipo_amortizacao.value ? this.tableData.dataRows.unshift(this.payloadLancamento) : this.tableData.dataRows.push(this.payloadLancamento);
            this.tableData.dataRows.push(this.payloadLancamento)
            this.tableLoading = false;
          }, 0);
          this.resetFields('ceFormAmortizacao');

          setTimeout(() => {
            this.toggleUpdateLoading()
            this.alertType = 'lancamento-incluido';
            this.valorDevedor();
            this.simularCalc(true)
          }, 1000)
        })
      }, erro => {
        this.alertType = 'sem-indice';
        this.toggleUpdateLoading()
      });
    }
  }

  pesquisarContratos(ref) {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.tableData.dataRows = [];

    this.contractRef = ref;

    this.chequeEmpresarialService.getAll().subscribe(chequeEmpresarialList => {
      this.tableData.dataRows = chequeEmpresarialList.filter((row) => row["contractRef"] === ref).map(cheque => {
        cheque.encargosMonetarios = JSON.parse(cheque.encargosMonetarios)
        cheque.infoParaCalculo = JSON.parse(cheque.infoParaCalculo)
        const ultimaAtualizacao = [...chequeEmpresarialList].pop();
        this.ultima_atualizacao = moment(ultimaAtualizacao.ultimaAtualizacao).format('YYYY-MM-DD');

        Object.keys(cheque.infoParaCalculo).filter(value => {
          this.formDefaultValues[value] = cheque.infoParaCalculo[value];
        });

        setTimeout(() => {
          this.simularCalc(true, null, true);
        }, 1000);

        return cheque;
      });

      if (!this.tableData.dataRows.length) {
        this.toggleUpdateLoading();
        this.tableLoading = false;
        this.alertType = 'sem-registros'
        return;
      }

      this.tableLoading = false;
    }, err => {

      this.tableLoading = false;
      this.alertType = 'sem-registros';
      this.toggleUpdateLoading()
      this.errorMessage = err.error.message;
    });

  }

  getCurrentDate(format = "DD/MM/YYYY hh:mm") {
    return moment(new Date).format(format);
  }

  getQtdDias(fistDate, secondDate) {
    const a = moment(fistDate, 'DD/MM/YYYY');
    const b = moment(secondDate, 'DD/MM/YYYY');
    return Math.abs(b.diff(a, 'days'));
  }

  changeDate(e, row) {
    this.indicesService.getIndiceData((this.formDefaultValues.formIndice || row["indiceBA"]), e.target.value).subscribe(indi => {
      row['dataBaseAtual'] = moment(e.target.value).format("YYYY-MM-DD");
      row['indiceDataBaseAtual'] = indi['valor'];
      this.simularCalc(true);
    }, err => {
      this.alertType = 'sem-indice';
      this.toggleUpdateLoading()
    })
  }

  formatDate(row) {
    return moment(row['dataBase']).format("DD/MM/YYYY");
  }

  setFormRiscos(form) {
    Object.keys(form).filter((value, key) => {
      if (form[value] && form[value] !== 'undefined') {
        this.form_riscos[value] = form[value];
      }
    });
  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;

    if (origin === 'btn') {
      Object.keys(this.form_riscos).filter((value, key) => {
        if (this.form_riscos[value] && this.form_riscos[value] !== 'undefined') {
          this.formDefaultValues[value] = this.form_riscos[value];
        }
      });
    }

    this.tableData.dataRows.map(async (row, index) => {

      // - Indices
      if (!isInlineChange) {
        row['indiceDB'] = this.formDefaultValues.formIndice;
        row['indiceBA'] = this.formDefaultValues.formIndice;

        row['indiceDataBaseAtual'] = await this.getIndiceDataBase(this.formDefaultValues.formIndice, row['dataBaseAtual']);
        row['indiceDataBase'] = await this.getIndiceDataBase(this.formDefaultValues.formIndice, row['dataBase']);
      }

      // Table Values

      if (index > 0) {
        row['valorDevedor'] = this.tableData.dataRows[index - 1]['valorDevedorAtualizado'];
        row['dataBase'] = this.tableData.dataRows[index - 1]['dataBaseAtual'];
      }

      const qtdDias = this.getQtdDias(moment(row["dataBase"]).format("DD/MM/YYYY"), moment(row["dataBaseAtual"]).format("DD/MM/YYYY"));
      const valorDevedor = parseFloat(row['valorDevedor']);

      let correcao;
      if (this.formDefaultValues.formIndice === "Encargos Contratuais %" || row['infoParaCalculo']['formIndice'] === "Encargos Contratuais %") {
        correcao = search ? row['encargosMonetarios']['correcaoPeloIndice'] : ((valorDevedor * (row['indiceDataBaseAtual'] / 100) / 30) * qtdDias).toFixed(2);
      } else {
        correcao = search ? row['encargosMonetarios']['correcaoPeloIndice'] : ((valorDevedor / (row['indiceDataBase'] / 100) * (row['indiceDataBaseAtual'] / 100)) - valorDevedor).toFixed(2);
      }

      const correcaoPeloIndice = row['encargosMonetarios']['correcaoPeloIndice'] = parseFloat(correcao);
      const lancamento = row['tipoLancamento'] === 'credit' ? (row['lancamentos'] * (-1)) : row['lancamentos'];

      // -- dias
      row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
      // -- juros 
      row['encargosMonetarios']['jurosAm']['percentsJuros'] = search ? row['encargosMonetarios']['jurosAm']['percentsJuros'] : (((this.formDefaultValues.formJuros || this.form_riscos.juros_mora) / 30) * qtdDias).toFixed(2);
      // -- moneyValue
      const moneyValue = row['encargosMonetarios']['jurosAm']['moneyValue'] = search ? row['encargosMonetarios']['jurosAm']['moneyValue'] : ((((valorDevedor + correcaoPeloIndice) / 30) * qtdDias) * (((this.formDefaultValues.formJuros || this.form_riscos.juros_mora) / 100))).toFixed(2);

      // -- multa 
      let multa = 0;
      if (index === 0) {
        row['encargosMonetarios']['multa'] = multa = ((valorDevedor + correcaoPeloIndice + moneyValue) * (this.formDefaultValues.formMulta / 100)).toFixed(2);
      } else {
        row['encargosMonetarios']['multa'] = "NaN";
      }

      const valorDevedorAtualizado = row['valorDevedorAtualizado'] = valorDevedor + correcaoPeloIndice + parseFloat(moneyValue) + parseFloat(multa) + lancamento;

      // Forms Total
      this.total_data_calculo = formatDate(this.formDefaultValues.formDataCalculo);
      const honorarios = this.total_honorarios = valorDevedorAtualizado * this.formDefaultValues.formHonorarios / 100;

      this.last_data_table = [...this.tableData.dataRows].pop();
      let last_date_base_atual = Object.keys(this.last_data_table).length ? this.last_data_table['dataBaseAtual'] : this.total_date_now;
      let last_date_base = Object.keys(this.last_data_table).length ? this.last_data_table['dataBase'] : this.total_date_now;

      this.subtotal_data_calculo = formatDate(last_date_base);
      this.total_data_calculo = formatDate(last_date_base_atual);
      this.min_data = last_date_base_atual;

      this.total_subtotal = this.last_data_table['valorDevedorAtualizado'];
      const valorDevedorAtualizadoLast = parseFloat(this.last_data_table['valorDevedorAtualizado']);

      this.total_multa_sob_contrato = (valorDevedorAtualizadoLast + honorarios) * this.formDefaultValues.formMultaSobContrato / 100 || 0;
      this.total_grandtotal = this.total_multa_sob_contrato + honorarios + valorDevedorAtualizadoLast;

      if (origin === 'btn' && this.tableData.dataRows.length - 1 === index && this.loop === 5) {
        this.formartTable('Simulação');
        this.toggleUpdateLoading()
        this.alertType = 'calculo-simulado';
      }
    });

    this.tableLoading = false;
    !isInlineChange && this.toggleUpdateLoading();
  }

  async getIndiceDataBase(indice, data) {
    if (!indice || !data) {
      return 1;
    }

    switch (indice) {
      case "Encargos Contratuais %":
        return !!this.form_riscos.encargos_contratuais ? this.form_riscos.encargos_contratuais : 1;
        break;
      default:
        return (await this.indicesService.getIndiceData(indice, data))
          .toPromise().then(ind => ind['valor'])
    }
  }

  deleteRow(row) {
    const index = this.tableData.dataRows.indexOf(row);
    if (!row.id) {
      this.tableData.dataRows.splice(index, 1);
      setTimeout(() => {
        this.simularCalc(true);
        this.toggleUpdateLoading()
        this.alertType = 'registro-excluido'
      }, 0)
    } else {
      this.chequeEmpresarialService.removeLancamento(row.id).subscribe(() => {
        this.tableData.dataRows.splice(index, 1);
        setTimeout(() => {
          this.simularCalc(true);
          this.toggleUpdateLoading()
          this.alertType = 'registro-excluido'
        }, 0)
      })
    }
  }

  updateInlineIndice(e, row, innerIndice, indiceToChangeInline, columnData) {
    switch (e.target.value) {
      case "Encargos Contratuais %":
        row[innerIndice] = e.target.value;
        row[indiceToChangeInline] = !!this.form_riscos.encargos_contratuais ? this.form_riscos.encargos_contratuais : 1;
        setTimeout(() => {
          this.simularCalc(true);
        }, 500)
        break;
      default:
        this.indicesService.getIndiceData(e.target.value, row[columnData]).subscribe(indi => {
          row[innerIndice] = e.target.value;
          row[indiceToChangeInline] = indi['valor'];
          setTimeout(() => {
            this.simularCalc(true);
          }, 500);
        }), err => {
          this.alertType = 'sem-indice';
          this.toggleUpdateLoading()
        };
        break;
    }
  }
}