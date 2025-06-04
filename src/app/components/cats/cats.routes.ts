import { Routes } from '@angular/router';
import { CatListComponent } from './list/list.component';
import { CatDetailComponent } from './detail/detail.component';
import { CatFormComponent } from './form/form.component';
import { authGuard } from '../../guards/authorization.guard';

export const CATS_ROUTES: Routes = [
  { path: '', component: CatListComponent }, // /cats mostra la lista/mappa
  { path: 'new', component: CatFormComponent, canActivate: [authGuard] }, // /cats/new per creare un gatto
  { path: ':id', component: CatDetailComponent }, // /cats/:id per il dettaglio
  { path: ':id/edit', component: CatFormComponent, canActivate: [authGuard] } // /cats/:id/edit per la modifica 
];