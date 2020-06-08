import { Component, OnInit } from '@angular/core';

import { Parcela, InfoParaCalculo } from '../../../_models/ParceladoPre';
import { ParceladoPreService } from '../../../_services/parcelado-pre.service';

import { IndicesService } from '../../../_services/indices.service';
import { PastasContratosService } from '../../../_services/pastas-contratos.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; // add this 1 of 4
import { timeout } from 'rxjs/operators';
import { logging } from 'protractor';

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'parcelado-pre-cmp',
  moduleId: module.id,
  templateUrl: 'parcelado-pre.component.html'
})

export class ParceladoPreComponent implements OnInit {

  preForm: FormGroup;
  preFormRiscos: FormGroup;
  preFormAmortizacao: FormGroup;
  preFormCadastroParcelas: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payloadLancamento: Parcela;

  tableLoading = false;
  updateLoading = false;
  alertType = '';
  updateLoadingBtn = false;
  controleLancamentos = 0;

  //tables
  tableData: TableData;
  tableDataParcelas: TableData;
  tableDataAmortizacao: TableData;

  // total
  totalParcelasVencidas: any;
  totalParcelasVincendas: any;
  total_date_now: any;
  total_data_calculo: any;
  subtotal_data_calculo: any;
  total_honorarios = 0;
  total_multa_sob_contrato = 0;
  total_subtotal = 0;
  total_grandtotal = 0;
  amortizacaoGeral = 0;
  pagas: any;

  dtOptions: DataTables.Settings = {};
  last_data_table: Object;
  min_data: string;
  ultima_atualizacao: String;

  formDefaultValues: InfoParaCalculo = {
    formMulta: 0,
    formJuros: 0,
    formHonorarios: 0,
    formMultaSobContrato: 0,
    formIndice: "---",
    formIndiceEncargos: 6,
    formIndiceDesagio: 6
  };

  constructor(
    private formBuilder: FormBuilder,
    private parceladoPreService: ParceladoPreService,
    private indicesService: IndicesService,
    private pastasContratosService: PastasContratosService
  ) {
  }

  ngOnInit() {
    this.preForm = this.formBuilder.group({
      pre_pasta: ['', Validators.required],
      pre_contrato: ['', Validators.required],
      pre_tipo_contrato: ['', Validators.required],
    });
    this.preFormRiscos = this.formBuilder.group({
      pre_indice: [],
      pre_encargos_monietarios: [],
      pre_data_calculo: this.getCurrentDate('YYYY-MM-DD'),
      pre_ultima_atualizacao: '',
      pre_encargos_contratuais: [],
      pre_multa: [],
      pre_juros_mora: [],
      pre_honorarios: [],
      pre_multa_sobre_constrato: [],
      pre_desagio: []
    });
    this.tableData = {
      dataRows: []
    }
    this.tableDataParcelas = {
      dataRows: []
    }
    this.tableDataAmortizacao = {
      dataRows: []
    }

    this.pagas = [];

    this.totalParcelasVencidas = [];
    this.totalParcelasVincendas = [];
    this.preFormAmortizacao = this.formBuilder.group({
      preFA_data_vencimento: [''],
      preFA_saldo_devedor: ['', Validators.required],
      preFA_tipo: ['', Validators.required],
    });
    this.preFormCadastroParcelas = this.formBuilder.group({
      nparcelas: ['', Validators.required],
      parcelaInicial: ['', Validators.required],
      dataVencimento: ['', Validators.required],
      valorNoVencimento: ['', Validators.required],
      status: ['', Validators.required]
    })

    this.dtOptions = {
      paging: false,
      searching: false,
      scrollY: "300px",
      scrollCollapse: true,
      language: {
        "decimal": "",
        "emptyTable": "Sem dados para exibir",
        "info": "Mostrando _START_ de _END_ de _TOTAL_ registros",
        "infoEmpty": "Mostrando 0 de 0 de 0 registros",
        "infoFiltered": "(filtered from _MAX_ total registros)",
        "infoPostFix": "",
        "thousands": ",",
        "lengthMenu": "Mostrando _MENU_ registros",
        "loadingRecords": "Carregando...",
        "processing": "Processando...",
        "search": "Buscar:",
        "zeroRecords": "Nenhum registro encontrado com esses parâmetros",
        "paginate": {
          "first": "Primeira",
          "last": "Última",
          "next": "Próxima",
          "previous": "Anterior"
        },
        "aria": {
          "sortAscending": ": Ordernar para cima",
          "sortDescending": ": Ordernar para baixo"
        }
      }
    };
  }

  atualizarRisco() {
    this.controleLancamentos = 0;

    const payload = this.tableData.dataRows.map(parcela => {

      this.updateLoadingBtn = true;
      let parcelaLocal = { ...parcela };
      parcelaLocal['encargosMonetarios'] = JSON.stringify(parcelaLocal['encargosMonetarios']);
      parcelaLocal['infoParaCalculo'] = JSON.stringify(this.formDefaultValues);

      parcelaLocal['valorPMTVincenda'] = parseFloat(parcelaLocal['valorPMTVincenda']);
      parcelaLocal['amortizacao'] = parseFloat(parcelaLocal['amortizacao']);
      parcelaLocal['totalDevedor'] = parseFloat(parcelaLocal['totalDevedor']);
      parcelaLocal['subtotal'] = parseFloat(parcelaLocal['subtotal']);
      parcelaLocal['contractRef'] = this.pre_form.pre_pasta.value + this.pre_form.pre_contrato.value + this.pre_form.pre_tipo_contrato.value;
      parcelaLocal['ultimaAtualizacao'] = this.getCurrentDate('YYYY-MM-DD');

      return parcelaLocal;
    });

    const payloadPut = [...payload].filter((parcela => parcela['id']));

    payloadPut.length > 0 && this.parceladoPreService.updateLancamento(payloadPut).subscribe(parceladoPreList => {
      this.updateLoadingBtn = false;
      this.controleLancamentos = this.controleLancamentos + 1;
      if (this.tableData.dataRows.length === this.controleLancamentos) {
        this.ultima_atualizacao = this.getCurrentDate('YYYY-MM-DD');
        this.toggleUpdateLoading()
        this.alertType = 'risco-atualizado';
      }
    }, err => {
      this.errorMessage = "Falha ao atualizar risco.";
    });

    const payloadPost = [...payload].filter((parcela => !parcela['id']));

    payloadPost.length > 0 && this.parceladoPreService.addLancamento(payloadPost).subscribe(chequeEmpresarialListUpdated => {
      this.updateLoadingBtn = false;
      this.controleLancamentos = this.controleLancamentos + 1;
      if (this.tableData.dataRows.length === this.controleLancamentos) {
        this.ultima_atualizacao = this.getCurrentDate('YYYY-MM-DD');
        this.toggleUpdateLoading()
        this.alertType = 'risco-atualizado';
      }
      // lancamento["id"] = lancamentoLocal["id"] = chequeEmpresarialListUpdated["id"];
    }, err => {
      this.tableLoading = false;
      this.alertType = 'registro-nao-incluido';
      this.toggleUpdateLoading()

      this.errorMessage = "Falha ao atualizar risco."; //registro-nao-incluido
    });

    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 3000);
  }

  // convenience getter for easy access to form fields
  get pre_form() { return this.preForm.controls; }
  get pre_form_riscos() { return this.preFormRiscos.controls; }
  get pre_form_amortizacao() { return this.preFormAmortizacao.controls; }
  get pre_form_cadastro_parcelas() { return this.preFormCadastroParcelas.controls; }

  resetFields(form) {
    this[form].reset()
  }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  formatCurrencyAmortizacao(value) {
    const amortizacao = this.formatCurrency(value);
    return typeof (parseFloat(value)) === 'number' && parseFloat(value) !== 0 ? `(${amortizacao})` : "---";
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  getLastLine() {
    return this.tableData.dataRows.length === 0 ? this.tableData.dataRows.length : this.tableData.dataRows.length - 1;
  }

  adicionarParcelas() {
    const nParcelas = this.pre_form_cadastro_parcelas.nparcelas.value;
    const parcelaInicial = this.pre_form_cadastro_parcelas.parcelaInicial.value;
    this.tableDataParcelas.dataRows = [];

    for (let index = parcelaInicial; index < (nParcelas + parcelaInicial); index++) {
      this.tableDataParcelas.dataRows.push({ ...this.preFormCadastroParcelas.value, nparcelas: index });
    }
  }

  adicionarAmortizacao() {

    if (this.tableData.dataRows.length) {
      const preFATipo = this.pre_form_amortizacao.preFA_tipo.value;
      const preFASaldoDevedor = this.pre_form_amortizacao.preFA_saldo_devedor.value;

      this.tableDataAmortizacao.dataRows.push(this.preFormAmortizacao.value);

      switch (preFATipo) {
        case 'Data do Cálculo':
          const row = this.tableData.dataRows[0];
          const index = this.tableDataAmortizacao.dataRows.length - 1;
          const amorti = this.tableDataAmortizacao.dataRows[index];
          this.preFormAmortizacao.value['preFA_data_vencimento'] = row['dataCalcAmor'];

          if (row['totalDevedor'] == preFASaldoDevedor) {

            row['index'] = 0;
            this.pagas.push(row);

            amorti['amortizacaoDataDiferenciadaIncluida'] = true;
            row['amortizacaoIndex'] = index;
            amorti['pagoIndex'] = this.pagas.length - 1;
            row['status'] = "Pago";

            this.tableData.dataRows.splice(0, 1);

          } else {
            row['amortizacao'] = parseFloat(row['amortizacao']) + preFASaldoDevedor;
          }
          break;
        case 'Data Diferenciada':
          this.tableDataAmortizacao.dataRows.map((amorti, index) => {
            this.tableData.dataRows.map((row, key) => {

              if (row['amortizacaoDataDiferenciada'] || amorti['amortizacaoDataDiferenciadaIncluida']) {
                amorti['amortizacaoDataDiferenciadaIncluida'] = true;
                return;
              }

              switch (!amorti['amortizacaoDataDiferenciadaIncluida']) {
                case (row['totalDevedor'] > preFASaldoDevedor):
                  const qtdDias = this.getQtdDias(row['dataCalcAmor'], amorti['preFA_data_vencimento']);
                  const newParcela = {
                    ...row,
                    nparcelas: `${row['nparcelas']}.1`,
                    amortizacao: "0.00",
                    dataCalcAmor: amorti['preFA_data_vencimento'],
                    dataVencimento: row['dataCalcAmor'],
                    valorNoVencimento: row['totalDevedor'] - preFASaldoDevedor,
                    encargosMonetarios: { ...row['encargosMonetarios'], jurosAm: { ...row['encargosMonetarios']['jurosAm'], dias: qtdDias } },
                    amortizacaoDataDiferenciada: true
                  };

                  this.tableData.dataRows.splice(key + 1, 0, newParcela);
                  row['amortizacao'] = preFASaldoDevedor;
                  row['amortizacaoDataDiferenciadaIncluida'] = true;
                  break;

                case (row['totalDevedor'] < preFASaldoDevedor):
                  const diferenca = parseFloat(preFASaldoDevedor) - parseFloat(row['totalDevedor']);
                  row['amortizacao'] = preFASaldoDevedor;
                  if ((key + 1) < this.tableData.dataRows.length) this.tableData.dataRows[key + 1]['amortizacao'] = diferenca;
                  amorti['amortizacaoDataDiferenciadaIncluida'] = true;
                  break;

                default:
                  row['index'] = key;
                  this.pagas.push(row);
                  amorti['amortizacaoDataDiferenciadaIncluida'] = true;
                  row['amortizacaoIndex'] = index;
                  amorti['pagoIndex'] = this.pagas.length - 1;
                  row['status'] = "Pago";

                  this.tableData.dataRows.splice(key, 1);
                  break;
              }
            })
          });
          break;
        case 'Final':
          this.amortizacaoGeral += preFASaldoDevedor;
          break;
        default:
          break;
      }

      setTimeout(() => {
        this.preFormAmortizacao.reset();
        this.toggleUpdateLoading()
        this.alertType = 'amortizacao-incluido';
        this.simularCalc(true)
      }, 500)
    }
  }

  incluirParcelas() {
    this.tableLoading = true;
    this.tableDataParcelas.dataRows.map((parcela, key) => {
      const indice = this.pre_form_riscos.pre_indice.value || null;
      const dataVencimento = parcela['dataVencimento'];
      const inputExternoDataCalculo = this.pre_form_riscos.pre_data_calculo.value;
      this.total_date_now = moment(dataVencimento).format("DD/MM/YYYY");
      this.total_data_calculo = moment(inputExternoDataCalculo).format("DD/MM/YYYY")
      this.subtotal_data_calculo = this.total_date_now;
      this.last_data_table = [];

      const indiceValor = this.getIndiceDataBase(indice, dataVencimento);
      const amortizacao = this.tableDataAmortizacao.dataRows.length && this.tableDataAmortizacao.dataRows[key] ?
        this.tableDataAmortizacao.dataRows[key] : { preFA_saldo_devedor: 0, preFA_data_vencimento: inputExternoDataCalculo };
      const indiceDataCalcAmor = this.getIndiceDataBase(indice, amortizacao['preFA_data_vencimento']);

      this.tableData.dataRows.push({
        nparcelas: parcela['nparcelas'],
        parcelaInicial: parcela['parcelaInicial'],
        dataVencimento: dataVencimento,
        indiceDV: indice,
        indiceDataVencimento: indiceValor,
        indiceDCA: indice,
        indiceDataCalcAmor: indiceDataCalcAmor,
        dataCalcAmor: amortizacao['preFA_data_vencimento'],
        valorNoVencimento: parcela['valorNoVencimento'],
        encargosMonetarios: {
          correcaoPeloIndice: null,
          jurosAm: {
            dias: null,
            percentsJuros: null,
            moneyValue: null,
          },
          multa: null,
        },
        subtotal: 0,
        valorPMTVincenda: 0,
        amortizacao: amortizacao['preFA_saldo_devedor'],
        totalDevedor: 0,
        status: parcela['status'],
        contractRef: this.pre_form.pre_contrato.value || 0,
        ultimaAtualizacao: 0,
        totalParcelasVencidas: 0,
        totalParcelasVincendas: 0,
        vincendas: false,
      })
    })

    setTimeout(() => {
      this.preFormCadastroParcelas.reset();
      this.tableDataParcelas.dataRows = [];
      this.toggleUpdateLoading()
      this.alertType = 'lancamento-incluido';
      this.simularCalc(true)
    }, 500)
  }

  changeCadastroParcelas(e, row, col) {
    const index = this.tableDataParcelas.dataRows.indexOf(row);
    this.tableDataParcelas.dataRows[index][col] = col === 'valorNoVencimento' ? e.target.value.slice(2) : e.target.value;
  }

  setCampoSemAlteracao(semFormat = false) {
    return semFormat ? "---" : "NaN";
  }

  pesquisarContratos() {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.preFormRiscos.reset({ pre_data_calculo: this.getCurrentDate('YYYY-MM-DD') });

    const contractRef = this.pre_form.pre_pasta.value + this.pre_form.pre_contrato.value + this.pre_form.pre_tipo_contrato.value;

    this.parceladoPreService.getAll().subscribe(parceladoPreList => {
      this.tableData.dataRows = parceladoPreList.filter((row) => row["contractRef"] === contractRef).map(parcela => {
        parcela.encargosMonetarios = JSON.parse(parcela.encargosMonetarios)
        parcela.infoParaCalculo = JSON.parse(parcela.infoParaCalculo)

        if (parceladoPreList.length) {
          const ultimaAtualizacao = [...parceladoPreList].pop();
          this.ultima_atualizacao = moment(ultimaAtualizacao.ultimaAtualizacao).format('YYYY-MM-DD');
        }

        setTimeout(() => {

          this.changeFormValues(parcela.infoParaCalculo, true);
          this.simularCalc(true, null, true);
        }, 1000);

        return parcela;
      });

      if (!this.tableData.dataRows.length) {
        this.toggleUpdateLoading();
        this.tableLoading = false;
        this.alertType = 'sem-registros'
        return;
      }

      this.tableLoading = false;
    }, err => {

      this.tableLoading = false;
      this.alertType = 'sem-registros';
      this.toggleUpdateLoading()
      this.errorMessage = err.error.message;
    });

  }

  getCurrentDate(format = "DD/MM/YYYY hh:mm") {
    return moment(new Date).format(format);
  }

  getQtdDias(fistDate, secondDate) {
    const a = moment(fistDate, 'YYYY-MM-DD');
    const b = moment(secondDate, 'YYYY-MM-DD');
    return Math.abs(b.diff(a, 'days'));
  }

  changeDate(e, row, data, tipoIndice, tipoIndiceValue) {
    row[data] = moment(e.target.value).format("YYYY-MM-DD");
    const indice = this.pre_form_riscos.pre_indice.value || row[tipoIndiceValue];

    this.updateInlineIndice(indice, row, tipoIndice, tipoIndiceValue, data);
  }

  formatDate(date) {
    return moment(date).format("DD/MM/YYYY");
  }

  changeFormValues(infoParaCalculo, search = false) {
    if (!search) {
      this.formDefaultValues = {
        formMulta: this.pre_form_riscos.pre_multa.value || infoParaCalculo["formMulta"],
        formJuros: this.pre_form_riscos.pre_juros_mora.value || infoParaCalculo["formJuros"],
        formHonorarios: this.pre_form_riscos.pre_honorarios.value || infoParaCalculo["formHonorarios"],
        formMultaSobContrato: this.pre_form_riscos.pre_multa_sobre_constrato.value || infoParaCalculo["formMultaSobContrato"],
        formIndice: this.pre_form_riscos.pre_indice.value || infoParaCalculo["formIndice"],
        formIndiceEncargos: this.pre_form_riscos.pre_encargos_contratuais.value || infoParaCalculo["formIndiceEncargos"],
        formIndiceDesagio: this.pre_form_riscos.pre_desagio.value || infoParaCalculo["formIndiceDesagio"]
      };
    } else {
      this.formDefaultValues = {
        formMulta: infoParaCalculo["formMulta"] || 0,
        formJuros: infoParaCalculo["formJuros"] || 0,
        formHonorarios: infoParaCalculo["formHonorarios"] || 0,
        formMultaSobContrato: infoParaCalculo["formMultaSobContrato"] || 0,
        formIndice: infoParaCalculo["formIndice"] || "---",
        formIndiceEncargos: infoParaCalculo["formIndiceEncargos"] || 6,
        formIndiceDesagio: infoParaCalculo["formIndiceDesagio"] || 0

      };
    }

  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;
    this.changeFormValues(this.formDefaultValues, search);

    setTimeout(() => {
      let moneyValueTotal = 0,
        multaTotal = 0,
        subtotalTotal = 0,
        amortizacaoTotal = 0,
        totalDevedorTotal = 0,
        correcaoPeloIndiceTotal = 0,
        valorNoVencimentoTotal = 0;
      let valorPMTVincendaTotalVincendas = 0, totalDevedorTotalVincendas = 0;

      // Valores inputs
      const inputExternoDataCalculo = this.pre_form_riscos.pre_data_calculo.value;
      const inputExternoIndice = this.pre_form_riscos.pre_indice.value;

      this.tableData.dataRows.map((row) => {
        let indiceDV = row['indiceDV'];
        let indiceDCA = row['indiceDCA'];
        if (!isInlineChange) {
          row['indiceDV'] = indiceDV = inputExternoIndice;
          row['indiceDCA'] = indiceDCA = inputExternoIndice;

          row['dataCalcAmor'] = inputExternoDataCalculo;

          row['indiceDataVencimento'] = this.getIndiceDataBase(indiceDV, row['dataVencimento']);
          row['indiceDataCalcAmor'] = this.getIndiceDataBase(indiceDCA, row['dataCalcAmor']);
        }

        // Valores brutos
        const dataVencimento = moment(row["dataVencimento"]).format("YYYY-MM-DD");
        const dataCalcAmor = moment(row["dataCalcAmor"]).format("YYYY-MM-DD");
        const indiceDataVencimento = this.getIndiceDataBase(indiceDV, row['dataVencimento']) / 100;
        const indiceDataCalcAmor = this.getIndiceDataBase(indiceDCA, row['dataCalcAmor']) / 100;
        const valorNoVencimento = parseFloat(row['valorNoVencimento']);
        const vincenda = dataVencimento > inputExternoDataCalculo;

        const amortizacao = parseFloat(row['amortizacao']);
        let porcentagem = (this.formDefaultValues.formJuros || parseFloat(row['encargosMonetarios']['jurosAm']['percentsJuros']) / 100);

        // Calculos 
        const correcaoPeloIndice = (valorNoVencimento / indiceDataVencimento * indiceDataCalcAmor) - valorNoVencimento;
        const qtdDias = this.getQtdDias(dataVencimento, dataCalcAmor);
        porcentagem = porcentagem / 30 * qtdDias;
        const valor = (valorNoVencimento + correcaoPeloIndice) * porcentagem;
        const multa = row['amortizacaoDataDiferenciada'] ? 0 : (valorNoVencimento + correcaoPeloIndice + valor) * (this.formDefaultValues.formMulta / 100);
        const subtotal = valorNoVencimento + correcaoPeloIndice + valor + multa;
        const totalDevedor = subtotal - amortizacao;
        const desagio = Math.pow(((this.formDefaultValues.formIndiceDesagio / 100) + 1), (-qtdDias / 30));
        const valorPMTVincenda = valorNoVencimento * desagio;

        // Table Values
        if (vincenda) {
          row['encargosMonetarios']['correcaoPeloIndice'] = this.setCampoSemAlteracao();
          row['encargosMonetarios']['jurosAm']['dias'] = this.setCampoSemAlteracao(true);;
          row['encargosMonetarios']['jurosAm']['percentsJuros'] = this.setCampoSemAlteracao(true);
          row['encargosMonetarios']['jurosAm']['moneyValue'] = this.setCampoSemAlteracao();
          row['encargosMonetarios']['multa'] = this.setCampoSemAlteracao();
          row['subtotal'] = this.setCampoSemAlteracao();
          row['valorPMTVincenda'] = valorPMTVincenda.toFixed(2);
          row['amortizacao'] = amortizacao.toFixed(2);
          row['totalDevedor'] = valorPMTVincenda.toFixed(2);
          row['vincenda'] = true;

          valorPMTVincendaTotalVincendas += valorPMTVincenda;
          totalDevedorTotalVincendas += valorPMTVincenda;

        } else {
          row['encargosMonetarios']['correcaoPeloIndice'] = correcaoPeloIndice.toFixed(2);
          row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
          row['encargosMonetarios']['jurosAm']['percentsJuros'] = porcentagem ? (porcentagem * 100).toFixed(2) : 0;
          row['encargosMonetarios']['jurosAm']['moneyValue'] = valor.toFixed(2);
          row['encargosMonetarios']['multa'] = row['amortizacaoDataDiferenciada'] ? this.setCampoSemAlteracao() : multa.toFixed(2);
          row['subtotal'] = subtotal.toFixed(2);
          row['valorPMTVincenda'] = this.setCampoSemAlteracao();
          row['amortizacao'] = amortizacao.toFixed(2);
          row['totalDevedor'] = totalDevedor.toFixed(2);
          row['desagio'] = desagio;

          moneyValueTotal += valor;
          multaTotal += multa;
          subtotalTotal += subtotal;
          amortizacaoTotal += amortizacao;
          totalDevedorTotal += totalDevedor;
          correcaoPeloIndiceTotal += correcaoPeloIndice;
          valorNoVencimentoTotal += valorNoVencimento;
        }

        return parseFloat(row['totalDevedor']);
      });

      this.totalParcelasVencidas = {
        moneyValue: moneyValueTotal || 0,
        multa: multaTotal || 0,
        subtotal: subtotalTotal || 0,
        amortizacao: amortizacaoTotal || 0,
        totalDevedor: totalDevedorTotal || 0,
        correcaoPeloIndice: correcaoPeloIndiceTotal || 0,
        valorNoVencimento: valorNoVencimentoTotal || 0
      }

      this.totalParcelasVincendas = {
        totalDevedor: totalDevedorTotalVincendas || 0,
        valorPMTVincenda: valorPMTVincendaTotalVincendas || 0
      }

      // Forms Total rodapé
      if (this.tableData.dataRows.length > 0) {
        const honorarios = this.total_honorarios = (subtotalTotal + amortizacaoTotal) * (this.formDefaultValues.formHonorarios / 100);
        this.total_data_calculo = this.subtotal_data_calculo = this.formatDate(inputExternoDataCalculo);
        this.total_subtotal = totalDevedorTotalVincendas + totalDevedorTotal;
        this.pre_form_riscos.pre_multa_sobre_constrato && (this.total_multa_sob_contrato = (this.total_subtotal + honorarios + this.amortizacaoGeral) * (this.formDefaultValues.formMultaSobContrato / 100)) || 0;
        this.total_grandtotal = this.total_multa_sob_contrato + honorarios + this.total_subtotal - this.amortizacaoGeral;
      }

      this.tableLoading = false;
      if (origin === 'btn') {
        this.toggleUpdateLoading()
        this.alertType = 'calculo-simulado';
      }

    }, 0);

    this.tableData.dataRows.length === 0 && (this.tableLoading = false);
    !isInlineChange && this.toggleUpdateLoading();
  }

  getIndiceDataBase(indice, indiceDataCalcAmor) {
    return parseFloat(this.indipre_field.filter(ind => ind.type === indice).map(ind => {
      let date = moment(indiceDataCalcAmor).format("DD/MM/YYYY");

      switch (ind.type) {
        case "INPC/IBGE":
          return !!this.datasINPC[date] ? this.datasINPC[date] : ind.value;
          break;
        case "CDI":
          return !!this.datasCDI[date] ? this.datasCDI[date] : ind.value;
          break;
        case "IGPM":
          return !!this.datasIGPM[date] ? this.datasIGPM[date] : ind.value;
          break;
        case "Encargos Contratuais %":
          return !!this.pre_form_riscos.pre_encargos_contratuais.value ? this.pre_form_riscos.pre_encargos_contratuais.value : ind.value;
          break;
        default:
          break;
      }
    })[0]);
  }

  deleteRow(row) {
    const index = this.tableData.dataRows.indexOf(row);
    if (!row.id) {
      this.tableData.dataRows.splice(index, 1);
      setTimeout(() => {
        this.simularCalc(false);
        this.toggleUpdateLoading()
        this.alertType = 'registro-excluido'
      }, 0)
    } else {
      this.parceladoPreService.removeLancamento(row.id).subscribe(() => {
        this.tableData.dataRows.splice(index, 1);
        setTimeout(() => {
          this.simularCalc(false);
          this.toggleUpdateLoading()
          this.alertType = 'registro-excluido'
        }, 0)
      })
    }
  }

  deleteRowParcelas(row) {
    const index = this.tableDataParcelas.dataRows.indexOf(row);
    this.tableDataParcelas.dataRows.splice(index, 1);
    setTimeout(() => {
      this.simularCalc(false);
      this.toggleUpdateLoading()
      this.alertType = 'registro-excluido'
    }, 0)
  }

  deleteRowAmortizacao(row) {
    let index = this.tableDataAmortizacao.dataRows.indexOf(row);
    const amortizacao = this.tableDataAmortizacao.dataRows[index];
    let tableData = this.tableData.dataRows;

    if (amortizacao.hasOwnProperty('pagoIndex')) {
      const rowtableData = this.pagas[amortizacao['pagoIndex']];
      tableData.splice(rowtableData['index'], 0, rowtableData);
      index = rowtableData['index'];
      tableData[index]['status'] = "Aberto";
      tableData[index]['amortizacao'] = tableData[index]['totalDevedor'] - amortizacao['preFA_saldo_devedor'];
      //tableData[index]['amortizacao'] = 0;
      this.pagas.splice(amortizacao['pagoIndex'], 1);

    } else {
      switch (row['preFA_tipo']) {
        case 'Data do Cálculo':
          tableData[index]['amortizacao'] = 0;
          break;
        case 'Data Diferenciada':
          tableData[index]['amortizacao'] = 0;
          tableData.splice(index + 1, 1);
          break;
        case 'Final':
          this.amortizacaoGeral -= row['preFA_saldo_devedor'];
          break;
        default:
          break;
      }
    }


    index = this.tableDataAmortizacao.dataRows.indexOf(row);
    this.tableDataAmortizacao.dataRows.splice(index, 1);

    setTimeout(() => {
      this.simularCalc(false);
      this.toggleUpdateLoading()
      this.alertType = 'registro-excluido'
    }, 0)
  }

  updateInlineIndice(value, row, innerDataIndice, indiceColumn, columnData) {
    const index = this.tableData.dataRows.indexOf(row);

    this.tableData.dataRows[index][indiceColumn] = value;
    this.tableData.dataRows[index][innerDataIndice] = this.getIndiceDataBase(value, row[columnData]);

    console.log(this.tableData);

    setTimeout(() => {
      this.simularCalc(true);
    }, 100);
  }

  // Mock formulário de riscos
  folderData_field = this.agruparPasta();

  agruparPasta() {
    let pastasFiltros = [];

    this.pastas['data'].map(pasta => pastasFiltros.push(pasta.PASTA));
    const setUnico = new Set(pastasFiltros);

    return [...setUnico];
  }

  contractList_field = [];
  setContrato() {
    this.contractList_field = [];
    this.typeContractList_field = [];

    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.pre_form.pre_pasta.value) {
        this.contractList_field.push(pasta.CONTRATO);
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];
  }

  typeContractList_field = [];
  setTypeContract() {
    this.typeContractList_field = [];
    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.pre_form.pre_pasta.value && pasta.CONTRATO === this.pre_form.pre_contrato.value) {
        this.typeContractList_field.push(pasta.DESCRICAO);
      }
    });
    const setUnico = new Set(this.typeContractList_field);
    this.typeContractList_field = [...setUnico];
  }

  indipre_field = [{
    type: "---",
    value: "1"
  }, {
    type: "INPC/IBGE",
    value: "60.872914"
  },
  {
    type: "CDI",
    value: "71.712333"
  },
  {
    type: "IGPM",
    value: "1.24"
  },
  {
    type: "Encargos Contratuais %",
    value: "1"
  }
  ];

  pre_status_field = [{
    type: "Aberto",
    value: "1"
  },
  {
    type: "Pago",
    value: "2"
  }]

  amortizacao_field = [{
    type: "Data do Cálculo",
    value: "1"
  },
  {
    type: "Data Diferenciada",
    value: "2"
  },
  {
    type: "Final",
    value: "3"
  }]


  get datasCDI() {
    return this.indicesService.getCDI();
  };
  get datasIGPM() {
    return this.indicesService.getIGPM();
  };
  get datasINPC() {
    return this.indicesService.getINPC();
  };
  get pastas() {
    return this.pastasContratosService.getPastas();
  }
}