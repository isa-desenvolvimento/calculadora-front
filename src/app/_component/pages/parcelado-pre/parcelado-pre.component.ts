import { Component, OnInit } from '@angular/core';

import { Lancamento } from '../../../_models/ChequeEmpresarial';
import { ParceladoPreService } from '../../../_services/parcelado-pre.service';

import { IndicesService } from '../../../_services/indices.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'; // add this 1 of 4
import { timeout } from 'rxjs/operators';

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
  payloadLancamento: Lancamento;

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

  dtOptions: DataTables.Settings = {};
  last_data_table: Object;
  min_data: string;
  ultima_atualizacao: String;

  constructor(
    private formBuilder: FormBuilder,
    private parceladoPre: ParceladoPreService,
    private indicesService: IndicesService,
  ) {
  }

  ngOnInit() {
    // this.pesquisarContratos();

    this.preForm = this.formBuilder.group({
      pre_pasta: [],
      pre_contrato: ['', Validators.required],
      pre_tipo_contrato: []
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

    this.totalParcelasVencidas =  [];
    this.totalParcelasVincendas = [];
    this.preFormAmortizacao = this.formBuilder.group({
      preFA_data_vencimento:['', Validators.required],
      preFA_saldo_devedor: ['', Validators.required]
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
      searching:false,

      // pagingType: 'full_numbers',
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
    this.tableData.dataRows.forEach(lancamento => {

      this.updateLoadingBtn = true;
      let lancamentoLocal = { ...lancamento };
      lancamentoLocal['encargosMonetarios'] = JSON.stringify(lancamentoLocal['encargosMonetarios']);
      lancamentoLocal['valorNoVencimento'] = parseFloat(lancamentoLocal['valorNoVencimento']);
      lancamentoLocal['valorDevedorAtualizado'] = parseFloat(lancamentoLocal['valorDevedorAtualizado']);
      lancamentoLocal['contractRef'] = parseFloat(lancamentoLocal['contractRef']);
      lancamentoLocal['ultimaAtualizacao'] = this.getCurrentDate('YYYY-MM-DD');

      if (lancamentoLocal["id"]) {
        this.parceladoPre.updateLancamento(lancamentoLocal).subscribe(parceladopreList => {
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
      } else {
        this.parceladoPre.addLancamento(lancamentoLocal).subscribe(parceladopreListUpdated => {
          this.updateLoadingBtn = false;
          this.controleLancamentos = this.controleLancamentos + 1;
          if (this.tableData.dataRows.length === this.controleLancamentos) {
            this.ultima_atualizacao = this.getCurrentDate('YYYY-MM-DD');
            this.toggleUpdateLoading()
            this.alertType = 'risco-atualizado';
          }
          lancamento["id"] = lancamentoLocal["id"] = parceladopreListUpdated["id"];
        }, err => {
          this.errorMessage = "Falha ao atualizar risco.";
        });

      }
    })
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
  get pre_form_cadastro_parcelas() { return this.preFormCadastroParcelas.controls;}

  resetFields(form) {
    this[form].reset()
  }

  formatCurrency(value) {
    return value === "NaN" ? "---" : `R$ ${(parseFloat(value)).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}` || 0;
  }

  verifyNumber(value) {
    value.target.value = Math.abs(value.target.value);
  }

  getLastLine() {
    return this.tableData.dataRows.length === 0 ? this.tableData.dataRows.length : this.tableData.dataRows.length - 1;
  }

  incluirLancamentos() {
    this.tableLoading = true;

    const localDataVencimento = this.tableData.dataRows.length === 0 ? this.pre_form_amortizacao.preFA_data_vencimento.value : this.tableData.dataRows[this.getLastLine()]["indiceDataVencimento"];
    const localValorDevedor = this.tableData.dataRows.length === 0 ? this.pre_form_amortizacao.preFa_saldo_devedor.value : this.tableData.dataRows[this.getLastLine()]["valorDevedorAtualizado"];

    this.total_date_now = moment(localDataVencimento).format("DD/MM/YYYY");
    this.total_data_calculo = moment(this.pre_form_riscos.pre_data_calculo.value).format("DD/MM/YYYY") || this.getCurrentDate();
    this.subtotal_data_calculo = this.total_date_now;
    this.last_data_table = [];

    const localTypeIndice = this.pre_form_riscos.pre_indice.value;
    const localTypeValue = this.getIndiceDataBase(localTypeIndice, this.pre_form_amortizacao.preFA_data_base_atual.value);

    const localLancamentos = this.pre_form_amortizacao.preFA_valor_lancamento.value;
    const localTipoLancamento = this.pre_form_amortizacao.preFA_tipo_lancamento.value;
    const localDataBaseAtual = this.pre_form_amortizacao.preFA_data_base_atual.value;

    setTimeout(() => {
      // this.payloadLancamento = ({
      //   //dataVencimento: localDataVencimento,
      //   indiceDB: localTypeIndice,
      //   indiceDataBase: localTypeValue,
      //   indiceBA: localTypeIndice,
      //   indiceDataBaseAtual: localTypeValue,
      //   //indiceDataCalcAmor: localDataBaseAtual,
      //   valorNoVencimento: localValorDevedor,
      //   encargosMonetarios: {
      //     correcaoPeloIndice: null,
      //     jurosAm: {
      //       dias: null,
      //       percentsJuros: null,
      //       moneyValue: null,
      //     },
      //     multa: null,
      //   },
      //   lancamentos: localLancamentos,
      //   tipoLancamento: localTipoLancamento,
      //   valorDevedorAtualizado: null,
      //   contractRef: this.pre_form.pre_contrato.value || 0,
      //   ultimaAtualizacao: '',
      // });
      this.pre_form_amortizacao.preFA_tipo_amortizacao.value ? this.tableData.dataRows.unshift(this.payloadLancamento) : this.tableData.dataRows.push(this.payloadLancamento);
      this.tableLoading = false;
    }, 0);
    this.resetFields('preFormAmortizacao');

    setTimeout(() => {
      this.toggleUpdateLoading()
      this.alertType = 'lancamento-incluido';
      this.simularCalc(true)
    }, 500)
  }

  adicionarParcelas() {
    const nParcelas = this.pre_form_cadastro_parcelas.nparcelas.value;
    const parcelaInicial = this.pre_form_cadastro_parcelas.parcelaInicial.value;
    this.tableDataParcelas.dataRows = [];

    for (let index = parcelaInicial; index < (nParcelas + parcelaInicial); index++) {
     this.tableDataParcelas.dataRows.push({...this.preFormCadastroParcelas.value,nparcelas: index});
    }
  }

  adicionarAmortizacao() {
    this.tableDataAmortizacao.dataRows.push(this.preFormAmortizacao.value);
    this.preFormAmortizacao.reset();

    if (this.tableData.dataRows.length) {
      const amortizacao = this.tableDataAmortizacao.dataRows;
      this.tableData.dataRows.map((parcela, key) => {
        this.tableData.dataRows[key] = {
          ...this.tableData.dataRows[key], 
          amortizacao: amortizacao[key]['preFA_saldo_devedor'],
          dataCalcAmor: amortizacao[key]['preFA_data_vencimento']
        }
      })

      setTimeout(() => {
        this.toggleUpdateLoading()
        this.alertType = 'amortizacao-incluido';
        this.simularCalc(true)
      }, 500)
    }
  }

  incluirParcelas() {
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
        this.tableDataAmortizacao.dataRows[key] : {preFA_saldo_devedor: 0, preFA_data_vencimento: inputExternoDataCalculo};
      const indiceDataCalcAmor =  this.getIndiceDataBase(indice, amortizacao['preFA_data_vencimento']);
     
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
        vincendas: false
      })
    })

    setTimeout(() => {
      this.toggleUpdateLoading()
      this.alertType = 'lancamento-incluido';
      this.simularCalc(true)
    }, 500)
  }

  changeCadastroParcelas(e, row, col) {
    const index = this.tableDataParcelas.dataRows.indexOf(row);
    this.tableDataParcelas.dataRows[index][col] = col === 'valorNoVencimento' ? e.target.value.slice(2) : e.target.value;
    
    setTimeout(() => {
      this.toggleUpdateLoading()
      this.alertType = 'lancamento-incluido';
      this.simularCalc(false)
    }, 500)
  }

  pesquisarContratos() {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.tableDataParcelas.dataRows = [];
    this.tableData.dataRows =  this.parceladoPre.getAll().filter((row) => row["contractRef"] === parseInt(this.pre_form.pre_contrato.value || 0)).map(parcela => {
      parcela.encargosMonetarios = JSON.parse(parcela.encargosMonetarios);
      this.totalParcelasVencidas = JSON.parse(parcela.totalParcelasVencidas);
      this.totalParcelasVincendas = JSON.parse(parcela.totalParcelasVincendas);
      this.ultima_atualizacao = moment(parcela.ultimaAtualizacao).format('YYYY-MM-DD');

      this.tableDataParcelas.dataRows.push(parcela);

      return parcela;
    })

     this.simularCalc(false, null, true);
    // this.parceladoPre.getAll().subscribe(parceladopreList => {
    //   this.tableData.dataRows = parceladopreList.filter((row) => row["contractRef"] === parseInt(this.pre_form.pre_contrato.value || 0)).map(parcela => {
    //     parcela.encargosMonetarios = JSON.parse(parcela.encargosMonetarios)

    //     if (parceladopreList.length) {
    //       const ultimaAtualizacao = [...parceladopreList].pop();
    //       this.ultima_atualizacao = moment(ultimaAtualizacao.ultimaAtualizacao).format('YYYY-MM-DD');
    //     }

    //     setTimeout(() => {
    //       this.simularCalc(true, null, true);
    //     }, 1000);

    //     return parcela;
    //   });
    //   this.tableLoading = false;
    // }, err => {
    //   this.errorMessage = err.error.message;
    // });

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

    this.updateInlineIndice(indice, row, tipoIndice, tipoIndiceValue);
  }

  formatDate(date) {
    return moment(date).format("DD/MM/YYYY");
  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;

    setTimeout(() => {
      let moneyValueTotal = 0,
      multaTotal = 0,
      subtotalTotal = 0,
      valorPMTVincendaTotal = 0,
      amortizacaoTotal = 0,
      totalDevedorTotal = 0,
      correcaoPeloIndiceTotal = 0,
      valorNoVencimentoTotal = 0;

      let valorPMTVincendaTotalVincendas = 0, totalDevedorTotalVincendas = 0;

      this.tableData.dataRows.map((row, index) => {
        // Valores inputs
        const inputExternoDataCalculo = this.pre_form_riscos.pre_data_calculo.value;
        const inputExternoIndice = this.pre_form_riscos.pre_indice.value;
        const inputExternoEncargosContratuais = this.pre_form_riscos.pre_encargos_contratuais.value;
        const inputExternoPorcentagem = this.pre_form_riscos.pre_juros_mora.value / 100;
        const inputExternoMulta = this.pre_form_riscos.pre_multa.value / 100;
        const inputExternoDesagio = this.pre_form_riscos.pre_desagio.value/100;
        const inputExternoHonorarios = this.pre_form_riscos.pre_honorarios.value / 100;
        const inputExternoMultaSobContrato = this.pre_form_riscos.pre_multa_sobre_constrato.value / 100;


        if (!isInlineChange) {
          row['indiceDV'] = inputExternoIndice;
          row['indiceDCA'] = inputExternoIndice;
        }

        // Valores brutos
        const dataVencimento = moment(row["dataVencimento"]).format("YYYY-MM-DD");
        const dataCalcAmor = moment(row["dataCalcAmor"]).format("YYYY-MM-DD");
        const indiceDataVencimento = this.getIndiceDataBase((inputExternoIndice || row['indiceDV']), row['dataVencimento']) / 100;
        const indiceDataCalcAmor = this.getIndiceDataBase((inputExternoIndice || row['indiceDCA']), row['dataCalcAmor']) / 100;
        const valorNoVencimento = parseFloat(row['valorNoVencimento']);
        const vincenda = dataVencimento > inputExternoDataCalculo;
        
        const amortizacao = parseFloat(row['amortizacao']);
        let porcentagem = inputExternoPorcentagem || parseFloat(row['encargosMonetarios']['jurosAm']['percentsJuros']);
      
        // Calculos 
        const correcaoPeloIndice = (valorNoVencimento/indiceDataVencimento*indiceDataCalcAmor)-valorNoVencimento;
        const qtdDias = this.getQtdDias(dataVencimento, dataCalcAmor);
        porcentagem = porcentagem/30 * qtdDias;
        const valor = (valorNoVencimento + correcaoPeloIndice) * porcentagem;
        const multa = (valorNoVencimento + correcaoPeloIndice + valor) * inputExternoMulta //verificar como foi salvo a multa do input;
        const subtotal = valorNoVencimento + correcaoPeloIndice + valor + multa;
        let totalDevedor = subtotal + amortizacao;
        const desagio = vincenda ? Math.pow((inputExternoDesagio + 1), (qtdDias/30)) : (totalDevedor * -1);
        const valorPMTVincenda = vincenda ?  valorNoVencimento * desagio : 0;
        totalDevedor = vincenda ? valorPMTVincenda : totalDevedor;
        const honorarios = totalDevedor * inputExternoHonorarios;

        // Table Values
        row['encargosMonetarios']['correcaoPeloIndice'] = correcaoPeloIndice.toFixed(2);
        row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
        row['encargosMonetarios']['jurosAm']['percentsJuros'] = porcentagem.toFixed(2) === "NaN" ? "---" : porcentagem.toFixed(2) || 0;
        row['encargosMonetarios']['jurosAm']['moneyValue'] = valor.toFixed(2);
        row['encargosMonetarios']['multa'] = multa.toFixed(2);
        row['subtotal'] = subtotal.toFixed(2);
        row['valorPMTVincenda'] = valorPMTVincenda.toFixed(2);
        row['amortizacao'] = amortizacao.toFixed(2);
        row['totalDevedor'] = totalDevedor.toFixed(2);
        row['vincenda'] = vincenda;
 
        if (vincenda) {
          valorPMTVincendaTotalVincendas += valorPMTVincenda;
          totalDevedorTotalVincendas += totalDevedor;
        } else {
          moneyValueTotal += valor;
          multaTotal += multa;
          subtotalTotal += subtotal;
          valorPMTVincendaTotal += valorPMTVincenda;
          amortizacaoTotal += amortizacao;
          totalDevedorTotal += totalDevedor;
          correcaoPeloIndiceTotal += correcaoPeloIndice;
          valorNoVencimentoTotal += valorNoVencimento;
        }

        
        // Forms Total
        this.total_data_calculo = moment(inputExternoDataCalculo).format("DD/MM/YYYY") || this.getCurrentDate();
        this.total_honorarios = honorarios;
        this.last_data_table = [...this.tableData.dataRows].pop();
        let last_date = Object.keys(this.last_data_table).length ? this.last_data_table['indiceDataCalcAmor'] : this.total_date_now;
        this.subtotal_data_calculo = moment(last_date).format("DD/MM/YYYY");
        this.min_data = last_date;

        this.tableLoading = false;
        if (origin === 'btn') {
          this.toggleUpdateLoading()
          this.alertType = 'calculo-simulado';
        }

        if (this.tableData.dataRows.length > 0) {
          this.total_subtotal = this.last_data_table['totalDevedor'];
          const valorDevedorAtualizado = parseFloat(this.last_data_table['totalDevedor']);

          this.pre_form_riscos.pre_multa_sobre_constrato && (this.total_multa_sob_contrato = (valorDevedorAtualizado + honorarios) * inputExternoMultaSobContrato) || 0;
          this.total_grandtotal = this.total_multa_sob_contrato + honorarios + valorDevedorAtualizado;
        }
        
        return parseFloat(row['totalDevedor']);
      });
      
      this.totalParcelasVencidas = {
        moneyValue: moneyValueTotal,
        multa: multaTotal,
        subtotal: subtotalTotal,
        valorPMTVincenda: valorPMTVincendaTotal,
        amortizacao: amortizacaoTotal,
        totalDevedor: totalDevedorTotal,
        correcaoPeloIndice: correcaoPeloIndiceTotal,
        valorNoVencimento: valorNoVencimentoTotal
      }

      this.totalParcelasVincendas = {
        totalDevedor: totalDevedorTotal ,
        valorPMTVincenda: valorPMTVincendaTotalVincendas
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
        this.simularCalc(true);
        this.toggleUpdateLoading()
        this.alertType = 'registro-excluido'
      }, 0)
    } else {
      this.parceladoPre.removeLancamento(row.id).subscribe(() => {
        this.tableData.dataRows.splice(index, 1);
        setTimeout(() => {
          this.simularCalc(true);
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
      this.toggleUpdateLoading()
      this.alertType = 'registro-excluido'
    }, 0)
  }

  deleteRowAmortizacao(row) {
    const index = this.tableDataAmortizacao.dataRows.indexOf(row);
    this.tableDataAmortizacao.dataRows.splice(index, 1);
    setTimeout(() => {
      this.toggleUpdateLoading()
      this.alertType = 'registro-excluido'
    }, 0)
  }

  updateInlineIndice(value, row, innerDataIndice, indiceColumn ) {
    console.log(value, row, innerDataIndice, indiceColumn);
    
    row[indiceColumn] = value;
    row[innerDataIndice] = this.getIndiceDataBase(value, row[innerDataIndice]);

    setTimeout(() => {
     this.simularCalc(true);
    }, 0);
  }

  // Mock formulário de riscos
  // Consulta 

  folderData_field = [1, 2, 3, 5, 6, 7, 8, 9, 10];

  contractList_field = [{
    title: "AA",
    id: "0",
    fodlerRef: "1",
  }, {
    title: "BB",
    id: "1",
    fodlerRef: "1",
  }, {
    title: "CC",
    id: "2",
    fodlerRef: "2",
  },
  {
    title: "DD",
    id: "3",
    fodlerRef: "3",
  },
  {
    title: "EE",
    id: "4",
    fodlerRef: "1",
  }];

  typeContractList_field = ["Cheque empresarial", "Parcelado", "Pós"];

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

  get datasCDI() {
    return this.indicesService.getCDI();
  };
  get datasIGPM() {
    return this.indicesService.getIGPM();
  };
  get datasINPC() {
    return this.indicesService.getINPC();
  };

}