import { Component, OnInit } from '@angular/core';
import { Lancamento } from '../../../_models/ChequeEmpresarial';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare interface TableData {
  headerRow: Array<Object>;
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

  // total
  total_date_now: any;
  total_data_calculo: any;
  total_honorarios: any;
  total_multa_sob_contrato: any;

  dtOptions: DataTables.Settings = {};

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.ceForm = this.formBuilder.group({
      ce_pasta: [],
      ce_contrato: ['', Validators.required],
      ce_tipo_contrato: []
    });
    this.ceFormRiscos = this.formBuilder.group({
      ce_indice: [],
      ce_encargos_monietarios: [],
      ce_data_calculo: [],
      ce_ultima_atualizacao: [],
      ce_encargos_contratuais: [],
      ce_multa: [],
      ce_juros_mora: [],
      ce_honorarios: [],
      ce_multa_sobre_constrato: []
    });
    this.tableData = {
      headerRow: [],
      dataRows: []
    }
    this.ceFormAmortizacao = this.formBuilder.group({
      ceFA_data_vencimento: [],
      ceFa_saldo_devedor: [],
      ceFA_data_base_atual: ['', Validators.required],
      ceFA_valor_lancamento: ['', Validators.required],
      ceFA_tipo_lancamento: ['', Validators.required]
    });
    this.buildHeaderTable();

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

  // convenience getter for easy access to form fields
  get ce_form() { return this.ceForm.controls; }
  get ce_form_riscos() { return this.ceFormRiscos.controls; }
  get ce_form_amortizacao() { return this.ceFormAmortizacao.controls; }

  resetFields() {
    this.ceForm.reset()
  }

  incluirLancamentos() {
    this.tableLoading = true;

    let localDataBase = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFA_data_vencimento.value : this.tableData.dataRows[0]["dataBase"];
    let localValorDevedor = this.tableData.dataRows.length === 0 ? this.ce_form_amortizacao.ceFa_saldo_devedor.value : this.tableData.dataRows[0]["valorDevedorAtualizado"];

    console.log(localDataBase);
    setTimeout(() => {
      this.payloadLancamento = ({
        dataBase: localDataBase,
        indiceDB: null,
        indiceDataBase: null,
        indiceBA: null,
        indiceDataBaseAtual: null,
        indiceEncargosContratuais: null,
        dataBaseAtual: this.ce_form_amortizacao.ceFA_data_base_atual.value,
        indiceDataAtual: null,
        valorDevedor: localValorDevedor,
        encargosMonetarios: {
          correcaoPeloIndice: null,
          jurosAm: {
            dias: null,
            percents: null,
            moneyValue: null,
          },
          multa: null,
        },
        lancamentos: this.ce_form_amortizacao.ceFA_valor_lancamento.value,
        tipoLancamento: this.ce_form_amortizacao.ceFA_tipo_lancamento.value,
        valorDevedorAtualizado: null,
        contractRef: null
      });
      this.tableData.dataRows.push(this.payloadLancamento);
      this.tableLoading = false;
    }, 0);

  }

  filterContracts() {
    this.tableLoading = true;
    setTimeout(() => {
      this.tableData.dataRows = this.Carga.filter((row) => row["contractRef"] === parseInt(this.ce_form.ce_contrato.value || 0));
      this.tableLoading = false;
    }, 0);
  }

  simularCalc() {
    this.tableLoading = true;
    setTimeout(() => {
      this.tableData.dataRows.map(row => {
        //   dataBaseAtual: "02/12/2010",
        //     indiceDataAtual: "100",
        //       valorDevedor: "233300",
        //         encargosMonetarios: {
        //   correcaoPeloIndice: "1222",
        //     jurosAm: {
        //     dias: "10",
        //       percents: "2",
        //         moneyValue: "1000000",
        //   },
        //   multa: "30000",
        // },
        // lancamentos: "131231",

        // this.ce_form.ce_encargos_monietarios && (row['wayner'] = this.ce_form_riscos.ce_encargos_monietarios.value);
        // this.ce_form_riscos.ce_ultima_atualizacao && (row['wayner'] = this.ce_form_riscos.ce_ultima_atualizacao.value);
        // this.ce_form_riscos.ce_juros_mora && (row['wayner'] = this.ce_form_riscos.ce_juros_mora.value);

        // Forms
        this.ce_form_riscos.ce_data_calculo && (this.total_date_now = new Date(Date.now()).toJSON());
        this.ce_form_riscos.ce_data_calculo && (this.total_data_calculo = this.ce_form_riscos.ce_data_calculo.value);
        this.ce_form_riscos.ce_honorarios && (this.total_honorarios = this.ce_form_riscos.ce_honorarios.value);
        this.ce_form_riscos.ce_multa_sobre_constrato && (this.total_multa_sob_contrato = this.ce_form_riscos.ce_multa_sobre_constrato.value);


        // Table Values

        // Indices
        this.ce_form_riscos.ce_indice && (row['indiceDB'] = this.ce_form_riscos.ce_indice.value);
        this.ce_form_riscos.ce_indice && (row['indiceBA'] = this.ce_form_riscos.ce_indice.value);
        this.ce_form_riscos.ce_indice && (row['indiceDataBase'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value));
        this.ce_form_riscos.ce_indice && (row['indiceDataBaseAtual'] = this.getIndiceDataBase(this.ce_form_riscos.ce_indice.value));

        // Amortizacao
        // this.ce_form_amortizacao.ceFA_saldo_devedor && (row['valorDevedorAtualizado'] = this.ce_form_amortizacao.ceFA_saldo_devedor.value)
        // this.ce_form_amortizacao.ceFA_data_vencimento && (row['dataBase'] = this.ce_form_riscos.ceFA_data_vencimento.value);

        this.ce_form_riscos.ce_encargos_contratuais && (row['indiceEncargosContratuais'] = this.ce_form_riscos.ce_encargos_contratuais.value);
        row['encargosMonetarios'].multa = this.ce_form_riscos['ce_multa'].value;

        this.tableLoading = false;
      });
    }, 0);

  }

  getIndiceDataBase(indice) {
    return this.indice_field.filter(ind => ind.type === indice).map(ind => ind.value)
  }

  updateInlineIndice(e, row, indiceToChangeInline) {
    row[indiceToChangeInline] = this.getIndiceDataBase(e.target.value);
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

  indice_field = [{
    type: "---",
    value: "0"
  }, {
    type: "INPC",
    value: "60,872914"
  },
  {
    type: "CDI",
    value: "71,712333"
  },
  {
    type: "IGPM",
    value: "1,24"
  }
  ];

  buildHeaderTable() {
    this.tableData.headerRow = [{
      dataBase: {
        title: "Data Base",
        nested: false
      },
      dataBaseAtual: {
        title: "Data Base Atual",
        nested: false
      },
      indiceDB: {
        title: "Indíce",
        nested: false
      },
      indiceDataBase: {
        title: "Indíce Data Base",
        nested: false
      },
      indiceBA: {
        title: "Indíce",
        nested: false
      },
      indiceDataBaseAtual: {
        title: "Indíce Data Base Atual",
        nested: false
      },
      valorDevedor: {
        title: "Valor Devedor",
        nested: false
      },
      encargosMonetarios: {
        title: "Encargos Monetarios",
        nested: false
      },
      correcaoPeloIndice: {
        title: "Correção Pelo Indíce",
        nested: false
      },
      jurosAm: {
        title: "Juros Ao mês",
        nested: false
      },
      dias: {
        title: "Dias",
        nested: false
      },
      percents: {
        title: "%",
        nested: false
      },
      moneyValue: {
        title: "R$",
        nested: false
      },
      multa: {
        title: "Multa",
        nested: false
      },
      lancamentos: {
        title: "Lançamentos",
        nested: false
      },
      valorDevedorAtualizado: {
        title: "Valor Devedor Atualizado",
        nested: false
      }
    }];
  }

  get Carga() {
    return [{
      dataBase: "02/01/1997",
      indiceDB: "CDI",
      indiceDataBase: "67,30",
      indiceBA: "IGPM",
      indiceDataBaseAtual: "33,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1222",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "IGPM",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "11,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "37,30",
      indiceBA: "CDI",
      indiceDataBaseAtual: "18,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "13,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "98,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "12,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "22,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "11,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "10,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    }, {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    },
    {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 0
    },
    {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 1
    },
    {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 1
    },
    {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 1
    },
    {
      dataBase: "02/01/1997",
      indiceDB: "INPC",
      indiceDataBase: "67,30",
      indiceBA: "INPC",
      indiceDataBaseAtual: "38,29",
      indiceEncargosContratuais: 1,
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "10067,30",
      valorDevedor: "233300",
      encargosMonetarios: {
        correcaoPeloIndice: "1233",
        jurosAm: {
          dias: "10",
          percents: "2",
          moneyValue: "1000000",
        },
        multa: "30000",
      },
      lancamentos: "131231",
      valorDevedorAtualizado: "0",
      contractRef: 2
    }];
  }

}
