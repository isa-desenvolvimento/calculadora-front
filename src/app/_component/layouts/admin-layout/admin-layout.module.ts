import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { AdminLayoutRoutes } from "./admin-layout.routing";

import { ChequeEmpresarialComponent } from "../../pages/cheque-empresarial/cheque-empresarial.component";
import { UserComponent } from "../../pages/user/user.component";
import { TableComponent } from "../../pages/table/table.component";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ParceladoPreComponent } from "../../pages/parcelado-pre/parcelado-pre.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
  ],
  declarations: [ChequeEmpresarialComponent, UserComponent, TableComponent, ParceladoPreComponent],
})
export class AdminLayoutModule {}
