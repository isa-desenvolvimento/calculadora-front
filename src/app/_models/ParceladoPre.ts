export interface Parcela {
    id?: string;
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
    infoParaCalculo: any;
    infoParaAmortizacao: any;
    tipoParcela: string;
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

export interface InfoParaCalculo {
    formDataCalculo: string;
    formMulta: number;
    formJuros: number;
    formHonorarios: number;
    formMultaSobContrato: number;
    formIndice: string;
    formIndiceEncargos: number;
    formIndiceDesagio: number;
}