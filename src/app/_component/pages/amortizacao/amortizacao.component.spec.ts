import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmortizacaoComponent } from './amortizacao.component';

describe('AmortizacaoComponent', () => {
  let component: AmortizacaoComponent;
  let fixture: ComponentFixture<AmortizacaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AmortizacaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmortizacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
