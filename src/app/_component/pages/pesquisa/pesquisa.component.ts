import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PastasContratosService } from '../../../_services/pastas-contratos.service';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html',
  styleUrls: ['./pesquisa.component.css']
})
export class PesquisaComponent implements OnInit {

  peForm: FormGroup;
  txtContractRef: string = '';

  @Input() tableLoading: boolean;
  @Output() contractRef = new EventEmitter();
  @Output() resetForm = new EventEmitter();


  contractList_field = [];
  typeContractList_field = [];
  folderData_field = this.agruparPasta();

  constructor(
    private formBuilder: FormBuilder,
    private pastasContratosService: PastasContratosService
  ) {
  }

  ngOnInit(): void {
    this.peForm = this.formBuilder.group({
      pe_pasta: ['', Validators.required],
      pe_contrato: ['', Validators.required],
      pe_tipo_contrato: ['', Validators.required]
    });
  }

  setContractRef() {
    const pasta = this.pe_form.pe_pasta.value;
    const contrato = this.pe_form.pe_contrato.value;
    const tipo_contrato = this.pe_form.pe_tipo_contrato.value;

    this.txtContractRef = pasta + contrato + tipo_contrato;
    this.resetForm.emit(true);
    this.contractRef.emit(this.txtContractRef);
  }


  agruparPasta() {
    let pastasFiltros = [];

    this.pastas['data'].map(pasta => pastasFiltros.push(pasta.PASTA));
    const setUnico = new Set(pastasFiltros);

    return [...setUnico];
  }

  setContrato() {
    this.contractList_field = [];
    this.typeContractList_field = [];
    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.pe_form.pe_pasta.value) {
        this.contractList_field.push(pasta.CONTRATO);
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];
  }

  setTypeContract() {
    this.typeContractList_field = [];
    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.pe_form.pe_pasta.value && pasta.CONTRATO === this.pe_form.pe_contrato.value) {
        this.typeContractList_field.push(pasta.DESCRICAO);
      }
    });

    const setUnico = new Set(this.typeContractList_field);
    this.typeContractList_field = [...setUnico];
  }

  get pastas() { return this.pastasContratosService.getPastas(); }
  get pe_form() { return this.peForm.controls; }


}
