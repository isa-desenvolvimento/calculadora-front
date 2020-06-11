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

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  adicionaIndice() {
    this.tableLoading = true;

    const indice = {
      indice: this.indice_form.indice.value,
      data: this.indice_form.data.value,
      valor: this.indice_form.valor.value
    }

    this.indicesService.addIndice(indice).subscribe(resp => {
      this.tableData.dataRows.push(resp);
      this.indicesForm.reset();
      this.alertType = 'indice-incluido';
      this.toggleUpdateLoading()

    }, err => {
      this.alertType = 'registro-nao-incluido';
      //this.toggleUpdateLoading()
      //this.errorMessage = "Falha ao atualizar risco."; //registro-nao-incluido
    });

    this.tableLoading = false;
  }

  changeIndices() {
    this.tableData.dataRows = [];
    this.tableLoading = true;
    const DATAINPUT = this.indice_form.data.value ? this.formatDate(this.indice_form.data.value, "YYYY-MM-DD") : false;

    this.indicesService.getIndice(this.indice_form.indice.value).subscribe(indices => {
      console.log(indices);
      
      this.tableData.dataRows = indices;
      setTimeout(() => {
        this.tableLoading = false;
        return;
      }, 100);
    })
    
    //if (DATAINPUT) table = table.filter(indice => indice.data === DATAINPUT)

  }

  changeIndiceTable(e, row, column) {
    const value = column === 'valor' ? parseFloat(e.target.value) : e.target.value;
    const index = this.tableData.dataRows.indexOf(row);
    this.tableData.dataRows[index][column] = value;

    this.indicesService.updateIndice(row.id, this.tableData.dataRows[index]).subscribe(resp => {
      this.alertType = 'indice-incluido';
      this.toggleUpdateLoading()
    }, err => {
      this.alertType = 'registro-nao-incluido';
      //this.toggleUpdateLoading()
      //this.errorMessage = "Falha ao atualizar risco."; //registro-nao-incluido
    });
  }

  deleteRow(row) {
    // this.indicesService.removeIndice(row.id).subscribe(resp => {
    //   this.alertType = 'registro-excluido';
    //   this.toggleUpdateLoading()
    // }, err => {
    //   this.alertType = 'registro-nao-incluido';
    //   //this.toggleUpdateLoading()
    //   //this.errorMessage = "Falha ao atualizar risco."; //registro-nao-incluido
    // });
   }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
  }

  indices_field = ["INPC/IBGE", "CDI", "IGPM"];

  get indice_form() { return this.indicesForm.controls; }

  get getIndice() {
    return this.indicesService.getIndice(this.indice_form.indice.value);
  }
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
