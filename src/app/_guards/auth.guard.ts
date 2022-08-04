import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../_services/auth.service";
import { getPermissao } from "../_component/util/util";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(actived: ActivatedRouteSnapshot) {
    !this.authService.isLoggedIn() && this.router.navigate(["/login"]);
    return this.authService.isLoggedIn() && this.checkarRota(actived);
  }

  protected checkarRota(actived: ActivatedRouteSnapshot) {
    if ((typeof actived.data['roles'] !== 'undefined' && actived.data['roles'].length) ) {
      const rolesRota = actived.data['roles'];

      return new Observable<boolean>(subscriber => {
        if (!getPermissao(rolesRota)) {
          subscriber.next(false)
          this.router.navigate(["/"])
        } else {
          subscriber.next(true)
        }
      })
    } else if(actived['_routerState'].url === '/') {
      return new Observable<boolean>(subscriber => {
        subscriber.next(true)
      })
    } else {
      this.router.navigate(["/"])
    }
  }
}
