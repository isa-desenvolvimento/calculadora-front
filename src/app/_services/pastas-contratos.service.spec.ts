import { TestBed } from '@angular/core/testing';

import { PastasContratosService } from './pastas-contratos.service';

describe('PastasContratosService', () => {
  let service: PastasContratosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PastasContratosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
