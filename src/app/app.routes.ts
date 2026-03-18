import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// ... imports
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./vistas/login/login.page').then(m => m.LoginPage) },
  
  {
    path: 'admin-home',
    loadComponent: () => import('./vistas/admin-home/admin-home.page').then(m => m.AdminHomePage),
    canActivate: [authGuard, adminGuard] 
  },
  {
    path: 'admin-usuarios',
    loadComponent: () => import('./vistas/admin-usuarios/admin-usuarios.page').then(m => m.AdminUsuariosPage),
    canActivate: [authGuard, adminGuard]
  },

  {
    path: 'tabs', // <--- CAMBIA ESTO: De '' a 'tabs'
    loadComponent: () => import('./vistas/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./vistas/home/home.page').then(m => m.HomePage) },
      { path: 'entrega', loadComponent: () => import('./vistas/entrega/entrega.page').then(m => m.EntregaPage) },
      { path: 'recepcion', loadComponent: () => import('./vistas/recepcion/recepcion.page').then(m => m.RecepcionPage) },
      { path: 'medicion', loadComponent: () => import('./vistas/medicion/medicion.page').then(m => m.MedicionPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];