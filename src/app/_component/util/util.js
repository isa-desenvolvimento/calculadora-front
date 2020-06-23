
import * as moment from 'moment'; // add this 1 of 4

export const getCurrentDate = (format = "DD/MM/YYYY hh:mm") => moment(new Date).format(format);

export const getQtdDias = (fistDate, secondDate) => {
    const a = moment(fistDate, 'DD/MM/YYYY');
    const b = moment(secondDate, 'DD/MM/YYYY');
    return Math.abs(b.diff(a, 'days'));
}

export const formatDate = row =>  moment(row['dataBase']).format("DD/MM/YYYY");


export const  verifyNumber = value => value = Math.abs(value);

export const  formatCurrency = value => {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }