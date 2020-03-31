import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';


@Component({
    selector: 'user-cmp',
    moduleId: module.id,
    templateUrl: 'user.component.html'
})

export class UserComponent implements OnInit{
    errorMessage: String = '';
    table: any = {};
    
    name = new FormControl('userForm');

    userForm = new FormGroup({
        username: new FormControl(''),
        profile: new FormControl(''),
        status: new FormControl('')
    });

    ngOnInit(){
        this.table.headerRow = [
            'Nome',
            'Perfil',
            'Status'
        ];

        this.table.dataRows = [
            'tetse',
            'Admin',
            'Inativo'
        ];
    }
}
