import { Component, OnInit } from '@angular/core';
import { LogService } from '../../../_services/log.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PastasContratosService } from '../../../_services/pastas-contratos.service';

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {
  tableLoading = false;
  tableData: TableData;
  dtOptions: DataTables.Settings = {};

  logForm: FormGroup;


  constructor(
    private logService: LogService,
    private formBuilder: FormBuilder,
    private pastasContratosService: PastasContratosService
  ) { }

  ngOnInit(): void {
    this.logForm = this.formBuilder.group({
      log_pasta: ['', Validators.required],
      log_contrato: ['', Validators.required],
      log_tipo_contrato: ['', Validators.required]
    });

    this.tableData = {
      dataRows: []
    }
    this.dtOptions = {
      paging: false,
      searching: false,
      scrollY: "300px",
      scrollCollapse: true,
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

  pesquisarContratos() {
    this.tableLoading = true;

    this.logService.getLog().subscribe(log => {
      this.tableData.dataRows = log;
      this.tableLoading = false;
    })
  }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
  }


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
      if (pasta.PASTA === this.log_form.log_pasta.value) {
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
      if (pasta.PASTA === this.log_form.log_pasta.value && pasta.CONTRATO === this.log_form.log_contrato.value) {
        this.typeContractList_field.push(pasta.DESCRICAO);
      }
    });

    const setUnico = new Set(this.typeContractList_field);
    this.typeContractList_field = [...setUnico];
  }

  get pastas() {
    return this.pastasContratosService.getPastas();
  }

  get log_form() { return this.logForm.controls; }
}
