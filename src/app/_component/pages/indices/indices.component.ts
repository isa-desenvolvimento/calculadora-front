import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; // add this 1 of 4
import { IndicesService } from '../../../_services/indices.service';

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'app-indices',
  templateUrl: './indices.component.html',
  styleUrls: ['./indices.component.css']
})

export class IndicesComponent implements OnInit {

  indicesForm: FormGroup;
  tableData: TableData;
  tableLoading = false;
  dtOptions: DataTables.Settings = {};

  updateLoading = false;
  alertType = '';

  listaINPC = [];
  listaCDI = [];
  listaIGPM = [];

  listaAdd = [];

  constructor(
    private formBuilder: FormBuilder,
    private indicesService: IndicesService,
  ) {
  }

  ngOnInit(): void {
    this.indicesForm = this.formBuilder.group({
      indice: ['', Validators.required],
      data: ['', Validators.required],
      valor: ['', Validators.required]
    });

    this.tableData = {
      dataRows: []
    }

    this.dtOptions = {
      paging: true,
      pagingType: 'full_numbers',
      stateSave: true,
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
      },
    };
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  adicionaIndice() {
    const indice = {
      indice : this.indice_form.indice.value,
      data : this.indice_form.data.value,
      valor : this.indice_form.valor.value
    }

    this.tableData.dataRows.push(indice);
    this.indicesForm.reset();
  }

  tranformJSON(indice, json) {
    const indicesFormated = [];

    Object.entries(json).forEach(([key, value]) => {
      indicesFormated.push({
        indice,
        data: this.formatDate(key, "YYYY-DD-MM"),
        valor: value
      })
    })

    return indicesFormated;
  }

  changeIndices() {
    const INDICEINPUT = this.indice_form.indice.value;
    const DATAINPUT = this.indice_form.data.value ? this.formatDate(this.indice_form.data.value, "YYYY-MM-DD") : false;

    let table = [];
    this.tableData.dataRows = [];
    this.tableLoading = true;

    switch (INDICEINPUT) {
      case "INPC/IBGE":
        if (!this.listaINPC.length) this.listaINPC = this.tranformJSON(INDICEINPUT, this.datasINPC);
        table = DATAINPUT ? this.listaINPC.filter(indice => indice.data === DATAINPUT) : this.listaINPC
        break;
      case "CDI":
        if (!this.listaCDI.length) this.listaCDI = this.tranformJSON(INDICEINPUT, this.datasCDI);
        table = DATAINPUT ? this.listaCDI.filter(indice => indice.data === DATAINPUT) : this.listaCDI;
        break
      case "IGPM":
        if (!this.listaIGPM.length) this.listaIGPM = this.tranformJSON(INDICEINPUT, this.datasIGPM);
        table = DATAINPUT ? this.listaIGPM.filter(indice => indice.data === DATAINPUT) : this.listaIGPM;
        break
      default:
        break;
    }

    setTimeout(() => {
      this.tableLoading = false;
      this.tableData.dataRows = table;
      return;
    }, 100);
  }

  changeIndiceTable(e, row, column) {
    const value = column === 'valor' ? parseFloat(e.target.value) : e.target.value;
    const index = this.tableData.dataRows.indexOf(row);
    this.tableData.dataRows[index][column] = value;

    //fazer requisicao para alterar no banco
  }

  deleteRow(row) { }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
  }

  indices_field = ["INPC/IBGE", "CDI", "IGPM"];

  get indice_form() { return this.indicesForm.controls; }

  get datasCDI() {
    return this.indicesService.getCDI();
  };
  get datasIGPM() {
    return this.indicesService.getIGPM();
  };
  get datasINPC() {
    return this.indicesService.getINPC();
  };

}
