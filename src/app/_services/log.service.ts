import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Log } from '../_models/log';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private http: HttpClient) { }

  addLog(log: any) {
    return this.http.post(`${environment.API_PATH}/log`, log);
  }

  getLog(pasta: string, contrato: string, tipoContrato: string) {   
    return this.http.get<Log[]>(`${environment.API_PATH}/log?pasta=${pasta}&contrato=${contrato}&tipoContrato=${tipoContrato}`);
  }
}
