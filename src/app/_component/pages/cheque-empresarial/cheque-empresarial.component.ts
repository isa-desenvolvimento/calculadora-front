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
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payload: ChequeEmpresarial;
  tableData: TableData;
  teste = 123

  dtOptions: DataTables.Settings = {};

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.ceForm = this.formBuilder.group({
      ce_pasta: ['', Validators.required],
      ce_contrato: ['', Validators.required],
      ce_tipo_contrato: []
    });
    this.buildDataTable();

    this.dtOptions = {
      pagingType: 'full_numbers',
    };
  }

  // convenience getter for easy access to form fields
  get f() { return this.ceForm.controls; }

  resetFields() {
    this.ceForm.reset()
  }

  filterContracts() {
    this.tableData.dataRows = this.tableData.dataRows.filter((row) => row["contractRef"] === parseInt(this.f.ce_contrato.value));
  }


  // Mock formulário de riscos
  // Consulta 

  folderData_field = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];

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

  // TODO: Componentizar tabela e passar valores por @input e tratar eventos
  buildDataTable() {
    this.tableData = {
      headerRow: [{
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
      }],
      dataRows: [{
        dataBase: "02/01/1997",
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
        valorDevedorAtualizado: "0"
      },
      {
        dataBase: "02/01/1997",
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
        valorDevedorAtualizado: "0"
      }]
    };
  }

}
