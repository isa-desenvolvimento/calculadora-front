import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { IndicesService } from '../../../_services/indices.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { getCurrentDate, verifyNumber } from '../../util/util';
import { LISTA_INDICES } from '../../util/constants'

@Component({
  selector: 'app-simulacao',
  templateUrl: './simulacao.component.html'
})
export class SimulacaoComponent implements OnInit {

  formRiscos: FormGroup;
  @Input() updateLoadingBtn: boolean;
  @Input() tableDataLength: boolean;

  @Output() formValue = new EventEmitter();
  @Output() simularCalculo = new EventEmitter();
  @Output() salvar = new EventEmitter();

  indice_field = LISTA_INDICES;

  constructor(
    private formBuilder: FormBuilder,
    private indicesService: IndicesService,
  ) {
  }

  ngOnInit(): void {
    this.formRiscos = this.formBuilder.group({
      formDataCalculo: getCurrentDate('YYYY-MM-DD'),
      formUltimaAtualizacao: '',
      formMulta: [],
      formJuros: [],
      formHonorarios: [],
      formMultaSobContrato: [],
      formIndice:  [],
      formIndiceEncargos: []
    });

    this.changeInput()
  }

  simular() {
    this.simularCalculo.emit();
  }

  atualizarRisco() {
    this.formRiscos.value.formUltimaAtualizacao = getCurrentDate('YYYY-MM-DD');
    this.salvar.emit();
  }

  resetForm(e) {
    this.formRiscos.reset({ formDataCalculo: getCurrentDate('YYYY-MM-DD') });
    setTimeout(() => {
      this.changeInput(e);
    }, 100);
  }

  validarNumeros(e) {
    verifyNumber(e.target.value);
    this.changeInput(e);
  }

  changeInput(e = null) {
    this.formValue.emit(this.formRiscos.value);
  }

  get form_riscos() { return this.formRiscos.controls; }
}
