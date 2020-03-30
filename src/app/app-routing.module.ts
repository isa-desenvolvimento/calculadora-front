import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { DashboardComponent } from './_component/dashboard/dashboard.component';
import { LoginComponent } from './_component/login/login.component';
import { AdminLayoutComponent } from './_component/layouts/admin-layout/admin-layout.component';

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
				path: 'admin',
				loadChildren: './_component/layouts/admin-layout/admin-layout.module#AdminLayoutModule'
			}
		]
	},
	{
		path: 'admin',
		canActivate: [AuthGuard],
		component: AdminLayoutComponent,
		children: [
			{
				path: 'admin',
				loadChildren: './_component/layouts/admin-layout/admin-layout.module#AdminLayoutModule'
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
