import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './_component/login/login.component';
import { UserComponent } from './_component/pages/user/user.component';
import { TableComponent } from './_component/pages/table/table.component';
import { DashboardComponent } from './_component/dashboard/dashboard.component';
import { ChequeEmpresarialComponent } from './_component/pages/cheque-empresarial/cheque-empresarial.component';
import { AdminLayoutComponent } from './_component/layouts/admin-layout/admin-layout.component';

import { SidebarModule } from './_component/sidebar/sidebar.module';
import { NavbarModule} from './_component/navbar/navbar.module';
import { ToastrModule } from "ngx-toastr";

import { DataTablesModule } from 'angular-datatables';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserComponent,
    TableComponent,
    DashboardComponent,
    AdminLayoutComponent,
    ChequeEmpresarialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    DataTablesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
