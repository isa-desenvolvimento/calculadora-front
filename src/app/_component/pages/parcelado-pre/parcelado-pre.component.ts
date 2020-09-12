import { Component, OnInit, ViewChild } from "@angular/core";

import { Parcela, InfoParaCalculo } from "../../../_models/ParceladoPre";
import { ParceladoPreService } from "../../../_services/parcelado-pre.service";

import { IndicesService } from "../../../_services/indices.service";
import { LogService } from "../../../_services/log.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ParcelasComponent } from "../parcelas/parcelas.component";

import "datatables.net";
import "datatables.net-buttons";

import {
  getCurrentDate,
  formatDate,
  formatCurrency,
  isVincenda,
  verifyNumber,
  getQtdDias,
} from "../../util/util";
import {
  LISTA_INDICES,
  LANGUAGEM_TABLE,
  LISTA_STATUS,
  AMORTIZACAO_DATA_ATUAL,
  AMORTIZACAO_DATA_DIFERENCIADA,
  AMORTIZACAO_DATA_FINAL,
  PARCELA_PAGA,
  PARCELA_ABERTA,
  PARCELA_AMORTIZADA,
  PARCELADO_PRE_URL,
  PARCELADO_PRE,
  PARCELADO_POS,
} from "../../util/constants";
import { LowerCasePipe } from "@angular/common";

declare interface TableData {
  dataRows: Array<Object>;
}

@Component({
  selector: "parcelado-pre-cmp",
  moduleId: module.id,
  templateUrl: "parcelado-pre.component.html",
})
export class ParceladoPreComponent implements OnInit {
  payloadLancamento: Parcela;

  url = window.location.pathname.split("/");
  indexURL = this.url.indexOf(PARCELADO_PRE_URL);
  isDesagio = this.indexURL !== -1;
  modulo = this.url[this.indexURL];

  tableLoading = false;
  updateLoading = false;
  alertType = {
    mensagem: "",
    tipo: "",
  };

  updateLoadingBtn = false;
  controleLancamentos = 0;

  contractRef = "";
  infoContrato = {};
  indice_field = LISTA_INDICES;
  status_field = LISTA_STATUS;
  form_riscos: any = {};
  quitado = false;

  @ViewChild(ParcelasComponent, { static: false })
  parcelas: ParcelasComponent;

  //tables
  tableData: TableData;
  auxtableData: TableData;
  tableDataAmortizacao: TableData;

  isSimular = false;

  newParcela = {
    amortizacao: null,
    contractRef: null,
    dataCalcAmor: null,
    dataVencimento: null,
    encargosMonetarios: null,
    indiceDCA: null,
    indiceDV: null,
    indiceDataCalcAmor: null,
    indiceDataVencimento: null,
    infoParaAmortizacao: null,
    infoParaCalculo: null,
    nparcelas: null,
    parcelaInicial: null,
    status: null,
    subtotal: null,
    tipoParcela: null,
    totalDevedor: null,
    ultimaAtualizacao: null,
    valorNoVencimento: null,
    valorPMTVincenda: null,
  };

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
  minParcela: number;
  min_data: string;
  ultima_atualizacao: String;

  formDefaultValues: InfoParaCalculo = {
    formDataCalculo: getCurrentDate("YYYY-MM-DD"),
    formMulta: 0,
    formJuros: 0,
    formHonorarios: 0,
    formMultaSobContrato: 0,
    formIndice: "---",
    formIndiceEncargos: 1,
    formDesagio: 1,
  };

  constructor(
    private formBuilder: FormBuilder,
    private parceladoPreService: ParceladoPreService,
    private indicesService: IndicesService,
    private logService: LogService
  ) {}

  ngOnInit() {
    this.tableData = {
      dataRows: [],
    };
    this.auxtableData = {
      dataRows: [],
    };

    this.tableDataAmortizacao = {
      dataRows: [],
    };

    this.pagas = [];
    this.totalParcelasVencidas = [];
    this.totalParcelasVincendas = [];
    this.dtOptions = {
      paging: false,
      searching: false,
      ordering: false,
      dom: "Bfrtip",
      buttons: [
        {
          extend: "pdfHtml5",
          orientation: "landscape",
          header: true,
          footer: true,
          pageSize: "LEGAL",
          exportOptions: {
            columns: [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
            ],
          },
          customize: (doc) => {
            doc["defaultStyle"] = { ...doc["defaultStyle"], fontSize: 8 };
            doc["styles"]["tableHeader"] = {
              ...doc["styles"]["tableHeader"],
              fontSize: 8,
              color: "black",
              fillColor: "white",
            };
            doc["styles"]["tableFooter"] = {
              ...doc["styles"]["tableFooter"],
              fontSize: 8,
              color: "black",
              fillColor: "white",
            };

            doc["content"][0].text = "DEMONSTRATIVO DE SALDO DEVEDOR";
            doc["content"][1]["table"]["widths"] = [
              80,
              50,
              100,
              50,
              50,
              100,
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
              "auto",
            ];

            const footer = doc["content"][1]["table"]["body"].pop();

            let valor = footer.pop();
            footer.map((value, index) => {
              if (index !== 0) {
                value.text = "";
              }
            });
            footer.push(valor);

            doc["content"][1]["table"]["body"].push(footer);

            doc["content"][1]["table"]["body"].map((row, index) => {
              if (
                index !== 0 &&
                this.tableData.dataRows.length - 1 >= index - 1
              ) {
                row[2].text = this.tableData.dataRows[index - 1]["indiceDV"];
                row[5].text = this.tableData.dataRows[index - 1]["indiceDCA"];

                row.map((item) => (item.alignment = "center"));
              }
            });

            doc["content"].push({
              style: { fontSize: 10 },
              alignment: "left",
              margin: [0, 20, 10, 0],
              text: `SUBTOTAL APURADO EM ${
                this.subtotal_data_calculo || "---------"
              } : ${this.formatCurrency(this.total_subtotal)}`,
            });

            doc["content"].push({
              style: { fontSize: 10 },
              alignment: "left",
              margin: [0, 1, 10, 0],
              text: `Honorários ${
                this.formDefaultValues.formHonorarios || 0
              }% : ${this.formatCurrency(this.total_honorarios)}`,
            });

            doc["content"].push({
              style: { fontSize: 10 },
              alignment: "left",
              margin: [0, 1, 10, 0],
              text: `Multa sob contrato ${
                this.formDefaultValues.formMultaSobContrato || 0
              }% : ${this.formatCurrency(this.total_multa_sob_contrato)}`,
            });

            doc["content"].push({
              style: { fontSize: 10 },
              alignment: "left",
              margin: [0, 1, 10, 0],
              text: `TOTAL APURADO EM ${
                this.total_data_calculo || "---------"
              } : ${this.formatCurrency(this.total_grandtotal)}`,
            });
          },
        },
      ],
      language: LANGUAGEM_TABLE,
    };
  }

  filterPago(row) {
    return row["status"] !== PARCELA_PAGA;
  }

  formartTable(acao) {
    const inter = setInterval(() => {
      let table = document.getElementById("tablePre").innerHTML;
      if (table) {
        table = table.replace(/log-visible-false/g, "log-visible-true ");
        table = table.replace(/log-hidden-false/g, "log-hidden-true ");

        clearInterval(inter);
        this.logService
          .addLog([
            {
              data: getCurrentDate("YYYY-MM-DD"),
              usuario: window.localStorage.getItem("username").toUpperCase(),
              pasta: this.infoContrato["pasta"],
              contrato: this.infoContrato["contrato"],
              tipoContrato: this.infoContrato["tipo_contrato"],
              dataSimulacao: this.form_riscos.formDataCalculo,
              acao: acao,
              infoTabela: table,
              modulo: this.isDesagio ? PARCELADO_PRE : PARCELADO_POS,
            },
          ])
          .subscribe((log) => {});
      }
    }, 500);
  }

  atualizarRiscoConcluido() {
    this.updateLoadingBtn = false;
    this.controleLancamentos++;
    this.formartTable("Atualização de Risco");
    this.ultima_atualizacao = getCurrentDate("YYYY-MM-DD");

    this.alertType = {
      mensagem: "Risco Atualizado",
      tipo: "success",
    };
    this.toggleUpdateLoading();
  }

  atualizarRiscoFalha() {
    this.updateLoadingBtn = false;
    this.alertType = {
      mensagem: "Falha ao atualizar risco",
      tipo: "danger",
    };
    this.toggleUpdateLoading();
  }

  atualizarRisco() {
    this.controleLancamentos = 0;

    this.tableData.dataRows.sort((a, b) => {
      return parseFloat(a["nparcelas"]) < parseFloat(b["nparcelas"])
        ? -1
        : parseFloat(a["nparcelas"]) > parseFloat(b["nparcelas"])
        ? 1
        : 0;
    });

    this.tableDataAmortizacao.dataRows.map((armotizacao) => {
      delete armotizacao["incluida"];
    });

    const payload = this.tableData.dataRows.map((parcela) => {
      if (parcela["amortizacaoDataDiferenciada"]) return;

      this.updateLoadingBtn = true;
      let parcelaLocal = { ...parcela };
      parcelaLocal["encargosMonetarios"] = JSON.stringify(
        parcelaLocal["encargosMonetarios"]
      );
      parcelaLocal["infoParaCalculo"] = JSON.stringify(this.formDefaultValues);

      parcelaLocal["valorPMTVincenda"] =
        parseFloat(parcelaLocal["valorPMTVincenda"]) || 0;
      parcelaLocal["subtotal"] = parseFloat(parcelaLocal["subtotal"]) || 0;

      parcelaLocal["amortizacao"] = 0;
      parcelaLocal["status"] = PARCELA_ABERTA;

      parcelaLocal["totalDevedor"] = isVincenda(
        parcelaLocal["dataVencimento"],
        parcelaLocal["dataCalcAmor"]
      )
        ? parcelaLocal["valorPMTVincenda"]
        : parcelaLocal["subtotal"];

      parcelaLocal["contractRef"] = this.contractRef;
      parcelaLocal["tipoParcela"] = this.modulo;
      parcelaLocal["ultimaAtualizacao"] = getCurrentDate("YYYY-MM-DD");
      parcelaLocal["infoParaAmortizacao"] = JSON.stringify(
        this.tableDataAmortizacao
      );

      return parcelaLocal;
    });

    const payloadPut = payload.filter((parcela) => parcela && parcela["id"]);
    payloadPut.length > 0 &&
      this.parceladoPreService.updateLancamento(payloadPut).subscribe(
        (parceladoPreList) => {
          this.atualizarRiscoConcluido();
        },
        (err) => {
          this.atualizarRiscoFalha();
        }
      );

    const payloadPost = payload.filter((parcela) => parcela && !parcela["id"]);
    payloadPost.length > 0 &&
      this.parceladoPreService.addLancamento(payloadPost).subscribe(
        (chequeEmpresarialListUpdated) => {
          this.atualizarRiscoConcluido();
        },
        (err) => {
          this.atualizarRiscoFalha();
        }
      );
  }

  toggleUpdateLoading() {
    this.updateLoading = true;
    setTimeout(() => {
      this.updateLoading = false;
    }, 5000);
  }

  formatCurrency(value) {
    return formatCurrency(value);
  }

  verifyNumber(value) {
    verifyNumber(value);
  }

  formatDate(value, format = "DD/MM/YYYY") {
    return formatDate(value, format);
  }

  formatCurrencyAmortizacao(value) {
    const amortizacao = this.formatCurrency(value);
    return typeof parseFloat(value) === "number" && parseFloat(value) !== 0
      ? `(${amortizacao})`
      : "---";
  }

  limparAmortizacao() {
    const TABLE = (this.tableData.dataRows = this.tableData.dataRows.filter(
      (row) => !row.hasOwnProperty("amortizacaoDataDiferenciada")
    )).map((row) => {
      row["amortizacao"] = 0;
    });

    return TABLE;
  }

  adicionarAmortizacao(amortizacaoTable) {
    let TABLE_AUX;
    amortizacaoTable.map((amor) => {
      delete amor["wasUsed"];
    });

    this.tableDataAmortizacao.dataRows = amortizacaoTable;
    const FINAL = amortizacaoTable.filter(
      (amortizacao) => amortizacao.tipo === AMORTIZACAO_DATA_FINAL
    );

    const DIFERENCIADA = amortizacaoTable.filter(
      (amortizacao) => amortizacao.tipo !== AMORTIZACAO_DATA_FINAL
    );
    //debugger

    // Amortização final
    if (FINAL.length) {
      let valorFinal = FINAL.reduce(
        (curr, next) =>
          (parseFloat(curr?.saldo_devedor) || curr) +
          parseFloat(next.saldo_devedor)
      );

      this.amortizacaoGeral =
        typeof valorFinal === "number" ? valorFinal : valorFinal.saldo_devedor;
    }

    if (DIFERENCIADA.length) {
      this.tableData.dataRows.map((row) => (row["amortizacao"] = 0));
      const TABLE = (this.tableData.dataRows = this.tableData.dataRows.filter(
        (row) => !row.hasOwnProperty("amortizacaoDataDiferenciada")
      ));

      // let valorAmortizacao =
      //   DIFERENCIADA.reduce(
      //     (curr, next) =>
      //       (parseFloat(curr?.saldo_devedor) || curr) +
      //       parseFloat(next.saldo_devedor)
      //   ) || 0;

      // valorAmortizacao =
      //   typeof valorAmortizacao === "number"
      //     ? valorAmortizacao
      //     : valorAmortizacao.saldo_devedor;

      let size = TABLE.length;
      //debugger

      // TABLE_AUX = TABLE;
      // TABLE_AUX = TABLE.slice();
      //  TABLE_AUX = angular.copy(TABLE);
      TABLE_AUX = JSON.parse(JSON.stringify(TABLE));
      let i = 0;
      //debugger
      while (size > i) {
        if (TABLE_AUX[i]["status"] == PARCELA_PAGA) {
          i++;
        } else {
          //debugger
          const NPARCELAS = TABLE_AUX[i]["nparcelas"].split(".")[0];
          const SUBNPARCELAS = TABLE_AUX[i]["nparcelas"].split(".")[1]
            ? parseInt(TABLE_AUX[i]["nparcelas"].split(".")[1]) + 1
            : 1;
          let nextRow = false;
          DIFERENCIADA.map((amor) => {
            //debugger
            // if (nextRow) return;
            if (
              amor.hasOwnProperty("wasUsed") &&
              !amor.hasOwnProperty("residual")
            )
              return;

            const subtotal = parseFloat(TABLE_AUX[i]["subtotal"]);
            const saldoPgo = amor.hasOwnProperty("residual")
              ? amor["residual"]
              : parseFloat(amor["saldo_devedor"]);
            const amortizacao = parseFloat(TABLE_AUX[i]["amortizacao"]);

            switch (true) {
              case subtotal === saldoPgo:
                TABLE_AUX[i]["amortizacao"] = subtotal;
                TABLE_AUX[i]["status"] = PARCELA_PAGA;
                amor["wasUsed"] = true;
                nextRow = true;
                delete amor["residual"];

                break;
              case subtotal < saldoPgo:
                TABLE_AUX[i]["amortizacao"] = subtotal;
                TABLE_AUX[i]["status"] = PARCELA_PAGA;
                TABLE_AUX[i]["isAmortizado"] = true;
                amor["wasUsed"] = true;
                amor["residual"] = saldoPgo - subtotal;

                break;
              case subtotal > saldoPgo:
                TABLE_AUX[i]["amortizacao"] = saldoPgo;
                TABLE_AUX[i]["subtotal"] = subtotal - saldoPgo;

                TABLE_AUX[i]["status"] = PARCELA_AMORTIZADA;
                TABLE_AUX[i]["totalDevedor"] = 0;
                TABLE_AUX[i]["isAmortizado"] = true;

                amor["wasUsed"] = true;
                delete amor["residual"];

                const qtdDias = getQtdDias(
                  formatDate(TABLE_AUX[i]["dataCalcAmor"]),
                  formatDate(amor["data_vencimento"])
                );

                const NEWPARCELAS = {
                  ...TABLE_AUX[i],
                  nparcelas: `${NPARCELAS}.${SUBNPARCELAS}`,
                  dataVencimento: TABLE_AUX[i]["dataCalcAmor"],
                  dataCalcAmor: amor["data_vencimento"],
                  status: PARCELA_ABERTA,
                  amortizacao: 0,
                  isAmortizado: false,
                  encargosMonetarios: {
                    ...TABLE_AUX[i]["encargosMonetarios"],
                    jurosAm: {
                      ...TABLE_AUX[i]["encargosMonetarios"]["jurosAm"],
                      dias: qtdDias,
                    },
                  },

                  amortizacaoDataDiferenciada: true,
                };

                TABLE_AUX.splice(i + 1, 0, NEWPARCELAS);
                size++;
                this.simularCalc(true);
                i++;

                nextRow = true;

                break;
              default:
                break;
            }
          });

          setTimeout(() => {
            this.simularCalc(true);
          }, 0);

          i++;
        }
      }
    }
    this.auxtableData.dataRows = this.tableData.dataRows = TABLE_AUX;
  }

  setFormRiscos(form) {
    Object.keys(form).filter((value, key) => {
      if (form[value] && form[value] !== "undefined") {
        this.form_riscos[value] = form[value];
      }
    });
  }

  falhaIndice() {
    this.updateLoadingBtn = false;
    this.tableLoading = false;

    this.alertType = {
      mensagem: "Não existe índice para essa data",
      tipo: "warning",
    };
    this.toggleUpdateLoading();
    return;
  }

  incluirParcelas(tableDataParcelas, isAmortizacao = false) {
    if (!this.form_riscos.formIndice && !isAmortizacao) {
      this.updateLoadingBtn = false;
      this.alertType = {
        mensagem: "É necessário informar o índice.",
        tipo: "warning",
      };
      this.toggleUpdateLoading();
      return;
    }

    this.setFormDefault();
    this.tableLoading = true;
    let temIndice = [];

    const size = tableDataParcelas.length;
    let i = 0;

    while (size > i) {
      //tableDataParcelas.map(async (parcela, key) => {
      const parcela = tableDataParcelas[i];
      const indice = this.form_riscos.formIndice;
      const dataVencimento = parcela["dataVencimento"];
      const inputExternoDataCalculo = this.form_riscos.formDataCalculo;

      this.total_date_now = formatDate(dataVencimento);
      this.total_data_calculo =
        formatDate(this.form_riscos.formDataCalculo) || getCurrentDate();
      this.subtotal_data_calculo = this.total_date_now;

      const tableDataAmortizacao = this.tableDataAmortizacao.dataRows;
      const amortizacao =
        tableDataAmortizacao.length && tableDataAmortizacao[i]
          ? tableDataAmortizacao[i]
          : {
              preFA_saldo_devedor: 0,
              preFA_data_vencimento: inputExternoDataCalculo,
            };

      const getIndiceDataVencimento = new Promise((res, rej) => {
        this.indicesService
          .getIndiceDataBase(indice, dataVencimento, this.formDefaultValues)
          .then((data) => {
            res(data);
            rej(new Error("Não existe índice para essa data"));
          });
      });

      const getIndiceDataCalcAmor = new Promise((res, rej) => {
        this.indicesService
          .getIndiceDataBase(
            indice,
            amortizacao["preFA_data_vencimento"],
            this.formDefaultValues
          )
          .then((data) => {
            res(data);
            rej(new Error("Não existe índice para essa data"));
          });
      });

      temIndice[i] = false;

      Promise.all([getIndiceDataVencimento, getIndiceDataCalcAmor])
        .then((resultado) => {
          temIndice[i] = true;

          const indiceValor =
            typeof resultado[0] === "number" ? resultado[0] : 1;
          const indiceDataCalcAmor =
            typeof resultado[1] === "number" ? resultado[1] : 1;
          const isVincenda_ = isVincenda(
            dataVencimento,
            amortizacao["preFA_data_vencimento"]
          );

          this.tableData.dataRows.push({
            nparcelas: parcela["nparcelas"].toString(),
            parcelaInicial: parcela["parcelaInicial"],
            dataVencimento: dataVencimento,
            indiceDV: indice,
            indiceDataVencimento: indiceValor,
            indiceDCA: indice,
            indiceDataCalcAmor: indiceDataCalcAmor,
            dataCalcAmor: amortizacao["preFA_data_vencimento"],
            valorNoVencimento: parcela["valorNoVencimento"],
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
            amortizacao: amortizacao["preFA_saldo_devedor"],
            totalDevedor: 0,
            status: parcela["status"],
            contractRef: this.contractRef,
            ultimaAtualizacao: 0,
            totalParcelasVencidas: 0,
            totalParcelasVincendas: 0,
            vincenda: isVincenda_,
            tipoParcela: this.modulo,
            isAmortizado: false,
            infoParaAmortizacao: this.tableDataAmortizacao,
            modulo: isVincenda_ ? PARCELADO_PRE : PARCELADO_POS,
          });

          this.updateLoadingBtn = false;
          if (size === this.tableData.dataRows.length) {
            setTimeout(() => {
              this.parcelas.tableDataParcelas.dataRows = [];
              this.isSimular = true;
              this.alertType = {
                mensagem: "Lançamento incluido",
                tipo: "success",
              };

              const interval = setInterval(() => {
                if (this.isSimular) {
                  clearInterval(interval);
                  this.isSimular = false;
                  this.simularCalc(true, null, true);

                  this.tableData.dataRows.sort((a, b) => {
                    return parseFloat(a["nparcelas"]) <
                      parseFloat(b["nparcelas"])
                      ? -1
                      : parseFloat(a["nparcelas"]) > parseFloat(b["nparcelas"])
                      ? 1
                      : 0;
                  });

                  this.tableLoading = false;
                  this.toggleUpdateLoading();
                }
              }, 1000);

              //this.simularCalc(true, null, true);
            }, 100);
          }
        })
        .catch((erro) => {
          console.log(erro);
          this.falhaIndice();
        });

      i++;
    } //);

    setTimeout(() => {
      if (!temIndice.every((tem) => !!tem)) {
        this.falhaIndice();
      }
      this.tableLoading = false;
    }, 3000);
  }

  setCampoSemAlteracao(semFormat = false) {
    return semFormat ? "---" : "NaN";
  }

  pesquisarContratos(infoContrato) {
    this.tableLoading = true;
    this.ultima_atualizacao = "";
    this.tableData.dataRows = [];
    this.tableDataAmortizacao.dataRows = [];
    this.contractRef = infoContrato.contractRef;
    this.infoContrato = infoContrato;

    this.parceladoPreService.getAll().subscribe(
      (parceladoPreList) => {
        this.tableData.dataRows = parceladoPreList
          .filter(
            (row) =>
              row["contractRef"] === infoContrato.contractRef &&
              row["tipoParcela"] === this.modulo
          )
          .map((parcela, key) => {
            parcela.encargosMonetarios = JSON.parse(parcela.encargosMonetarios);
            parcela.infoParaCalculo = JSON.parse(parcela.infoParaCalculo);
            parcela.infoParaAmortizacao = JSON.parse(
              parcela.infoParaAmortizacao
            );
            this.tableDataAmortizacao = parcela.infoParaAmortizacao
              ? parcela.infoParaAmortizacao
              : this.tableDataAmortizacao;

            Object.keys(parcela.infoParaCalculo).filter((value) => {
              this.formDefaultValues[value] = parcela.infoParaCalculo[value];
            });
            return parcela;
          });

        this.tableData.dataRows.sort((a, b) => {
          return parseFloat(a["nparcelas"]) < parseFloat(b["nparcelas"])
            ? -1
            : parseFloat(a["nparcelas"]) > parseFloat(b["nparcelas"])
            ? 1
            : 0;
        });

        if (this.tableData.dataRows.length) {
          this.tableLoading = false;
          const ultimaAtualizacao = [...this.tableData.dataRows].pop();

          setTimeout(() => {
            if (this.tableDataAmortizacao.dataRows.length) {
              this.adicionarAmortizacao(this.tableDataAmortizacao.dataRows);
            } else {
              this.auxtableData.dataRows = this.tableData.dataRows;
              this.simularCalc(true);
            }
            this.minParcela = parseFloat(ultimaAtualizacao["nparcelas"]) + 1;
          }, 1000);
        } else {
          this.minParcela = 1;
          this.tableLoading = false;
          this.alertType = {
            mensagem: "Nenhuma parcela encontrada!",
            tipo: "warning",
          };
          this.toggleUpdateLoading();
          return;
        }
      },
      (err) => {
        this.tableLoading = false;
        this.alertType = {
          mensagem: "Nenhuma parcela encontrada!",
          tipo: "warning",
        };
        this.toggleUpdateLoading();
      }
    );
  }

  async changeDate(e, row, ColunaData, tipoIndice, tipoIndiceValue) {
    const dataValor = formatDate(e.target.value, "YYYY-MM-DD");

    const getIndice = new Promise((res, rej) => {
      this.indicesService
        .getIndiceDataBase(
          this.formDefaultValues.formIndice,
          dataValor,
          this.formDefaultValues
        )
        .then((data) => {
          res(data);
        });
    });

    Promise.all([getIndice]).then((resultado) => {
      row[ColunaData] = dataValor;
      row[tipoIndiceValue] = resultado[0];
      setTimeout(() => {
        this.updateInlineIndice(
          this.formDefaultValues.formIndice,
          row,
          tipoIndiceValue,
          tipoIndice,
          ColunaData
        );
      }, 0);
    });
  }

  setFormDefault() {
    Object.keys(this.form_riscos).filter((value, key) => {
      if (this.form_riscos[value] && this.form_riscos[value] !== "undefined") {
        this.formDefaultValues[value] = this.form_riscos[value];
      }
    });
  }

  simularCalc(isInlineChange = false, origin = null, ordenar = false) {
    if (origin === "btn") {
      this.setFormDefault();
    }

    let moneyValueTotal = 0,
      multaTotal = 0,
      subtotalTotal = 0,
      amortizacaoTotal = 0,
      totalDevedorTotal = 0,
      correcaoPeloIndiceTotal = 0,
      valorNoVencimentoTotal = 0;
    let valorPMTVincendaTotalVincendas = 0,
      totalDevedorTotalVincendas = 0;

    this.tableData.dataRows.map(async (row, key) => {
      if (!isInlineChange) {
        const indice = this.formDefaultValues.formIndice;
        row["indiceDV"] = indice;
        row["indiceDCA"] = indice;
      }

      const getIndiceDataVencimento = new Promise((res, rej) => {
        this.indicesService
          .getIndiceDataBase(
            row["indiceDV"],
            row["dataVencimento"],
            this.formDefaultValues
          )
          .then((data) => {
            res(data);
          });
      });

      const getIndiceDataCalcAmor = new Promise((res, rej) => {
        this.indicesService
          .getIndiceDataBase(
            row["indiceDCA"],
            row["dataCalcAmor"],
            this.formDefaultValues
          )
          .then((data) => {
            res(data);
          });
      });

      Promise.all([getIndiceDataVencimento, getIndiceDataCalcAmor]).then(
        (resultado) => {
          row["indiceDataVencimento"] = resultado[0];
          row["indiceDataCalcAmor"] = resultado[1];

          setTimeout(() => {
            // Valores brutos
            const dataVencimento = formatDate(row["dataVencimento"]);
            const dataCalcAmor = formatDate(row["dataCalcAmor"]);

            const indiceDataVencimento = row["indiceDataVencimento"] / 100;
            const indiceDataCalcAmor = row["indiceDataCalcAmor"] / 100;

            if (row["amortizacaoDataDiferenciada"]) {
              const rowAnterior = this.tableData.dataRows[key - 1];
              row["valorNoVencimento"] = rowAnterior["totalBackup"];
            }

            const valorNoVencimento =
              typeof row["valorNoVencimento"] === "string"
                ? parseFloat(row["valorNoVencimento"])
                : row["valorNoVencimento"];
            // const vincenda = isVincenda(
            //   row["dataVencimento"],
            //   this.formDefaultValues.formDataCalculo
            // );

            const amortizacao = parseFloat(row["amortizacao"]);
            const vincenda = isVincenda(
              row["dataVencimento"],
              row["dataCalcAmor"]
            );

            let porcentagem =
              this.formDefaultValues.formJuros / 100 ||
              parseFloat(
                row["encargosMonetarios"]["jurosAm"]["percentsJuros"]
              ) / 100;

            // Calculos
            const correcaoPeloIndice =
              (valorNoVencimento / indiceDataVencimento) * indiceDataCalcAmor -
              valorNoVencimento;
            const qtdDias = getQtdDias(dataVencimento, dataCalcAmor);
            porcentagem = (porcentagem / 30) * qtdDias;
            const valor =
              (valorNoVencimento + correcaoPeloIndice) * porcentagem;
            const multa = row["amortizacaoDataDiferenciada"]
              ? 0
              : (valorNoVencimento + correcaoPeloIndice + valor) *
                (this.formDefaultValues.formMulta / 100);
            const subtotal =
              valorNoVencimento + correcaoPeloIndice + valor + multa;

            let setCampoSemAlteracao = false;
            if (
              (row["isAmortizado"] && row["status"] === PARCELA_ABERTA) ||
              row["status"] === PARCELA_PAGA
            ) {
              setCampoSemAlteracao = true;
            }

            const totalDevedor = subtotal - amortizacao;
            const desagio = vincenda
              ? Math.pow(
                  this.formDefaultValues.formDesagio / 100 + 1,
                  -qtdDias / 30
                )
              : 1;
            debugger;
            const valorPMTVincenda = valorNoVencimento * desagio;

            // Table Valuesinclui
            if (vincenda) {
              row["totalBackup"] = valorPMTVincenda - amortizacao;

              row["encargosMonetarios"][
                "correcaoPeloIndice"
              ] = this.setCampoSemAlteracao();
              row["encargosMonetarios"]["jurosAm"][
                "dias"
              ] = this.setCampoSemAlteracao(true);
              row["encargosMonetarios"]["jurosAm"][
                "percentsJuros"
              ] = this.setCampoSemAlteracao(true);
              row["encargosMonetarios"]["jurosAm"][
                "moneyValue"
              ] = this.setCampoSemAlteracao();
              row["encargosMonetarios"]["multa"] = this.setCampoSemAlteracao();
              row["subtotal"] = this.setCampoSemAlteracao();
              row["valorPMTVincenda"] = valorPMTVincenda.toFixed(2);
              row["amortizacao"] = amortizacao.toFixed(2);
              row["totalDevedor"] = setCampoSemAlteracao
                ? this.setCampoSemAlteracao()
                : valorPMTVincenda.toFixed(2);
              row["vincenda"] = true;

              if (!setCampoSemAlteracao) {
                valorPMTVincendaTotalVincendas += valorPMTVincenda;
                totalDevedorTotalVincendas += valorPMTVincenda;
              }
            } else {
              row["totalBackup"] = subtotal - amortizacao;

              row["encargosMonetarios"][
                "correcaoPeloIndice"
              ] = correcaoPeloIndice.toFixed(2);
              row["encargosMonetarios"]["jurosAm"]["dias"] = qtdDias;
              row["encargosMonetarios"]["jurosAm"][
                "percentsJuros"
              ] = porcentagem ? (porcentagem * 100).toFixed(2) : 0;
              row["encargosMonetarios"]["jurosAm"][
                "moneyValue"
              ] = valor.toFixed(2);
              row["encargosMonetarios"]["multa"] = row[
                "amortizacaoDataDiferenciada"
              ]
                ? this.setCampoSemAlteracao()
                : multa.toFixed(2);
              row["subtotal"] = subtotal.toFixed(2);
              row["valorPMTVincenda"] = this.setCampoSemAlteracao();
              row["amortizacao"] = amortizacao.toFixed(2);
              row["totalDevedor"] = setCampoSemAlteracao
                ? this.setCampoSemAlteracao()
                : totalDevedor.toFixed(2);
              row["vincenda"] = false;
              row["desagio"] = desagio;

              if (!setCampoSemAlteracao) {
                moneyValueTotal += valor;
                multaTotal += multa;
                subtotalTotal += subtotal;
                amortizacaoTotal += amortizacao;
                totalDevedorTotal += totalDevedor;
                correcaoPeloIndiceTotal += correcaoPeloIndice;
                valorNoVencimentoTotal += valorNoVencimento;
              }
            }

            if (this.tableData.dataRows.length - 1 === key) {
              this.totalParcelasVencidas = {
                moneyValue: moneyValueTotal || 0,
                multa: multaTotal || 0,
                subtotal: subtotalTotal || 0,
                amortizacao: amortizacaoTotal || 0,
                totalDevedor: totalDevedorTotal || 0,
                correcaoPeloIndice: correcaoPeloIndiceTotal || 0,
                valorNoVencimento: valorNoVencimentoTotal || 0,
              };

              this.totalParcelasVincendas = {
                totalDevedor: totalDevedorTotalVincendas || 0,
                valorPMTVincenda: valorPMTVincendaTotalVincendas || 0,
              };

              this.subtotal_data_calculo = this.total_data_calculo = formatDate(
                this.formDefaultValues.formDataCalculo
              );

              // const tmpSubTotal = this.tableData.dataRows.reduce((total = 0, row2) => {
              //   const val1 = typeof(total) === 'number' ? total : parseFloat(total['subtotal']);
              //   const val2 =  parseFloat(row2['subtotal'])
              //   return val1 + val2;
              // });
              this.total_subtotal =
                totalDevedorTotalVincendas + totalDevedorTotal;
              this.total_honorarios =
                (this.total_subtotal + this.amortizacaoGeral) *
                (this.formDefaultValues["formHonorarios"] / 100);
              this.total_multa_sob_contrato =
                (this.total_subtotal +
                  this.amortizacaoGeral +
                  this.total_honorarios) *
                (this.formDefaultValues["formMultaSobContrato"] / 100);
              this.total_grandtotal =
                this.total_subtotal -
                this.amortizacaoGeral +
                this.total_honorarios +
                this.total_multa_sob_contrato;

              if (origin === "btn") {
                this.formartTable("Simulação");
                this.alertType = {
                  mensagem: "Cálculo Simulado",
                  tipo: "success",
                };
                this.toggleUpdateLoading();
              }
              this.tableLoading = false;
              !isInlineChange && this.toggleUpdateLoading();
            }
          }, 0);
        }
      );
    });
    return true;
  }

  delete(row, table) {
    const index = this[table].dataRows.indexOf(row);

    this[table].dataRows.splice(index, 1);
    setTimeout(() => {
      this.simularCalc(false);
      this.alertType = {
        mensagem: "Registro excluido!",
        tipo: "danger",
      };
      this.toggleUpdateLoading();
    }, 0);
  }

  deleteRow(row) {
    if (!row.id) {
      this.delete(row, "tableData");
    } else {
      this.parceladoPreService.removeLancamento(row.id).subscribe(() => {
        this.delete(row, "tableData");
      });
    }
  }

  deleteRowAmortizacao(tableData) {
    const rowAmortizacao = tableData[0];
    const tableAmortizacao = tableData[1];
    const saldo = parseFloat(rowAmortizacao.saldo_devedor);

    switch (rowAmortizacao.tipo) {
      case AMORTIZACAO_DATA_ATUAL:
        this.tableDataAmortizacao.dataRows = [];
        this.tableData.dataRows.map((row) => {
          row["amortizacao"] = 0;
          row["totalDevedor"] = row["subtotal"];
          row["status"] = PARCELA_ABERTA;
          row["infoParaAmortizacao"]["dataRows"] = tableAmortizacao;
        });

        setTimeout(() => {
          this.adicionarAmortizacao(tableAmortizacao);
        }, 100);

        break;
      case AMORTIZACAO_DATA_DIFERENCIADA:
        this.tableDataAmortizacao.dataRows = [];
        this.tableData.dataRows = this.tableData.dataRows
          .filter((row) => !row["amortizacaoDataDiferenciada"])
          .map((row) => {
            row["amortizacao"] = 0;
            row["totalDevedor"] = row["subtotal"];
            row["isAmortizado"] = false;
            row["status"] = PARCELA_ABERTA;
            return row;
          });

        setTimeout(() => {
          this.adicionarAmortizacao(tableAmortizacao);
        }, 500);

        break;
      case AMORTIZACAO_DATA_FINAL:
        this.amortizacaoGeral -= saldo;
        this.simularCalc();
        break;
      default:
        break;
    }
  }

  async updateInlineIndice(
    value,
    row,
    innerDataIndice,
    indiceColumn,
    columnData
  ) {
    const getIndice = new Promise((res, rej) => {
      this.indicesService
        .getIndiceDataBase(value, row[columnData], this.formDefaultValues)
        .then((data) => {
          res(data);
        });
    });

    Promise.all([getIndice]).then((resultado) => {
      const index = this.tableData.dataRows.indexOf(row);
      this.tableData.dataRows[index][indiceColumn] = value;
      this.tableData.dataRows[index][innerDataIndice] = resultado[0];

      setTimeout(() => {
        this.simularCalc(true, null, true);
      }, 0);
    });
  }
}
