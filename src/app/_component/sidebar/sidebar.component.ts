import { Component, OnInit } from '@angular/core';


export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '/admin/cheque-empresarial',     title: 'Cheque Empresarial',         icon:'nc-bank',       class: '' },
    //{ path: '/admin/parcelado-pre',     title: 'Parcelado Pré',         icon:'nc-credit-card',       class: '' },
    //{ path: '/admin/parcelado-pos',     title: 'Parcelado Pós',         icon:'nc-credit-card',       class: '' },
    { path: '/admin/user',          title: 'Usuário',      icon:'nc-single-02',  class: '' }
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {
    public username: string = localStorage.getItem('username');
    public menuItems: any[];
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
}
