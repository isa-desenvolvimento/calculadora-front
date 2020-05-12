import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import * as INPC from './indices-INPC.json';
import * as CDI from './indices-CDI.json';
import * as IGPM from './indices-IGPM.json';

@Injectable({ providedIn: 'root' })
export class IndicesService {
    inpc:any = INPC;
    cdi:any = CDI;
    igpm:any = IGPM;

    constructor(private http: HttpClient) {}

    public getINPC(): Observable<any> {
      return this.inpc.default;
    }

    public getIGPM(): Observable<any> {
      return this.igpm.default;
    }

    public getCDI(): Observable<any> {
      return this.cdi.default
    }

}