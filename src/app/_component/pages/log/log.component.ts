import { Component, OnInit } from '@angular/core';
import { LogService } from '../../../_services/log.service';
import * as moment from 'moment';

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

  constructor(private logService: LogService) { }

  ngOnInit(): void {
    this.tableData = {
      dataRows: []
    }
    this.dtOptions = {
      paging: false,
      searching:false,
      scrollY:        "300px",
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

    this.setTableLog()
  }
  
  setTableLog () {
    this.tableLoading = true;

    this.logService.getLog().subscribe(log => {
      this.tableData.dataRows = log;
      this.tableLoading = true;

    })
  }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
  }

}
