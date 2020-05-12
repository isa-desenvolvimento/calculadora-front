import { Routes } from '@angular/router';

import { ChequeEmpresarialComponent } from '../../pages/cheque-empresarial/cheque-empresarial.component';
import { ParceladoPosComponent } from '../../pages/parcelado-pos/parcelado-pos.component';
import { ParceladoPreComponent } from '../../pages/parcelado-pre/parcelado-pre.component';


import { UserComponent } from '../../pages/user/user.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'cheque-empresarial',      component: ChequeEmpresarialComponent },
    { path: 'parcelado-pre',      component: ParceladoPreComponent },
    { path: 'parcelado-pos',      component: ParceladoPosComponent },
    { path: 'user',           component: UserComponent }

];
