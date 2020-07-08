import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import * as moment from 'moment'; // add this 1 of 4

@Directive({
  selector: '[vincendas]'
})
export class VincendasDirective implements OnInit {
  @Input() vincendas: any;

  
  constructor(private el: ElementRef) { }
  
  ngOnInit() {
    const dtVencimento =  moment(this.vincendas.dataVencimento);
    const dtCalcAmor = moment(this.vincendas.infoParaCalculo.formDataCalculo);
    const vincenda = dtVencimento > dtCalcAmor;

    if (vincenda) {
      this.el.nativeElement.style.backgroundColor = '#f4f3ef';
    }
  }

}
