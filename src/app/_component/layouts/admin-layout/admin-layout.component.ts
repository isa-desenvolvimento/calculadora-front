import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../_services/auth.service';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
	model: any = {};
	
	constructor(
		private authService: AuthService
    ) { }
    
  ngOnInit() { }

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
