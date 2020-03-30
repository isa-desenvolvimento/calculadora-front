import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	model: any = {};
	
	constructor(
		private authService: AuthService
		) { }
	
	ngOnInit() {
		//Tirar o comentario, checa login
		//this.getSomePrivateStuff();
	}
	
	getSomePrivateStuff() {
		this.model.action = 'stuff';
		this.authService.getData(this.model).subscribe(response => {
			if (!!response.token) {
				console.log(response.data)
			}
		}, error => {
			this.authService.logout();
		});
	}
	
	logout(){
		this.authService.logout();
	}
}