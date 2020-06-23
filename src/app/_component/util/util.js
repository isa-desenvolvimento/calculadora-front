
import * as moment from 'moment'; // add this 1 of 4

export const getCurrentDate = (format = "DD/MM/YYYY hh:mm") => moment(new Date).format(format);

export const getQtdDias = (fistDate, secondDate) => {
    const a = moment(fistDate, 'DD/MM/YYYY');
    const b = moment(secondDate, 'DD/MM/YYYY');
    return Math.abs(b.diff(a, 'days'));
}

export const formatDate = (date, format = "DD/MM/YYYY") => moment(row['dataBase']).format("DD/MM/YYYY");


export const verifyNumber = value => value = Math.abs(value);

export const formatCurrency = value => {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
}

export const getLastLine = table => [...table].pop();

export const formartTable = (id, log) => {
    const inter = setInterval(() => {
        let table = document.getElementById(id).innerHTML;

        if (table) {
            table = table.replace(/log-visible-false/g, 'log-visible-true ');
            table = table.replace(/log-hidden-false/g, 'log-hidden-true ');
            clearInterval(inter)
            log.infoTabela = table;
            this.logService.addLog([log]).subscribe()
        }
    }, 0);
}