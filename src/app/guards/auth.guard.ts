import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Observable<boolean>((observer) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        observer.next(true); // Hay sesión, adelante
      } else {
        router.navigate(['/login']); // No hay sesión, fuera de aquí
        observer.next(false);
      }
      observer.complete();
    });
  });
};