import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChequeEmpresarial } from '../../../_models/ChequeEmpresarial';


@Component({
    selector: 'cheque-empresarial-cmp',
    moduleId: module.id,
    templateUrl: 'cheque-empresarial.component.html'
})

export class ChequeEmpresarialComponent implements OnInit{

  ceForm: FormGroup;


  loading = false;
  submitted = false;
  returnUrl: string;
  errorMessage = '';
  payload: ChequeEmpresarial;


  constructor(
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.ceForm = this.formBuilder.group({
      ce_pasta: ['', Validators.required],
      ce_contrato: ['', Validators.required],
      ce_tipo_contrato: ['', Validators.required]
    });
  }

  // convenience getter for easy access to form fields
  get f1() { return this.ceForm.controls; }



  resetFields() {
    this.ceForm.reset()
  }
}
