import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/user.service';

declare interface TableData {
    headerRow: string[];
    dataRows: Object[];
}

@Component({
    selector: 'table-cmp',
    moduleId: module.id,
    templateUrl: 'table.component.html'
})

export class TableComponent implements OnInit {

    constructor(
        private userService: UserService,
    ) {
    }

    public tableData: TableData;
    public errorMessage: TableData;

    ngOnInit() {
        this.buildDataTable();
    }

    buildDataTable() {
        this.userService.getAll().subscribe(userList => {
            this.tableData = {
                headerRow: ['Data de criação', 'Nome', 'Perfil', 'Status'],
                dataRows: userList,
            };
        }, err => {
            this.errorMessage = err.error.message;
        });
    }
}
