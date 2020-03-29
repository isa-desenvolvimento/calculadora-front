import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	model: any = {};
	errorMessage: String = '';

	constructor(
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit() {
		this.authService.isLoggedIn() && this.router.navigate(['/dashboard']);
	}

	login() {
		this.model.action = 'login';
		this.authService.login(this.model).subscribe(response => {
			debugger
			if (!!response.token) {
				this.authService.setUser(response);
			}
		}, error => {
			this.errorMessage = error;
		});
	}

}