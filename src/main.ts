import 'zone.js'; // <-- ESTO DEBE SER SIEMPRE LA LÍNEA 1
import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';

// Movimos el alert aquí para asegurar que los polyfills cargaron
alert("¡Iniciando Bootstrap!");

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
}).catch(err => {
  // SI HAY UN ERROR DE ANGULAR, ESTO TE LO MOSTRARÁ EN EL CELULAR
  alert("ERROR DE BOOTSTRAP: " + err);
  console.error(err);
});