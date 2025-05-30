import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { DetailComponent } from './detail/detail.component';
import { FormComponent } from './form/form.component';
import { authGuard } from '../../guards/authorization.guard';

export const CATS_ROUTES: Routes = [
  { path: '', component: ListComponent, canActivate: [authGuard] }, // /cats mostra la lista/mappa
  { path: 'new', component: FormComponent, canActivate: [authGuard]  }, // /cats/new per creare un gatto
  { path: ':id', component: DetailComponent, canActivate: [authGuard]  }, // /cats/:id per il dettaglio
  { path: ':id/edit', component: FormComponent, canActivate: [authGuard] } // /cats/:id/edit per la modifica 
];