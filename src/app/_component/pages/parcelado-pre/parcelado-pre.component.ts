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
  tableData: TableData;
  tableLoading = false;
  updateLoading = false;
  alertType = '';
  updateLoadingBtn = false;
  controleLancamentos = 0;

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
    this.totalParcelasVencidas =  [];
    this.totalParcelasVincendas = [];
    this.preFormAmortizacao = this.formBuilder.group({
      preFA_data_vencimento: [],
      preFA_saldo_devedor: []
    });
    this.preFormCadastroParcelas = this.formBuilder.group({
      pre_n_parcelas: [],
      pre_parcela_inicial: [],
      pre_data_vencimento: [],
      pre_valor_vecimento: [],
      pre_status: []
    })

    this.dtOptions = {
      paging: false,
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

  pesquisarContratos() {
    this.tableLoading = true;
    this.ultima_atualizacao = '';
    this.tableData.dataRows =  this.parceladoPre.getAll().map(parcela => {
      parcela.encargosMonetarios = JSON.parse(parcela.encargosMonetarios);
      this.totalParcelasVencidas = JSON.parse(parcela.totalParcelasVencidas);
      this.totalParcelasVincendas = JSON.parse(parcela.totalParcelasVincendas);
      this.ultima_atualizacao = moment(parcela.ultimaAtualizacao).format('YYYY-MM-DD');

      return parcela;
    })

    this.simularCalc(true, null, true);
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
    const a = moment(fistDate, 'DD/MM/YYYY');
    const b = moment(secondDate, 'DD/MM/YYYY');
    return Math.abs(b.diff(a, 'days'));
  }


  changeDate(e, row, data, tipoIndice, tipoIndiceValue) {
    row[data] = moment(e.target.value).format("YYYY-MM-DD");
    const indice = this.pre_form_riscos.pre_indice.value || row[tipoIndiceValue];

    this.updateInlineIndice(indice, row, tipoIndice, tipoIndiceValue);
  }

  formatDate(row) {
    return moment(row['dataVencimento']).format("DD/MM/YYYY");
  }

  simularCalc(isInlineChange = false, origin = null, search = false) {
    this.tableLoading = true;

    setTimeout(() => {
      let tableDataUpdated = this.tableData.dataRows.map((row, index) => {

        const inputExternoDataCalculo = this.pre_form_riscos.pre_data_calculo.value;
        const inputExternoIndice = this.pre_form_riscos.pre_indice.value;
        const inputExternoPorcentagem = this.pre_form_riscos.pre_juros_mora.value / 100;
        const inputExternoMulta = this.pre_form_riscos.pre_multa.value / 100;
        const inputExternoDesagio = this.pre_form_riscos.pre_desagio.value/100;
        const inputExternoHonorarios = this.pre_form_riscos.pre_honorarios.value / 100;
        const inputExternoMultaSobContrato = this.pre_form_riscos.pre_multa_sobre_constrato.value / 100;
        
        const dataVencimento = moment(row["dataVencimento"]).format("DD/MM/YYYY");
        const dataCalcAmor = moment(row["dataCalcAmor"]).format("DD/MM/YYYY");
        const indiceDataVencimento = this.getIndiceDataBase((isInlineChange ? inputExternoIndice : row['indiceDV']), row['indiceDataVencimento']) / 100;
        const indiceDataCalcAmor = this.getIndiceDataBase((isInlineChange ? inputExternoIndice : row['indiceDCA']), row['indiceDataCalcAmor']) / 100;
        const valorNoVencimento = parseFloat(row['valorNoVencimento']);
        const correcaoPeloIndice = parseFloat(row['encargosMonetarios']['correcaoPeloIndice']);
        const qtdDias = this.getQtdDias(dataVencimento, dataCalcAmor);
        const porcentagem = parseFloat(row['encargosMonetarios']['jurosAm']['percentsJuros']) / 100;
        const valor = parseFloat(row['encargosMonetarios']['jurosAm']['moneyValue']);
        const multa = parseFloat(row['encargosMonetarios']['multa']);
        const subtotal = parseFloat(row['subtotal']);
        
        const vincenda = valorNoVencimento < inputExternoDataCalculo;
        const desagio = vincenda ? Math.pow(((this.pre_form_riscos.pre_desagio.value/100) + 1), (qtdDias/30)) : (parseFloat(row['totalDevedor']) * -1) ;
       
        const valorPMTVincenda = parseFloat(row['valorPMTVincenda']);
        const amortizacao = 0; //Implementar
        const totalDevedor = vincenda ? valorNoVencimento + correcaoPeloIndice + valor + multa + amortizacao : valorPMTVincenda;

        const honorarios = totalDevedor * inputExternoHonorarios;

        // - Indices
        if (!isInlineChange) {
          this.pre_form_riscos.pre_indice.value && (row['indiceDV'] = inputExternoIndice);
          this.pre_form_riscos.pre_indice.value && (row['indiceDCA'] = inputExternoIndice);

          this.pre_form_riscos.pre_indice.value && (row['indiceDataVencimento'] = this.getIndiceDataBase(inputExternoIndice, row['indiceDataVencimento']));
          this.pre_form_riscos.pre_indice.value && (row['indiceDataCalcAmor'] = this.getIndiceDataBase(inputExternoIndice, row['indiceDataCalcAmor']));

          this.pre_form_riscos.pre_indice.value === "Encargos Contratuais %" && this.pre_form_riscos.pre_encargos_contratuais && (row['indiceDataCalcAmor'] = inputExternoIndice);
        }

        // Table Values

        // -- correcaoPeloIndice (encargos contratuais, inpc, iof, cmi)
        row['encargosMonetarios']['correcaoPeloIndice'] = search ? correcaoPeloIndice : ((valorNoVencimento / indiceDataVencimento * indiceDataCalcAmor) - valorNoVencimento).toFixed(2);

        // -- encargosMonetarios
        row['encargosMonetarios']['jurosAm']['dias'] = qtdDias;
        row['encargosMonetarios']['jurosAm']['percentsJuros'] = search ? porcentagem : (inputExternoPorcentagem * qtdDias).toFixed(2);
        row['encargosMonetarios']['jurosAm']['moneyValue'] = search ? valor : ((((valorNoVencimento + correcaoPeloIndice) / 30) * qtdDias) * inputExternoPorcentagem).toFixed(2);
        row['encargosMonetarios']['multa'] = search ? multa : ((valorNoVencimento + correcaoPeloIndice + valor) * inputExternoMulta).toFixed(2);
        
        row['subtotal'] = search ? subtotal : valorNoVencimento + correcaoPeloIndice + valor + multa;
        row['valorPMTVincenda'] = search ? valorPMTVincenda : valorNoVencimento *  Math.pow((inputExternoDesagio + 1), (qtdDias/30));
        
        row['amortizacao'] = amortizacao ;
        row['totalDevedor'] = totalDevedor;

        // Forms Total
        this.pre_form_riscos.pre_data_calculo.value && (this.total_data_calculo = moment(inputExternoDataCalculo).format("DD/MM/YYYY") || this.getCurrentDate());
        this.pre_form_riscos.pre_honorarios.value && (this.total_honorarios = honorarios);
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