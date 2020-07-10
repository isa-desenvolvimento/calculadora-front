import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { isVincenda} from '../_component/util/util'

@Directive({
  selector: '[vincendas]'
})
export class VincendasDirective implements OnInit {
  @Input() vincendas: any;

  
  constructor(private el: ElementRef) { }
  
  ngOnInit() {
    if (isVincenda(this.vincendas || this.vincendas?.dataVencimento, this.vincendas?.infoParaCalculo?.formDataCalculo)) {
      this.el.nativeElement.style.backgroundColor = '#f4f3ef';
    }
  }

}
