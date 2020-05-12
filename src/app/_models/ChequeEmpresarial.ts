export interface Lancamento {
    id?: number;
    dataBase: string;
    indiceDB: string;
    indiceDataBase: number;
    indiceBA: string;
    indiceDataBaseAtual: number;
    dataBaseAtual: string;
    valorDevedor: number;
    encargosMonetarios: any;
    lancamentos: number;
    tipoLancamento: string;
    valorDevedorAtualizado: number;
    contractRef: number;
    ultimaAtualizacao: string;
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