import { Component, OnInit, ViewChild } from '@angular/core';
import { LogService } from '../../../_services/log.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PastasContratosService } from '../../../_services/pastas-contratos.service';
import { DataTableDirective } from 'angular-datatables';

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
  updateLoading = false;
  alertType = '';
  row: {};

  tableData: TableData;
  dtOptions: DataTables.Settings = {};

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

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
      paging: true,
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
      },

      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        // Unbind first in order to avoid any duplicate handler
        // (see https://github.com/l-lin/angular-datatables/issues/87)
        $('.details-control', row).unbind('click');
        $('.details-control', row).bind('click', (el) => {
          this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            let selectedRow = dtInstance.row($(row));

            el.currentTarget.children[0].classList.toggle('nc-simple-add')
            el.currentTarget.children[0]['style'].color = el.currentTarget.children[0]['style'].color === 'red' ? 'green' : 'red';
            el.currentTarget.children[0].classList.toggle('nc-simple-remove')

            if (selectedRow.child.isShown()) {
              selectedRow.child.hide();
            } else {
              selectedRow.child(this.detailsRow(this.row)).show();
            }
          });
        });
        return row;
      }
    };
  }

  toggleDetails(row) {
    this.row = row.infoTabela
  }

  detailsRow(item: any) {
    const tableCheque = item
    return tableCheque;
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  pesquisarContratos() {
    this.tableLoading = true;

    const pasta = this.log_form.log_pasta.value;
    const contrato = this.log_form.log_contrato.value;
    const tipoContrato = this.log_form.log_tipoContrato.value;

    this.logService.getLog(pasta, contrato, tipoContrato).subscribe(logs => {
      this.tableData.dataRows = logs;
      this.tableLoading = false;
    }, err => {
      this.tableLoading = false;
      this.alertType = 'sem-registros';
      this.toggleUpdateLoading()
    });
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
