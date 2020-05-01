export interface Lancamento {
    id?: number;
    dataBase: string;
    indiceDB: string;
    indiceDataBase: number;
    indiceBA: string;
    indiceDataBaseAtual: number;
    indiceEncargosContratuais: number;
    dataBaseAtual: string;
    indiceDataAtual: number;
    valorDevedor: number;
    encargosMonetarios: EncargosMonetarios;
    lancamentos: number;
    tipoLancamento: string;
    valorDevedorAtualizado: number;
    contractRef: number;
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