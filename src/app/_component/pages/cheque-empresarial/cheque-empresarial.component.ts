import { Component, OnInit } from '@angular/core';
import { ChequeEmpresarial } from '../../../_models/ChequeEmpresarial';

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


  constructor(
  ) { }

  ngOnInit() {
    this.buildDataTable();
  }

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
