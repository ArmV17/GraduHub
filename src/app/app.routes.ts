import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./vistas/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    loadComponent: () => import('./vistas/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./vistas/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'entrega',
        loadComponent: () => import('./vistas/entrega/entrega.page').then(m => m.EntregaPage)
      },
      {
        path: 'recepcion',
        loadComponent: () => import('./vistas/recepcion/recepcion.page').then(m => m.RecepcionPage)
      },
      {
        path: 'medicion',
        loadComponent: () => import('./vistas/medicion/medicion.page').then(m => m.MedicionPage)
      }
    ]
  }
];