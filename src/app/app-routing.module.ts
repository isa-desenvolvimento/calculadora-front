import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { DashboardComponent } from './_component/dashboard/dashboard.component';
import { LoginComponent } from './_component/login/login.component';
import { AdminLayoutComponent } from './_component/layouts/admin-layout/admin-layout.component';
import { UserComponent } from './_component/pages/user/user.component';
import { ChequeEmpresarialComponent } from './_component/pages/cheque-empresarial/cheque-empresarial.component';

const routes: Routes = [
	{
		path: 'dashboard',
		canActivate: [AuthGuard],
		component: DashboardComponent
	},
	{
		path: 'admin',
		canActivate: [AuthGuard],
		component: AdminLayoutComponent,
		children: [
			{
				path: 'user',
				component: UserComponent
			},
			{
				path: 'cheque-empresarial',
				component: ChequeEmpresarialComponent
			}
		]
	},
	{
		path: 'login',
		component: LoginComponent,
	},
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
