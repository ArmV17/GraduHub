import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // 1. Ruta inicial clara
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  
  // 2. Login (Sin guardias para que siempre pueda cargar)
  { 
    path: 'login', 
    loadComponent: () => import('./vistas/login/login.page').then(m => m.LoginPage) 
  },
  
  // 3. Rutas de Admin
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

  // 4. Tabs (Ruta corregida)
  {
    path: 'tabs',
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

  // 5. Comodín (Siempre al final)
  { path: '**', redirectTo: 'login' }
];