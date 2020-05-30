export interface Parcela {
    id?: number;
    nparcelas: number;
    parcelaInicial:number; 
    dataVencimento: string;
    indiceDV: string;
    indiceDataVencimento: number;
    indiceDCA: string;
    indiceDataCalcAmor: number;
    dataCalcAmor: string;
    valorNoVencimento: number;
    encargosMonetarios: any;
    subtotal: number;
    valorPMTVincenda: string;
    amortizacao: number;
    totalDevedor: number;
    status: string;
    contractRef: number;
    ultimaAtualizacao: string;
    totalParcelasVencidas: any;
    totalParcelasVincendas: any;
}

export interface EncargosMonetarios {
    correcaoPeloIndice: number;
    jurosAm: JurosAm;
    multa: number;
}

export interface JurosAm {
    dias: number;
    percentsJuros: number;
    moneyValue: number;
}