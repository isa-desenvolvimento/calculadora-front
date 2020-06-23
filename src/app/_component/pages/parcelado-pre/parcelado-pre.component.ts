import { Component, OnInit } from '@angular/core';

import { Parcela, InfoParaCalculo } from '../../../_models/ParceladoPre';
import { ParceladoPreService } from '../../../_services/parcelado-pre.service';

import { IndicesService } from '../../../_services/indices.service';
import { LogService } from '../../../_services/log.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import 'datatables.net';
import 'datatables.net-buttons';

import { getCurrentDate, formatDate, formatCurrency, getLastLine, verifyNumber, getQtdDias } from '../../util/util';
import { LISTA_INDICES, LANGUAGEM_TABLE } from '../../util/constants'

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: 'parcelado-pre-cmp',
  moduleId: module.id,
  templateUrl: 'parcelado-pre.component.html'
})

export class ParceladoPreComponent implements OnInit {

  preFormAmortizacao: FormGroup;
  preFormCadastroParcelas: FormGroup;
  payloadLancamento: Parcela;

  tableLoading = false;
  updateLoading = false;
  alertType = {};
  updateLoadingBtn = false;
  controleLancamentos = 0;

  contractRef = '';
  infoContrato = {};
  indice_field = LISTA_INDICES;
  form_riscos: any = {};

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
  dtOptionsAmortizacao: DataTables.Settings = {};
  last_data_table: Object;
  min_data: string;
  ultima_atualizacao: String;

  formDefaultValues: InfoParaCalculo = {
    formDataCalculo: getCurrentDate("YYYY-MM-DD"),
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
    private logService: LogService,
  ) {
  }

  ngOnInit() {
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
      ordering: false,
      dom: 'Bfrtip',
      buttons: [{
        extend: 'pdfHtml5',
        orientation: 'landscape',
        header: true,
        footer: true,
        pageSize: 'LEGAL',
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
        },
        customize: doc => {

          doc['defaultStyle'] = { ...doc['defaultStyle'], fontSize: 8 }
          doc['styles']['tableHeader'] = { ...doc['styles']['tableHeader'], fontSize: 8, color: 'black', fillColor: 'white' }
          doc['styles']['tableFooter'] = { ...doc['styles']['tableFooter'], fontSize: 8, color: 'black', fillColor: 'white' }

          doc['content'][0].text = 'DEMONSTRATIVO DE SALDO DEVEDOR';
          doc['content'][1]['table']['widths'] = [80, 50, 100, 50, 50, 100, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

          const footer = doc['content'][1]['table']['body'].pop();

          let valor = footer.pop();
          footer.map((value, index) => {
            if (index !== 0) {
              value.text = "";
            }
          })
          footer.push(valor);

          doc['content'][1]['table']['body'].push(footer);

          doc['content'][1]['table']['body'].map((row, index) => {
            if (index !== 0 && this.tableData.dataRows.length - 1 >= index - 1) {
              row[2].text = this.tableData.dataRows[index - 1]['indiceDV'];
              row[5].text = this.tableData.dataRows[index - 1]['indiceDCA'];

              row.map(item => item.alignment = 'center');
            }
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 20, 10, 0],
            text: `SUBTOTAL APURADO EM ${this.subtotal_data_calculo || "---------"} : ${this.formatCurrency(this.total_subtotal)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 1, 10, 0],
            text: `Honorários ${this.formDefaultValues.formHonorarios || 0}% : ${this.formatCurrency(this.total_honorarios)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 1, 10, 0],
            text: `Multa sob contrato ${this.formDefaultValues.formMultaSobContrato || 0}% : ${this.formatCurrency(this.total_multa_sob_contrato)}`
          })

          doc['content'].push({
            style: { fontSize: 10 },
            alignment: 'left',
            margin: [0, 1, 10, 0],
            text: `TOTAL APURADO EM ${this.total_data_calculo || "---------"} : ${this.formatCurrency(this.total_grandtotal)}`
          })

        }
      }],
      language: LANGUAGEM_TABLE
    }

    this.dtOptionsAmortizacao = {
      paging: false,
      searching: false,
      ordering: false,
      scrollY: '300px',
      scrollCollapse: true,
      language: LANGUAGEM_TABLE
    }
  }

  formartTable(acao) {
    const inter = setInterval(() => {
      let table = document.getElementById('tablePre').innerHTML;
      if (table) {
        table = table.replace(/log-visible-false/g, 'log-visible-true ');
        table = table.replace(/log-hidden-false/g, 'log-hidden-true ');

        clearInterval(inter)
        this.logService.addLog([{
          data: getCurrentDate("YYYY-MM-DD"),
          usuario: window.localStorage.getItem('username').toUpperCase(),
          pasta: this.infoContrato['pasta'],
          contrato: this.infoContrato['contrato'],
          tipoContrato: this.infoContrato['tipo_contrato'],
          dataSimulacao: this.form_riscos.formDataCalculo,
          acao: acao,
          infoTabela: table
        }]).subscribe(log => { })
      }
    }, 500);
  }


  atualizarRiscoConcluido() {
    this.updateLoadingBtn = false;
    this.controleLancamentos++;
    this.formartTable('Atualização de Risco');
    this.ultima_atualizacao = getCurrentDate('YYYY-MM-DD');

    this.alertType = {
      mensagem: 'Risco Atualizado',
      tipo: 'success'
    };
    this.toggleUpdateLoading()
  }

  atualizarRiscoFalha() {
    this.updateLoadingBtn = false;
    this.alertType = {
      mensagem: 'Falha ao atualizar risco',
      tipo: 'danger'
    };
    this.toggleUpdateLoading()
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
      parcelaLocal['contractRef'] = this.contractRef;
      parcelaLocal['ultimaAtualizacao'] = getCurrentDate('YYYY-MM-DD');

      return parcelaLocal;
    });

    const payloadPut = payload.filter((parcela => parcela['id']));
    payloadPut.length > 0 && this.parceladoPreService.updateLancamento(payloadPut).subscribe(parceladoPreList => {
      this.atualizarRiscoConcluido()
    }, err => {
      this.atualizarRiscoFalha()
    });

    const payloadPost = payload.filter((parcela => !parcela['id']));
    payloadPost.length > 0 && this.parceladoPreService.addLancamento(payloadPost).subscribe(chequeEmpresarialListUpdated => {
      this.atualizarRiscoConcluido()
    }, err => {
      this.atualizarRiscoFalha()
    });
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 5000);
  }

  // convenience getter for easy access to form fields
  get pre_form_amortizacao() { return this.preFormAmortizacao.controls; }
  get pre_form_cadastro_parcelas() { return this.preFormCadastroParcelas.controls; }

  formatCurrency(value) {
    return formatCurrency(value)
  }

  formatCurrencyAmortizacao(value) {
    const amortizacao = this.formatCurrency(value);
    return typeof (parseFloat(value)) === 'number' && parseFloat(value) !== 0 ? `(${amortizacao})` : "---";
  }

  verifyNumber(value) {
    verifyNumber(value)
  }

  formatDate(value, format) {
    return formatDate(value, format)
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
                  const qtdDias = getQtdDias(row['dataCalcAmor'], amorti['preFA_data_vencimento']);
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
        this.alertType = {
          mensagem: 'Amortização incluida!',
          tipo: 'success'
        };
        this.toggleUpdateLoading()
        this.simularCalc(true)
      }, 500)
    }
  }

  incluirParcelas() {

    if (!this.form_riscos.formIndice) {
      this.updateLoadingBtn = true;
      this.alertType = {
        mensagem: 'É necessário informar o índice.',
        tipo: 'warning'
      };
      this.toggleUpdateLoading()
      return;
    }

    this.setFormDefault()
    this.tableLoading = true;
    this.tableDataParcelas.dataRows.map(async (parcela, key) => {

      const indice = this.form_riscos.formIndice;
      const dataVencimento = parcela['dataVencimento'];
      const inputExternoDataCalculo = this.form_riscos.formDataCalculo

      this.total_date_now = formatDate(dataVencimento);
      this.total_data_calculo = formatDate(this.form_riscos.formDataCalculo) || getCurrentDate();
      this.subtotal_data_calculo = this.total_date_now;

      const amortizacao = this.tableDataAmortizacao.dataRows.length && this.tableDataAmortizacao.dataRows[key] ?
        this.tableDataAmortizacao.dataRows[key] : { preFA_saldo_devedor: 0, preFA_data_vencimento: inputExternoDataCalculo };

      const indiceValor = await this.getIndiceDataBase(indice, dataVencimento);
      const indiceDataCalcAmor = await this.getIndiceDataBase(indice, amortizacao['preFA_data_vencimento']);

      const interval = setInterval(() => {
        if (indiceValor && indiceDataCalcAmor) {
          clearInterval(interval);
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
            contractRef: this.contractRef,
            ultimaAtualizacao: 0,
            totalParcelasVencidas: 0,
            totalParcelasVincendas: 0,
            vincendas: false,
          })

          if (this.tableDataParcelas.dataRows.length - 1 === key) {
            setTimeout(() => {
              this.tableLoading = false;
              this.preFormCadastroParcelas.reset();
              this.tableDataParcelas.dataRows = [];
              this.alertType = {
                mensagem: 'Lançamento incluido',
                tipo: 'success'
              };
              this.toggleUpdateLoading()
              this.simularCalc(true)
            }, 500)
          }

        }
      }, 0);
    })
  }

  setFormRiscos(form) {
    Object.keys(form).filter((value, key) => {
      if (form[value] && form[value] !== 'undefined') {
        this.form_riscos[value] = form[value];
      }
    });
  }

  changeCadastroParcelas(e, row, col) {
    const index = this.tableDataParcelas.dataRows.indexOf(row);
    this.tableDataParcelas.dataRows[index][col] = col === 'valorNoVencimento' ? e.target.value.slice(2) : e.target.value;
  }

  setCampoSemAlteracao(semFormat = false) {
    return semFormat ? "---" : "NaN";
  }

  pesquisarContratos(infoContrato) {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.tableData.dataRows = [];

    this.contractRef = infoContrato.contractRef;
    this.infoContrato = infoContrato;

    this.parceladoPreService.getAll().subscribe(parceladoPreList => {
      this.tableData.dataRows = parceladoPreList.filter((row) => row["contractRef"] === infoContrato.contractRef).map((parcela, key) => {
        parcela.encargosMonetarios = JSON.parse(parcela.encargosMonetarios)
        parcela.infoParaCalculo = JSON.parse(parcela.infoParaCalculo)
        const ultimaAtualizacao = [...parceladoPreList].pop();
        this.ultima_atualizacao = formatDate(ultimaAtualizacao.ultimaAtualizacao, 'YYYY-MM-DD')

        Object.keys(parcela.infoParaCalculo).filter(value => {
          this.formDefaultValues[value] = parcela.infoParaCalculo[value];
        });

        setTimeout(() => {
          this.simularCalc(true, null, true);
        }, 1000);

        return parcela;
      });

      if (!this.tableData.dataRows.length) {
        this.tableLoading = false;
        this.alertType = {
          mensagem: 'Nenhuma parcela encontrada!',
          tipo: 'warning'
        };
        this.toggleUpdateLoading()
        return;
      }

      this.tableLoading = false;
    }, err => {

      this.tableLoading = false;
      this.alertType = {
        mensagem: 'Nenhuma parcela encontrada!',
        tipo: 'warning'
      };
      this.toggleUpdateLoading()
    });

  }

  async changeDate(e, row, data, tipoIndice, tipoIndiceValue) {
    row[data] = formatDate(e.target.value, 'YYYY-MM-DD');
    row['indiceDataBaseAtual'] = await this.getIndiceDataBase(this.formDefaultValues.formIndice, e.target.value);

    setTimeout(() => {
      this.updateInlineIndice(this.formDefaultValues.formIndice, row, tipoIndice, tipoIndiceValue, data);
    }, 100);
  }

  setFormDefault() {
    Object.keys(this.form_riscos).filter((value, key) => {
      if (this.form_riscos[value] && this.form_riscos[value] !== 'undefined') {
        this.formDefaultValues[value] = this.form_riscos[value];
      }
    });
  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;

    if (origin === 'btn') {
      this.setFormDefault()
    }

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
      const inputExternoDataCalculo = this.formDefaultValues.formDataCalculo;
      const inputExternoIndice = this.formDefaultValues.formIndice;
      const inputExternoEncargosContratuais = this.formDefaultValues.formIndiceEncargos;

      this.tableData.dataRows.map(async (row) => {
        let indiceDV = row['indiceDV'];
        let indiceDCA = row['indiceDCA'];
        if (!isInlineChange) {
          row['indiceDV'] = indiceDV = inputExternoIndice;
          row['indiceDCA'] = indiceDCA = inputExternoIndice;
          row['dataCalcAmor'] = inputExternoDataCalculo;

          switch (inputExternoIndice) {
            case "Encargos Contratuais %":
              const encargos = !!inputExternoEncargosContratuais ? inputExternoEncargosContratuais : 1;
              row['indiceDataVencimento'] = encargos;
              row['indiceDataCalcAmor'] = encargos;
              break;
            default:
              this.indicesService.getIndiceData(inputExternoIndice, row['dataVencimento']).subscribe(dtBase => {
                this.indicesService.getIndiceData(inputExternoIndice, row['dataVencimento']).subscribe(dtBaseAtual => {
                  row['indiceDataVencimento'] = dtBase['valor'] / 100;
                  row['indiceDataCalcAmor'] = dtBaseAtual['valor'] / 100;
                })
              }, erro => {
                this.alertType = {
                  mensagem: 'Nenhuma índice cadastrado nessa data!',
                  tipo: 'warning'
                };
                this.toggleUpdateLoading()
              });
              break;
          }
        }

        // Valores brutos
        const dataVencimento = formatDate(row["dataVencimento"], "YYYY-MM-DD");
        const dataCalcAmor = formatDate(row["dataCalcAmor"], "YYYY-MM-DD");
        const indiceDataVencimento = row['indiceDataVencimento'] / 100;
        const indiceDataCalcAmor = row['indiceDataCalcAmor'] / 100;

        const valorNoVencimento = parseFloat(row['valorNoVencimento']);
        const vincenda = dataVencimento > inputExternoDataCalculo;

        const amortizacao = parseFloat(row['amortizacao']);
        let porcentagem = (this.formDefaultValues.formJuros / 100) || (parseFloat(row['encargosMonetarios']['jurosAm']['percentsJuros']) / 100);

        // Calculos 
        const correcaoPeloIndice = (valorNoVencimento / indiceDataVencimento * indiceDataCalcAmor) - valorNoVencimento;
        const qtdDias = getQtdDias(dataVencimento, dataCalcAmor);
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

      this.subtotal_data_calculo = this.total_data_calculo = formatDate(inputExternoDataCalculo)
      this.total_subtotal = totalDevedorTotalVincendas + totalDevedorTotal;
      this.total_honorarios = (this.total_subtotal + this.amortizacaoGeral) * (this.formDefaultValues["formHonorarios"] / 100)
      this.total_multa_sob_contrato = (this.total_subtotal + this.amortizacaoGeral + this.total_honorarios) * (this.formDefaultValues["formMultaSobContrato"] / 100)
      this.total_grandtotal = this.total_subtotal + this.amortizacaoGeral + this.total_honorarios + this.total_multa_sob_contrato;

      if (origin === 'btn') {
        this.formartTable('Simulação')
        this.alertType = {
          mensagem: 'Cálculo Simulado',
          tipo: 'success'
        };
        this.toggleUpdateLoading()
      }
      this.tableLoading = false;
    }, 0);

    this.tableData.dataRows.length === 0 && (this.tableLoading = false);
    !isInlineChange && this.toggleUpdateLoading();
  }

  async getIndiceDataBase(indice, data) {
    if (!indice || !data) {
      return 1;
    }

    switch (indice) {
      case "Encargos Contratuais %":
        return this.formDefaultValues.formIndiceEncargos;
        break;
      default:
        return (await this.indicesService.getIndiceData(indice, data))
          .toPromise().then(ind => ind['valor'])
    }
  }


  deleteRow(row) {
    const index = this.tableData.dataRows.indexOf(row);
    if (!row.id) {
      this.tableData.dataRows.splice(index, 1);
      setTimeout(() => {
        this.simularCalc(false);
        this.alertType = {
          mensagem: 'Registro excluido!',
          tipo: 'danger'
        };
        this.toggleUpdateLoading()
      }, 0)
    } else {
      this.parceladoPreService.removeLancamento(row.id).subscribe(() => {
        this.tableData.dataRows.splice(index, 1);
        setTimeout(() => {
          this.simularCalc(false);
          this.alertType = {
            mensagem: 'Registro excluido!',
            tipo: 'danger'
          };
          this.toggleUpdateLoading()
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
      this.alertType = {
        mensagem: 'Registro excluido!',
        tipo: 'danger'
      };
      this.toggleUpdateLoading()
    }, 0)
  }

  async updateInlineIndice(value, row, innerDataIndice, indiceColumn, columnData) {
    const index = this.tableData.dataRows.indexOf(row);
    this[indiceColumn] = null
    this.tableData.dataRows[index][indiceColumn] = value;
    this.tableData.dataRows[index][innerDataIndice] = await this.getIndiceDataBase(value, row[columnData]);

    setTimeout(() => {
      this[indiceColumn] = row[indiceColumn]
      this.simularCalc(true, null, true);
    }, 0);
  }

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
}