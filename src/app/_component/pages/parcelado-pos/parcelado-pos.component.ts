import { Component, OnInit } from '@angular/core';

import { Lancamento } from '../../../_models/ChequeEmpresarial';
import { ChequeEmpresarialService } from '../../../_services/cheque-empresarial.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; // add this 1 of 4

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'parcelado-pos-cmp',
  moduleId: module.id,
  templateUrl: 'parcelado-pos.component.html'
})

export class ParceladoPosComponent implements OnInit {

  posForm: FormGroup;
  posFormRiscos: FormGroup;
  posFormAmortizacao: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payloadLancamento: Lancamento;
  tableData: TableData;
  tableLoading = false;
  updateLoading = false;
  updateLoadingBtn = false;
  controleLancamentos = 0;

  // total
  total_date_now: any;
  total_data_calculo: any;
  total_honorarios = 0;
  total_multa_sob_contrato = 0;
  total_subtotal = 0;
  total_grandtotal = 0;

  dtOptions: DataTables.Settings = {};

  constructor(
    private formBuilder: FormBuilder,
    private chequeEmpresarialService: ChequeEmpresarialService,
  ) {
  }

  ngOnInit() {
    // this.pesquisarContratos();

    this.posForm = this.formBuilder.group({
      pos_pasta: [],
      pos_contrato: ['', Validators.required],
      pos_tipo_contrato: []
    });
    this.posFormRiscos = this.formBuilder.group({
      pos_indice: [],
      pos_encargos_monietarios: [],
      pos_data_calculo: this.getCurrentDate('YYYY-MM-DD'),
      pos_encargos_contratuais: [],
      pos_multa: [],
      pos_juros_mora: [],
      pos_honorarios: [],
      pos_multa_sobre_constrato: [],
      pos_desagio: []
    });
    this.tableData = {
      dataRows: []
    }
    this.posFormAmortizacao = this.formBuilder.group({
      posFA_data_vencimento: [],
      posFa_saldo_devedor: [],
      posFA_data_base_atual: ['', Validators.required],
      posFA_valor_lancamento: ['', Validators.required],
      posFA_tipo_lancamento: ['', Validators.required],
      posFA_tipo_amortizacao: []
    });

    this.dtOptions = {
      paging: false,
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
    this.tableData.dataRows.forEach(lancamento => {

      this.updateLoadingBtn = true;
      let lancamentoLocal = { ...lancamento };
      lancamentoLocal['encargosMonetarios'] = JSON.stringify(lancamentoLocal['encargosMonetarios']);
      lancamentoLocal['valorDevedor'] = parseFloat(lancamentoLocal['valorDevedor']);
      lancamentoLocal['valorDevedorAtualizado'] = parseFloat(lancamentoLocal['valorDevedorAtualizado']);
      lancamentoLocal['contractRef'] = parseFloat(lancamentoLocal['contractRef']);

      if (lancamentoLocal["id"]) {
        this.chequeEmpresarialService.updateLancamento(lancamentoLocal).subscribe(chequeEmpresarialList => {
          this.updateLoadingBtn = false;
          this.controleLancamentos = this.controleLancamentos + 1;
          if (this.tableData.dataRows.length === this.controleLancamentos) {
            this.updateLoading = true;
          }
        }, err => {
          this.errorMessage = "Falha ao atualizar risco.";
        });
      } else {
        this.chequeEmpresarialService.addLancamento(lancamentoLocal).subscribe(chequeEmpresarialListUpdated => {
          this.updateLoadingBtn = false;
          this.controleLancamentos = this.controleLancamentos + 1;
          if (this.tableData.dataRows.length === this.controleLancamentos) {
            this.updateLoading = true;
          }
          lancamento["id"] = lancamentoLocal["id"] = chequeEmpresarialListUpdated["id"];
        }, err => {
          this.errorMessage = "Falha ao atualizar risco.";
        });

      }
    })
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  // convenience getter for easy access to form fields
  get pos_form() { return this.posForm.controls; }
  get pos_form_riscos() { return this.posFormRiscos.controls; }
  get pos_form_amortizacao() { return this.posFormAmortizacao.controls; }

  resetFields(form) {
    this[form].reset()
  }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}` || 0;
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  getLastLine() {
    return this.tableData.dataRows.length === 0 ? this.tableData.dataRows.length : this.tableData.dataRows.length - 1;
  }

  incluirLancamentos() {
    this.tableLoading = true;

    const localDataBase = this.tableData.dataRows.length === 0 ? this.pos_form_amortizacao.posFA_data_vencimento.value : this.tableData.dataRows[this.getLastLine()]["dataBaseAtual"];
    const localValorDevedor = this.tableData.dataRows.length === 0 ? this.pos_form_amortizacao.posFa_saldo_devedor.value : this.tableData.dataRows[this.getLastLine()]["valorDevedorAtualizado"];

    this.total_date_now = moment(localDataBase).format("DD/MM/YYYY");
    this.total_data_calculo = moment(this.pos_form_riscos.pos_data_calculo.value).format("DD/MM/YYYY") || this.getCurrentDate();

    const localTypeIndice = this.pos_form_riscos.pos_indice.value;
    const localTypeValue = this.getIndiceDataBase(localTypeIndice);

    const localLancamentos = this.pos_form_amortizacao.posFA_valor_lancamento.value;
    const localTipoLancamento = this.pos_form_amortizacao.posFA_tipo_lancamento.value;
    const localDataBaseAtual = this.pos_form_amortizacao.posFA_data_base_atual.value;

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
        contractRef: this.pos_form.pos_contrato.value || 0,
        ultimaAtualizacao: '',

      });
      this.pos_form_amortizacao.posFA_tipo_amortizacao.value ? this.tableData.dataRows.unshift(this.payloadLancamento) : this.tableData.dataRows.push(this.payloadLancamento);
      this.tableLoading = false;
    }, 0);
    this.resetFields('posFormAmortizacao');
    this.simularCalc(true);
  }

  pesquisarContratos() {
    this.tableLoading = true;
    this.chequeEmpresarialService.getAll().subscribe(chequeEmpresarialList => {
      this.tableData.dataRows = chequeEmpresarialList.filter((row) => row["contractRef"] === parseInt(this.pos_form.pos_contrato.value || 0)).map(cheque => {
        cheque.encargosMonetarios = JSON.parse(cheque.encargosMonetarios)
        return cheque;
      });
      this.tableLoading = false;
    }, err => {
      this.errorMessage = err.error.message;
    });
    setTimeout(() => {
      this.simularCalc(true);
    }, 1000);
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

    this.simularCalc(true);
  }

  formatDate(row) {
    return moment(row['dataBase']).format("DD/MM/YYYY");
  }

  simularCalc(isInlineChange = false) {
    this.tableLoading = true;
    setTimeout(() => {
      let tableDataUpdated = this.tableData.dataRows.map(row => {

        const qtdDias = this.getQtdDias(moment(row["dataBase"]).format("DD/MM/YYYY"), moment(row["dataBaseAtual"]).format("DD/MM/YYYY"));
        const valorDevedor = parseFloat(row['valorDevedor']);

        // - Indices
        if (!isInlineChange) {
          this.pos_form_riscos.pos_indice && (row['indiceDB'] = this.pos_form_riscos.pos_indice.value);
          this.pos_form_riscos.pos_indice && (row['indiceBA'] = this.pos_form_riscos.pos_indice.value);

          this.pos_form_riscos.pos_indice && (row['indiceDataBase'] = this.getIndiceDataBase(this.pos_form_riscos.pos_indice.value));
          this.pos_form_riscos.pos_indice && (row['indiceDataBaseAtual'] = this.getIndiceDataBase(this.pos_form_riscos.pos_indice.value));

          this.pos_form_riscos.pos_indice.value === "Encargos Contratuais %" && this.pos_form_riscos.pos_encargos_contratuais && (row['indiceDataBaseAtual'] = this.pos_form_riscos.pos_encargos_contratuais.value);
        }

        // Table Values

        // - Descontos
        // -- correcaoPeloIndice (encargos contratuais, inpc, iof, cmi)
        row['encargosMonetarios']['correcaoPeloIndice'] = ((valorDevedor * (row['indiceDataBaseAtual'] / 100) / 30) * qtdDias).toFixed(2);

        // -- dias
        row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
        // -- juros 
        row['encargosMonetarios']['jurosAm']['percentsJuros'] = ((this.pos_form_riscos.pos_juros_mora.value / 30) * qtdDias).toFixed(2);
        // -- moneyValue
        row['encargosMonetarios']['jurosAm']['moneyValue'] = ((((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice'])) / 30) * qtdDias) * ((this.pos_form_riscos.pos_juros_mora.value / 100))).toFixed(2);

        // -- multa 
        row['encargosMonetarios']['multa'] = ((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice']) + parseFloat(row['encargosMonetarios']['jurosAm']['moneyValue'])) * (this.pos_form_riscos.pos_multa.value / 100)).toFixed(2);
        row['valorDevedorAtualizado'] = ((valorDevedor + parseFloat(row['encargosMonetarios']['correcaoPeloIndice']) + parseFloat(row['encargosMonetarios']['jurosAm']['moneyValue']) + parseFloat(row['encargosMonetarios']['multa']) + (row['tipoLancamento'] === 'credit' ? (row['lancamentos'] * (-1)) : row['lancamentos']))).toFixed(2);

        // Amortizacao
        // this.pos_form_amortizacao.posFA_saldo_devedor && (row['valorDevedorAtualizado'] = this.pos_form_amortizacao.posFA_saldo_devedor.value)
        // this.pos_form_amortizacao.posFA_data_vencimento && (row['dataBase'] = this.pos_form_riscos.posFA_data_vencimento.value);

        // Forms Total
        this.pos_form_riscos.pos_data_calculo && (this.total_data_calculo = moment(this.pos_form_riscos.pos_data_calculo.value).format("DD/MM/YYYY") || this.getCurrentDate());
        this.pos_form_riscos.pos_honorarios && (this.total_honorarios = (row['valorDevedorAtualizado'] * this.pos_form_riscos.pos_honorarios.value / 100));
        this.pos_form_riscos.pos_multa_sobre_constrato && (this.total_multa_sob_contrato = this.pos_form_riscos.pos_multa_sobre_constrato.value);

        // this.total_subtotal = 1000;
        // this.total_grandtotal = this.total_grandtotal + row['valorDevedorAtualizado'];

        this.tableLoading = false;
        return parseFloat(row['valorDevedorAtualizado']);
      });

      if (this.tableData.dataRows.length > 0) {
        this.total_grandtotal = tableDataUpdated.reduce(function (acumulador, valorAtual) {
          return acumulador + valorAtual;
        }) + this.total_multa_sob_contrato + this.total_honorarios;

        this.total_subtotal = tableDataUpdated.reduce(function (acumulador, valorAtual) {
          return acumulador + valorAtual;
        });
      }

    }, 0);
    this.tableData.dataRows.length === 0 && (this.tableLoading = false);
    !isInlineChange && this.toggleUpdateLoading();
  }

  getIndiceDataBase(indice) {
    return parseFloat(this.indipos_field.filter(ind => ind.type === indice).map(ind => ind.value)[0]);
  }

  deleteRow(id) {
    this.chequeEmpresarialService.removeLancamento(id).subscribe(() => {
      this.tableData.dataRows.splice(this.tableData.dataRows.indexOf(id));
    })
  }

  updateInlineIndice(e, row, innerIndice, indiceToChangeInline) {
    row[innerIndice] = e.target.value;
    row[indiceToChangeInline] = this.getIndiceDataBase(e.target.value);
    row["indiceBA"] = e.target.value;

    this.simularCalc(true);
  }

  // Mock formulário de riscos
  // Consulta 

  folderData_field = [1, 2, 3, 5, 6, 7, 8, 9, 10];

  contractList_field = [{
    title: "AA",
    id: "0",
    fodlerRef: "1",
  }, {
    title: "BB",
    id: "1",
    fodlerRef: "1",
  }, {
    title: "CC",
    id: "2",
    fodlerRef: "2",
  },
  {
    title: "DD",
    id: "3",
    fodlerRef: "3",
  },
  {
    title: "EE",
    id: "4",
    fodlerRef: "1",
  }];

  typeContractList_field = ["Cheque empresarial", "Parcelado", "Pós"];

  indipos_field = [{
    type: "---",
    value: "1"
  }, {
    type: "INPC",
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

  get Carga() {
    return [
      {
        dataBase: "2020-04-23",
        indiceDB: null,
        indiceDataBase: null,
        indiceBA: null,
        indiceDataBaseAtual: null,
        dataBaseAtual: "2020-04-25",
        valorDevedor: 100000,
        encargosMonetarios: {
          correcaoPeloIndice: "0.00",
          jurosAm: {
            dias: 2,
            percentsJuros: "66.67"
          },
          multa: "0.00"
        },
        lancamentos: 1000,
        tipoLancamento: "debit",
        valorDevedorAtualizado: "101066.67",
        contractRef: 0
      },
      {
        dataBase: "2020-04-25",
        indiceDB: null,
        indiceDataBase: null,
        indiceBA: null,
        indiceDataBaseAtual: null,
        dataBaseAtual: "2020-04-28",
        valorDevedor: 100000,
        encargosMonetarios: {
          correcaoPeloIndice: "0.00",
          jurosAm: {
            dias: 2,
            percentsJuros: "66.67"
          },
          multa: "0.00"
        },
        lancamentos: 1000,
        tipoLancamento: "debit",
        valorDevedorAtualizado: "101066.67",
        contractRef: 0
      }];
  }

}