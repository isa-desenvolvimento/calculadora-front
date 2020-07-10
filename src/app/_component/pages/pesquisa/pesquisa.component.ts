import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PastasContratosService } from '../../../_services/pastas-contratos.service';

@Component({
  selector: 'app-pesquisa',
  templateUrl: './pesquisa.component.html'
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
      pasta: ['', Validators.required],
      contrato: ['', Validators.required],
      tipo_contrato: ['', Validators.required]
    });
  }

  setContractRef() {
    const pasta = this.form.pasta.value;
    const contrato = this.form.contrato.value;
    const tipo_contrato = this.form.tipo_contrato.value;

    this.txtContractRef = pasta + contrato + tipo_contrato;
    this.resetForm.emit(true);
    const info = {
      pasta,
      contrato,
      tipo_contrato,
      contractRef: this.txtContractRef
    };

    this.contractRef.emit(info);
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
    
    this.peForm.value.contrato = '';
    this.peForm.value.tipo_contrato = '';

    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.form.pasta.value) {
        this.contractList_field.push(pasta.CONTRATO);
      }
    });

    const setUnico = new Set(this.contractList_field);
    this.contractList_field = [...setUnico];
  }

  setTypeContract() {
    this.typeContractList_field = [];
    this.peForm.value.tipo_contrato = '';

    this.pastas['data'].map(pasta => {
      if (pasta.PASTA === this.form.pasta.value && pasta.CONTRATO === this.form.contrato.value) {
        this.typeContractList_field.push(pasta.DESCRICAO);
      }
    });

    const setUnico = new Set(this.typeContractList_field);
    this.typeContractList_field = [...setUnico];
  }

  get pastas() { return this.pastasContratosService.getPastas(); }
  get form() { return this.peForm.controls; }
}
