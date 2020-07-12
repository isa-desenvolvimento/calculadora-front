import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { isVincenda} from '../_component/util/util'
import { CHEQUE_EMPRESARIAL} from '../_component/util/constants'


@Directive({
  selector: '[vincendas]'
})
export class VincendasDirective implements OnInit {
  @Input() vincendas: any;

  
  constructor(private el: ElementRef) { }

  
  ngOnInit() {
    const valid = this.vincendas.modulo === CHEQUE_EMPRESARIAL ? !this.vincendas.isTipoLancamento : isVincenda(this.vincendas?.dataVencimento, this.vincendas?.infoParaCalculo?.formDataCalculo) ;
    if (valid) {
      this.el.nativeElement.style.backgroundColor = '#f4f3ef';
    }
  }

}
