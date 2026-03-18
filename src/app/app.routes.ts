import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./vistas/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./vistas/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'medicion',
        loadComponent: () => import('./vistas/medicion/medicion.page').then(m => m.MedicionPage)
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
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./vistas/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'entrega',
    loadComponent: () => import('./vistas/entrega/entrega.page').then( m => m.EntregaPage)
  },
  {
    path: 'recepcion',
    loadComponent: () => import('./vistas/recepcion/recepcion.page').then( m => m.RecepcionPage)
  },
  {
    path: 'medicion',
    loadComponent: () => import('./vistas/medicion/medicion.page').then( m => m.MedicionPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./vistas/login/login.page').then( m => m.LoginPage)
  }
];