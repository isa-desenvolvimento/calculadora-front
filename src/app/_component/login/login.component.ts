import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	model: any = {};
	errorMessage: String = '';

	constructor(
		private authService: AuthService
		) {}

	ngOnInit() {
		this.authService.logout();
	}

	login() {
		this.model.action = 'login';
		this.authService.login(this.model).subscribe(response => {
			if (response.status === 'success') {
				this.authService.setUser(response);
			}
		}, error => {
			this.errorMessage = error;
		});
	}

}