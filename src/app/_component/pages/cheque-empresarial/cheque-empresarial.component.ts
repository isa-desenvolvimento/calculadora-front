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

  // total
  total_date_now: any;
  total_data_calculo: any;
  subtotal_data_calculo: any;
  total_honorarios = 0;
  total_multa_sob_contrato = 0;
  total_subtotal = 0;
  total_grandtotal = 0;

  dtOptions: DataTables.Settings = {};
  last_data_table: Object;
  min_data: string;
  ultima_atualizacao: String;

  formDefaultValues: InfoParaCalculo = {
    formMulta: 0,
    formJuros: 0,
    formHonorarios: 0,
    formMultaSobContrato: 0,
    formIndice: "---",
    formIndiceEncargos: 6
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
    // this.pesquisarContratos();

    this.ceForm = this.formBuilder.group({
      ce_pasta: ['', Validators.required],
      ce_contrato: ['', Validators.required],
      ce_tipo_contrato: ['', Validators.required]
    });
    this.ceFormRiscos = this.formBuilder.group({
      ce_indice: [],
      ce_encargos_monietarios: [],
      ce_data_calculo: this.getCurrentDate('YYYY-MM-DD'),
      ce_ultima_atualizacao: '',
      ce_encargos_contratuais: [],
      ce_multa: [],
      ce_juros_mora: [],
      ce_honorarios: [],
      ce_multa_sobre_constrato: []
    });
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
      searching: false,
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
      lancamentoLocal['contractRef'] = this.ce_form.ce_pasta.value + this.ce_form.ce_contrato.value + this.ce_form.ce_tipo_contrato.value;
      lancamentoLocal['ultimaAtualizacao'] = this.getCurrentDate('YYYY-MM-DD');

      return lancamentoLocal;
    });

    const payloadPut = [...payload].filter((lancamento => lancamento['id']));

    payloadPut.length > 0 && this.chequeEmpresarialService.updateLancamento(payloadPut).subscribe(chequeEmpresarialList => {
      this.updateLoadingBtn = false;
      this.controleLancamentos = this.controleLancamentos + 1;
      if (this.tableData.dataRows.length === this.controleLancamentos) {
        this.ultima_atualizacao = this.getCurrentDate('YYYY-MM-DD');
        this.toggleUpdateLoading()
        this.alertType = 'risco-atualizado';
      }
    }, err => {
      this.errorMessage = "Falha ao atualizar risco.";
    });

    const payloadPost = [...payload].filter((lancamento => !lancamento['id']));

    payloadPost.length > 0 && this.chequeEmpresarialService.addLancamento(payloadPost).subscribe(chequeEmpresarialListUpdated => {
      this.updateLoadingBtn = false;
      this.controleLancamentos = this.controleLancamentos + 1;
      if (this.tableData.dataRows.length === this.controleLancamentos) {
        this.ultima_atualizacao = this.getCurrentDate('YYYY-MM-DD');
        this.toggleUpdateLoading()
        this.alertType = 'risco-atualizado';
      }
      // lancamento["id"] = lancamentoLocal["id"] = chequeEmpresarialListUpdated["id"];
    }, err => {
      this.tableLoading = false;
      this.alertType = 'registro-nao-incluido';
      this.toggleUpdateLoading()

      this.errorMessage = "Falha ao atualizar risco."; //registro-nao-incluido
    });

    setTimeout(() => {
      this.updateLoading = false;
      this.formartTable('Atualização de Risco');
    }, 3000);
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  // convenience getter for easy access to form fields
  get ce_form() { return this.ceForm.controls; }
  get ce_form_riscos() { return this.ceFormRiscos.controls; }
  get ce_form_amortizacao() { return this.ceFormAmortizacao.controls; }

  resetFields(form) {
    this[form].reset()
  }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  getLastLine() {
    return this.tableData.dataRows.length === 0 ? this.tableData.dataRows.length : this.tableData.dataRows.length - 1;
  }

  formartTable(acao) {
    const inter = setInterval(() => {
      const table = document.getElementById('tableCheque');
      if (table) {
        table.querySelectorAll('.log-hidden').forEach(el =>
          el['style'].display = 'none'
        )
        table.querySelectorAll('.log-visible').forEach(el =>
          el['style'].display = 'block'
        )

        clearInterval(inter)
        this.logService.addLog([{
          data: this.getCurrentDate(),
          usuario: '',
          pasta: this.ce_form.ce_pasta.value,
          contrato: this.ce_form.ce_contrato.value,
          tipoContrato: this.ce_form.ce_tipo_contrato.value,
          dataSimulacao: this.ce_form_riscos.ce_data_calculo.value,
          acao: acao,
          infoTabela: table.innerHTML
        }]).subscribe(log => {
          console.log(log);
        })
      }
    }, 500);
  }

  incluirLancamentos() {
    this.tableLoading = true;

    const contractRef = this.ce_form.ce_pasta.value + this.ce_form.ce_contrato.value + this.ce_form.ce_tipo_contrato.value;

    const localDataBase = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFA_data_vencimento.value : this.tableData.dataRows[this.getLastLine()]["dataBaseAtual"];
    const localValorDevedor = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFa_saldo_devedor.value : this.tableData.dataRows[this.getLastLine()]["valorDevedorAtualizado"];

    this.total_date_now = moment(localDataBase).format("DD/MM/YYYY");
    this.total_data_calculo = moment(this.ce_form_riscos.ce_data_calculo.value).format("DD/MM/YYYY") || this.getCurrentDate();
    this.subtotal_data_calculo = this.total_date_now;
    this.last_data_table = [];

    const localTypeIndice = this.ce_form_riscos.ce_indice.value;
    const localTypeValue = this.getIndiceDataBase(localTypeIndice, this.ce_form_amortizacao.ceFA_data_base_atual.value);

    const localLancamentos = this.ce_form_amortizacao.ceFA_valor_lancamento.value;
    const localTipoLancamento = this.ce_form_amortizacao.ceFA_tipo_lancamento.value;
    const localDataBaseAtual = this.ce_form_amortizacao.ceFA_data_base_atual.value;

    const localInfoParaCalculo: InfoParaCalculo = {
      formMulta: this.ce_form_riscos.ce_multa.value,
      formJuros: this.ce_form_riscos.ce_juros_mora.value,
      formHonorarios: this.ce_form_riscos.ce_honorarios.value,
      formMultaSobContrato: this.ce_form_riscos.ce_multa_sobre_constrato.value,
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
        contractRef: contractRef,
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
      this.simularCalc(true)
    }, 500)
  }

  pesquisarContratos() {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.ceFormRiscos.reset({ ce_data_calculo: this.getCurrentDate('YYYY-MM-DD') });

    const contractRef = this.ce_form.ce_pasta.value + this.ce_form.ce_contrato.value + this.ce_form.ce_tipo_contrato.value;

    this.chequeEmpresarialService.getAll().subscribe(chequeEmpresarialList => {
      this.tableData.dataRows = chequeEmpresarialList.filter((row) => row["contractRef"] === contractRef).map(cheque => {
        cheque.encargosMonetarios = JSON.parse(cheque.encargosMonetarios)
        cheque.infoParaCalculo = JSON.parse(cheque.infoParaCalculo)

        if (chequeEmpresarialList.length) {
          const ultimaAtualizacao = [...chequeEmpresarialList].pop();
          this.ultima_atualizacao = moment(ultimaAtualizacao.ultimaAtualizacao).format('YYYY-MM-DD');
        }

        setTimeout(() => {

          this.changeFormValues(cheque.infoParaCalculo, true);
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
    row['dataBaseAtual'] = moment(e.target.value).format("YYYY-MM-DD");

    row['indiceDataBaseAtual'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value || row["indiceBA"], row["dataBaseAtual"]);

    this.simularCalc(true);
  }

  formatDate(row) {
    return moment(row['dataBase']).format("DD/MM/YYYY");
  }

  changeFormValues(infoParaCalculo, search = false) {

    // this.ceFormRiscos.patchValue({
    //   ce_multa: this.ce_form_riscos.ce_multa.value || infoParaCalculo["formMulta"],
    //   ce_juros_mora: this.ce_form_riscos.ce_juros_mora.value || infoParaCalculo["formJuros"],
    //   ce_honorarios: this.ce_form_riscos.ce_honorarios.value || infoParaCalculo["formHonorarios"],
    //   ce_multa_sobre_constrato: this.ce_form_riscos.ce_multa_sobre_constrato.value || infoParaCalculo["formMultaSobContrato"]
    // });
    if (!search) {
      this.formDefaultValues = {
        formMulta: this.ce_form_riscos.ce_multa.value || infoParaCalculo["formMulta"],
        formJuros: this.ce_form_riscos.ce_juros_mora.value || infoParaCalculo["formJuros"],
        formHonorarios: this.ce_form_riscos.ce_honorarios.value || infoParaCalculo["formHonorarios"],
        formMultaSobContrato: this.ce_form_riscos.ce_multa_sobre_constrato.value || infoParaCalculo["formMultaSobContrato"],
        formIndice: this.ce_form_riscos.ce_indice.value || infoParaCalculo["formIndice"],
        formIndiceEncargos: this.ce_form_riscos.ce_encargos_contratuais.value || infoParaCalculo["formIndiceEncargos"]
      };
    } else {
      this.formDefaultValues = {
        formMulta: infoParaCalculo["formMulta"] || 0,
        formJuros: infoParaCalculo["formJuros"] || 0,
        formHonorarios: infoParaCalculo["formHonorarios"] || 0,
        formMultaSobContrato: infoParaCalculo["formMultaSobContrato"] || 0,
        formIndice: infoParaCalculo["formIndice"] || "---",
        formIndiceEncargos: infoParaCalculo["formIndiceEncargos"] || 6
      };
    }

  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;
    this.changeFormValues(this.formDefaultValues, search);
    setTimeout(() => {

      let tableDataUpdated = this.tableData.dataRows.map((row, index) => {

        if (index > 0) {
          (row['valorDevedor'] = this.tableData.dataRows[index - 1]['valorDevedorAtualizado']);
          (row['dataBase'] = this.tableData.dataRows[index - 1]['dataBaseAtual']);
        }

        const qtdDias = this.getQtdDias(moment(row["dataBase"]).format("DD/MM/YYYY"), moment(row["dataBaseAtual"]).format("DD/MM/YYYY"));
        const valorDevedor = parseFloat(row['valorDevedor']);

        // - Indices
        if (!isInlineChange) {
          this.ce_form_riscos.ce_indice.value && (row['indiceDB'] = this.ce_form_riscos.ce_indice.value);
          this.ce_form_riscos.ce_indice.value && (row['indiceBA'] = this.ce_form_riscos.ce_indice.value);

          this.ce_form_riscos.ce_indice.value && (row['indiceDataBase'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value, row['dataBase']));
          this.ce_form_riscos.ce_indice.value && (row['indiceDataBaseAtual'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value, row['dataBaseAtual']));

          this.ce_form_riscos.ce_indice.value === "Encargos Contratuais %" && this.ce_form_riscos.ce_encargos_contratuais && (row['indiceDataBaseAtual'] = this.ce_form_riscos.ce_encargos_contratuais.value);
        }

        // Table Values

        // - Descontos
        // -- correcaoPeloIndice (encargos contratuais, inpc, iof, cmi)
        if (this.ce_form_riscos.ce_indice.value === "Encargos Contratuais %" || row['infoParaCalculo']['formIndice'] === "Encargos Contratuais %") {
          row['encargosMonetarios']['correcaoPeloIndice'] = search ? row['encargosMonetarios']['correcaoPeloIndice'] : ((valorDevedor * (row['indiceDataBaseAtual'] / 100) / 30) * qtdDias).toFixed(2);
        } else {
          row['encargosMonetarios']['correcaoPeloIndice'] = search ? row['encargosMonetarios']['correcaoPeloIndice'] : ((valorDevedor / (row['indiceDataBase'] / 100) * (row['indiceDataBaseAtual'] / 100)) - valorDevedor).toFixed(2);
        }

        // -- dias
        row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
        // -- juros 
        row['encargosMonetarios']['jurosAm']['percentsJuros'] = search ? row['encargosMonetarios']['jurosAm']['percentsJuros'] : (((this.formDefaultValues.formJuros || this.ce_form_riscos.ce_juros_mora.value) / 30) * qtdDias).toFixed(2);
        // -- moneyValue
        row['encargosMonetarios']['jurosAm']['moneyValue'] = search ? row['encargosMonetarios']['jurosAm']['moneyValue'] : ((((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice'])) / 30) * qtdDias) * (((this.formDefaultValues.formJuros || this.ce_form_riscos.ce_juros_mora.value) / 100))).toFixed(2);

        // -- multa 
        let multa = search ? row['encargosMonetarios']['multa'] : ((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice']) + parseFloat(row['encargosMonetarios']['jurosAm']['moneyValue'])) * ((this.formDefaultValues.formMulta || this.ce_form_riscos.ce_multa.value) / 100)).toFixed(2);
        if (index === 0) {
          row['encargosMonetarios']['multa'] = multa;
        } else {
          row['encargosMonetarios']['multa'] = "NaN";
          multa = 0;
        }

        row['valorDevedorAtualizado'] = ((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice']) + parseFloat(row['encargosMonetarios']['jurosAm']['moneyValue']) + parseFloat(multa) + (row['tipoLancamento'] === 'credit' ? (row['lancamentos'] * (-1)) : row['lancamentos']))).toFixed(2);

        // Amortizacao
        // this.ce_form_amortizacao.ceFA_saldo_devedor && (row['valorDevedorAtualizado'] = this.ce_form_amortizacao.ceFA_saldo_devedor.value)
        // this.ce_form_amortizacao.ceFA_data_vencimento && (row['dataBase'] = this.ce_form_riscos.ceFA_data_vencimento.value);

        // Forms Total
        this.ce_form_riscos.ce_data_calculo.value && (this.total_data_calculo = moment(this.ce_form_riscos.ce_data_calculo.value).format("DD/MM/YYYY") || this.getCurrentDate());
        const honorarios = row['valorDevedorAtualizado'] * (this.ce_form_riscos.ce_honorarios.value || this.formDefaultValues.formHonorarios) / 100;

        (this.formDefaultValues.formHonorarios || this.ce_form_riscos.ce_honorarios.value) && (this.total_honorarios = honorarios);

        this.last_data_table = [...this.tableData.dataRows].pop();
        let last_date_base_atual = Object.keys(this.last_data_table).length ? this.last_data_table['dataBaseAtual'] : this.total_date_now;
        let last_date_base = Object.keys(this.last_data_table).length ? this.last_data_table['dataBase'] : this.total_date_now;

        this.subtotal_data_calculo = moment(last_date_base).format("DD/MM/YYYY");
        this.total_data_calculo = moment(last_date_base_atual).format("DD/MM/YYYY");
        this.total_data_calculo

        this.min_data = last_date_base_atual;
        // this.total_subtotal = 1000;
        // this.total_grandtotal = this.total_grandtotal + row['valorDevedorAtualizado'];

        if (this.tableData.dataRows.length > 0) {
          this.total_subtotal = this.last_data_table['valorDevedorAtualizado'];
          const valorDevedorAtualizado = parseFloat(this.last_data_table['valorDevedorAtualizado']);

          (this.ce_form_riscos.ce_multa_sobre_constrato || this.formDefaultValues.formMultaSobContrato) && (this.total_multa_sob_contrato = (valorDevedorAtualizado + honorarios) * (this.ce_form_riscos.ce_multa_sobre_constrato.value || this.formDefaultValues.formMultaSobContrato) / 100) || 0;
          this.total_grandtotal = this.total_multa_sob_contrato + honorarios + valorDevedorAtualizado;
        }

        return parseFloat(row['valorDevedorAtualizado']);
      });

      if (origin === 'btn') {
        this.formartTable('Simulação');
        this.toggleUpdateLoading()
        this.alertType = 'calculo-simulado';
      }

      this.tableLoading = false;
    }, 0);
    this.tableData.dataRows.length === 0 && (this.tableLoading = false);
    !isInlineChange && this.toggleUpdateLoading();
  }

  getIndiceDataBase(indice, dataBaseAtual) {
    return parseFloat(this.indice_field.filter(ind => ind.type === indice).map(ind => {
      let date = moment(dataBaseAtual).format("DD/MM/YYYY");

      switch (ind.type) {
        case "INPC/IBGE":
          return !!this.datasINPC[date] ? this.datasINPC[date] : ind.value;
          break;
        case "CDI":
          return !!this.datasCDI[date] ? this.datasCDI[date] : ind.value;
          break;
        case "IGPM":
          return !!this.datasIGPM[date] ? this.datasIGPM[date] : ind.value;
          break;
        case "Encargos Contratuais %":
          return !!this.ce_form_riscos.ce_encargos_contratuais.value ? this.ce_form_riscos.ce_encargos_contratuais.value : ind.value;
          break;
        default:
          break;
      }
    })[0]);
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
    row[innerIndice] = e.target.value;
    row[indiceToChangeInline] = this.getIndiceDataBase(e.target.value, row[columnData]);

    setTimeout(() => {
      this.simularCalc(true);
    }, 500);
  }

  // Mock formulário de riscos
  folderData_field = this.agruparPasta();

  agruparPasta() {
    let pastasFiltros = [];

    this.pastas['data'].map(pasta => pastasFiltros.push(pasta.PASTA));
    const setUnico = new Set(pastasFiltros);

    return [...setUnico];
  }

  contractList_field = [];
  setContrato() {
    this.contractList_field = [];
    this.typeContractList_field = [];
    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.ce_form.ce_pasta.value) {
        this.contractList_field.push(pasta.CONTRATO);
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];
  }

  typeContractList_field = [];
  setTypeContract() {
    this.typeContractList_field = [];
    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.ce_form.ce_pasta.value && pasta.CONTRATO === this.ce_form.ce_contrato.value) {
        this.typeContractList_field.push(pasta.DESCRICAO);
      }
    });

    const setUnico = new Set(this.typeContractList_field);
    this.typeContractList_field = [...setUnico];
  }

  indice_field = [{
    type: "---",
    value: "1"
  }, {
    type: "INPC/IBGE",
    value: "60.872914"
  },
  {
    type: "CDI",
    value: "71.712333"
  },
  {
    type: "IGPM",
    value: "1.24"
  },
  {
    type: "Encargos Contratuais %",
    value: "6"
  }
  ];

  get datasCDI() {
    return this.indicesService.getCDI();
  };
  get datasIGPM() {
    return this.indicesService.getIGPM();
  };
  get datasINPC() {
    return this.indicesService.getINPC();
  };
  get pastas() {
    return this.pastasContratosService.getPastas();
  }
}