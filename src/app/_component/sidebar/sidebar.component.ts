import { Component, OnInit } from "@angular/core";
import {
  getPermissao,
} from "../util/util";

export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  roles?: any;
}

export const ROUTES: RouteInfo[] = [
  {
    path: "/cheque-empresarial",
    title: "Cheque Empresarial",
    icon: "nc-bank",
    class: "",
  },
  {
    path: "/parcelado-pre",
    title: "Parcelado Pré",
    icon: "nc-credit-card",
    class: "",
  },
  {
    path: "/parcelado-pos",
    title: "Parcelado Pós",
    icon: "nc-credit-card",
    class: "",
  },
  { path: "/indices", title: "Índices", icon: "nc-sound-wave", class: "" },
  { path: "/user", title: "Usuário", icon: "nc-single-02", class: "", roles: ['admin'] },
  { path: "/log", title: "Auditoria", icon: "nc-paper", class: "" },
];

@Component({
  moduleId: module.id,
  selector: "sidebar-cmp",
  templateUrl: "sidebar.component.html",
})
export class SidebarComponent implements OnInit {
  public username = "Calculadora"; // localStorage.getItem("username");
  public menuItems: any[];
  ngOnInit() {
    this.menuItems = ROUTES.filter((menuItem) => {
      if (menuItem?.roles) {
        if (getPermissao(menuItem?.roles)) {
          return menuItem
        }
      } else {
        return menuItem
      }
    });
  }
}
