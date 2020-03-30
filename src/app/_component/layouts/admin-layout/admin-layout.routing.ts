import { Routes } from '@angular/router';

import { ChequeEmpresarialComponent } from '../../pages/cheque-empresarial/cheque-empresarial.component';
import { UserComponent } from '../../pages/user/user.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'cheque-empresarial',      component: ChequeEmpresarialComponent },
    { path: 'user',           component: UserComponent }

];
