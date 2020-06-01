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
          dataVencimento: "2019-01-08",
          indiceDV: "INPC/IBGE",
          indiceDataVencimento: 69.876800,
          indiceDCA: 'INPC/IBGE',
          indiceDataCalcAmor: 71.590624,
          dataCalcAmor: "2019-07-09",
          valorNoVencimento: 10222.38,
          encargosMonetarios: '{"correcaoPeloIndice":"1147.12","jurosAm":{"dias":1,"percentsJuros":"0.03","moneyValue":"38.62"},"multa":"2317.96"}',
          subtotal: 134,
          valorPMTVincenda: 118349.84,
          amortizacao: 0,
          totalDevedor: 114712.14,
          status: 'ABERTO',
          contractRef: 1,
          ultimaAtualizacao: '',
          totalParcelasVencidas: '{"valorNoVencimento": "1147.12", "correcaoPeloIndice":  "716.00", "moneyValue": "2.215,00", "multa": "254", "subtotal": "255", "valorPMTVincenda": "256", "amortizacao": "25", "totalDevedor": "256.653,00"}',
          totalParcelasVincendas: '{"valorPMTVincenda": "1147.12", "totalDevedor": "1147.12"}'
        },
        {
          id: 22,
          nparcelas: 4,
          parcelaInicial: 3,
          dataVencimento: "2020-08-08",
          indiceDV: "CDI",
          indiceDataVencimento: 658.2287,
          indiceDCA: 'CDI',
          indiceDataCalcAmor: 658.2287,
          dataCalcAmor: "2020-07-09",
          valorNoVencimento: 114712.14,
          encargosMonetarios: '{"correcaoPeloIndice":"1147.12","jurosAm":{"dias":1,"percentsJuros":"0.03","moneyValue":"38.62"},"multa":"2317.96"}',
          subtotal: 134,
          valorPMTVincenda: 118349.84,
          amortizacao: 100,
          totalDevedor: 114712.14,
          status: 'ABERTO',
          contractRef: 1,
          ultimaAtualizacao: '',
          totalParcelasVencidas: '{"valorNoVencimento": "1147.12", "correcaoPeloIndice":  "716.00", "moneyValue": "2.215,00", "multa": "254", "subtotal": "255", "valorPMTVincenda": "256", "amortizacao": "25", "totalDevedor": "256.653,00"}',
          totalParcelasVincendas: '{"valorPMTVincenda": "1147.12", "totalDevedor": "1147.12"}'
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