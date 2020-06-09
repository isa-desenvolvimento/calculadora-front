import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Indices } from '../_models/indices';
import { environment } from '../../environments/environment';
import * as moment from 'moment'; // add this 1 of 4

import * as INPC from './indices-INPC.json';
import * as CDI from './indices-CDI.json';
import * as IGPM from './indices-IGPM.json';

@Injectable({ providedIn: 'root' })
export class IndicesService {
  inpc: any = INPC;
  cdi: any = CDI;
  igpm: any = IGPM;

  constructor(private http: HttpClient) { }

  formatDate(date, format = "DD/MM/YYYY") {
    return moment(date).format(format);
  }

  tranformJSON(indice, json) {
    const indicesFormated = [];
    Object.entries(json).forEach(([key, value]) => {
      indicesFormated.push({
        indice,
        data: this.formatDate(key, "YYYY-DD-MM"),
        valor: value
      })
    })

    return indicesFormated;
  }

  public getINPC(): Observable<any> {
    return this.inpc.default;
  }

  public getIGPM(): Observable<any> {
    return this.igpm.default;
  }

  public getCDI(): Observable<any> {
    return this.cdi.default
  }

  getIndice(indices: string) {
    // switch (indices) {
    //   case "INPC/IBGE":
    //     return this.tranformJSON(indices, this.getINPC());
    //   case "CDI":
    //     return this.tranformJSON(indices, this.getCDI());
    //   case "IGPM":
    //     return this.tranformJSON(indices, this.getIGPM());
    //   default:
    //     break;
    // }
    console.log(indices);
    
    return this.http.get<Indices[]>(`${environment.API_PATH}/indices/${indices}`);
  }

  addIndice(indice: any) {
    return this.http.post(`${environment.API_PATH}/indices`, indice);
  }

  updateIndice(id: number, indice: any) {
    return this.http.put(`${environment.API_PATH}/indices/${id}`, indice);
  }

  removeIndice(id: number) {
    return this.http.delete(`${environment.API_PATH}/indices/${id}`);
  }
}