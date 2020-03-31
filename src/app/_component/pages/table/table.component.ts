import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../_services/user.service';
import { User } from '../../../_models/user';

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

    public myModel: any;
    public tableData: TableData;
    public errorMessage: string;
    payload: User;

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

    onBlurMethod(e) {
        const rows = e.target.textContent;

        this.payload = {
            id: rows.split('  ')[0],
            createdDate: rows.split('  ')[1],
            username: rows.split('  ')[2],
            profile: rows.split('  ')[3],
            status: rows.split('  ')[4]
        };

        this.userService.updateUser(this.payload)
            .subscribe(
                data => {
                    // TODO: Plmdds
                    location.reload();
                },
                err => {
                    this.errorMessage = err.error.title;
                    // this.loading = false;
                });

    }
}
