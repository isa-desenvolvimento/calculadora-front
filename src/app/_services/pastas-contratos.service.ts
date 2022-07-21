import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import * as PASTAS from "./pastas.json";
import { Pastas } from "../_models/pastas";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PastasContratosService {
  pastas: any = PASTAS;

  constructor(private http: HttpClient) {}

  // public getPastas(): Observable<any> {
  //   return this.pastas.default;
  // }

  getPastas(): Observable<any>  {
    return this.http.get<Pastas[]>(
      `${environment.API_PATH}/pastas`
    );
  }
}
