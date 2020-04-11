import { Component, OnInit } from '@angular/core';
import { ChequeEmpresarial } from '../../../_models/ChequeEmpresarial';
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
  payload: ChequeEmpresarial;
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
    this.ceFormAmortizacao = this.formBuilder.group({
      ce_data_vencimento: [],
      ce_saldo_devedor: []
    });
    this.tableData = {
      headerRow: [],
      dataRows: []
    }
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

  filterContracts() {
    this.tableLoading = true;
    setTimeout(() => {
      this.tableData.dataRows = this.Carga.filter((row) => row["contractRef"] === parseInt(this.ce_form.ce_contrato.value));
      this.tableLoading = false;
    }, 500);
  }

  simularCalc() {
    let teste = this.tableData.dataRows.map(row => {
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

      this.ce_form_riscos.ce_data_calculo && (this.total_date_now = new Date(Date.now()).toJSON());
      this.ce_form_riscos.ce_data_calculo && (this.total_data_calculo = this.ce_form_riscos.ce_data_calculo.value);
      this.ce_form_riscos.ce_honorarios && (this.total_honorarios = this.ce_form_riscos.ce_honorarios.value);
      this.ce_form_riscos.ce_multa_sobre_constrato && (this.total_multa_sob_contrato = this.ce_form_riscos.ce_multa_sobre_constrato.value);

      this.ce_form_riscos.ce_indice && (row['indiceDataBase'] = this.ce_form_riscos.ce_indice.value);
      this.ce_form_riscos.ce_encargos_contratuais && (row['indiceEncargosContratuais'] = this.ce_form_riscos.ce_encargos_contratuais.value);
      this.ce_form_riscos.ce_saldo_devedor && (row['valorDevedorAtualizado'] = this.ce_form_riscos.ce_saldo_devedor.value)
      this.ce_form_riscos.ce_data_vencimento && (row['dataBase'] = this.ce_form_riscos.ce_data_vencimento.value);
      row['encargosMonetarios'].multa = this.ce_form_riscos['ce_multa'].value;
    });
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

  indice_field = ["INPC", "CDI", "IGPM"];

  buildHeaderTable() {
    this.tableData.headerRow = [{
      dataBase: {
        title: "data Base",
        nested: false
      },
      indiceDataBase: {
        title: "indice Data Base",
        nested: false
      },
      dataBaseAtual: {
        title: "data Base Atual",
        nested: false
      },
      indiceDataAtual: {
        title: "indice Data Atual",
        nested: false
      },
      valorDevedor: {
        title: "valor Devedor",
        nested: false
      },
      encargosMonetarios: {
        title: "encargos Monetarios",
        nested: false
      },
      correcaoPeloIndice: {
        title: "correcao Pelo Indice",
        nested: false
      },
      jurosAm: {
        title: "juros Ao mês",
        nested: false
      },
      dias: {
        title: "dias",
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
        title: "multa",
        nested: false
      },
      lancamentos: {
        title: "lançamentos",
        nested: false
      },
      valorDevedorAtualizado: {
        title: "valor Devedor Atualizado",
        nested: false
      }
    }];
  }

  get Carga() {
    return [{
      dataBase: "02/01/1997",
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
      indiceEncargosContratuais: 1,
      indiceDataBase: "INPC",
      dataBaseAtual: "02/12/2010",
      indiceDataAtual: "100",
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
