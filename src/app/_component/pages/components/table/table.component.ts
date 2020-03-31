import { Component, OnInit } from '@angular/core';

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
    selector: 'table-cmp',
    moduleId: module.id,
    templateUrl: 'table.component.html'
})

export class TableComponent implements OnInit{
    public tableData1: TableData;
    ngOnInit(){
        this.tableData1 = {
            headerRow: [ 'Data', 'Nome', 'Perfil', 'Status'],
            dataRows: [
                ['12/11/2019', 'Dakota Rice', 'Consulta', 'Ativo'],
                ['12/11/2019', 'Minerva Hooper', 'Consulta', 'Ativo'],
                ['12/11/2019', 'Sage Rodriguez', 'Consulta', 'Ativo'],
                ['12/11/2019', 'Doris Greene', 'Consulta', 'Ativo'],
                ['12/11/2019', 'Mason Porter', 'Consulta', 'Ativo']
            ]
        };
    }
}
