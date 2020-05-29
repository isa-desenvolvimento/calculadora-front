import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Parcela } from '../_models/ParceladoPre';

@Injectable({ providedIn: 'root' })
export class ParceladoPreService {
    constructor(private http: HttpClient) { }

    getAll() {
        return [{
          id: 22,
          nparcelas: 3,
          parcelaInicial: 3,
          dataVencimento: "2017-12-28",
          indiceDV: "CDI",
          indiceDataVencimento: 658.2287,
          indiceDCA: 'CDI',
          indiceDataCalcAmor: 658.2287,
          dataCalcAmor: "2017-12-28",
          valorNoVencimento: 114712.14,
          encargosMonetarios: '{"correcaoPeloIndice":"1147.12","jurosAm":{"dias":1,"percentsJuros":"0.03","moneyValue":"38.62"},"multa":"2317.96"}',
          subtotal: 134,
          valorPMTVincenda: 118349.84,
          amortizacao: '',
          totalDevedor: 114712.14,
          status: 'ABERTO',
          contractRef: 1,
          ultimaAtualizacao: '',
        },
        {
          id: 22,
          nparcelas: 4,
          parcelaInicial: 3,
          dataVencimento: "2017-12-29",
          indiceDV: "CDI",
          indiceDataVencimento: 658.2287,
          indiceDCA: 'CDI',
          indiceDataCalcAmor: 658.2287,
          dataCalcAmor: "2017-12-29",
          valorNoVencimento: 114712.14,
          encargosMonetarios: '{"correcaoPeloIndice":"1147.12","jurosAm":{"dias":1,"percentsJuros":"0.03","moneyValue":"38.62"},"multa":"2317.96"}',
          subtotal: 134,
          valorPMTVincenda: 118349.84,
          amortizacao: '',
          totalDevedor: 114712.14,
          status: 'ABERTO',
          contractRef: 1,
          ultimaAtualizacao: '',
        }]
    }

    getLancamento(id: number) {
        return this.http.get<Parcela[]>(`${environment.API_PATH}/cheque-empresarial/${id}`);
    }

    addLancamento(payload: any) {
        return this.http.post(`${environment.API_PATH}/cheque-empresarial`, payload);
    }

    updateLancamento(payload: any) {
        return this.http.put(`${environment.API_PATH}/cheque-empresarial/${payload.id}`, payload);
    }

    removeLancamento(id: number) {
        return this.http.delete(`${environment.API_PATH}/cheque-empresarial/${id}`);
    }
}