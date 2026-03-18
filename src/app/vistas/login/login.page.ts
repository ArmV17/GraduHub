import { Component, inject } from '@angular/core';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importaciones de Firebase
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  // Variables de formulario
  numEmpleado: string = '';
  password: string = '';

  // Inyección de servicios
  private auth = inject(Auth);
  private navCtrl = inject(NavController); // Para navegación raíz
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);

  constructor() {}

  /**
   * Ejecuta la lógica de inicio de sesión
   */
  async login() {
    // 1. Validación de campos vacíos
    if (!this.numEmpleado || !this.password) {
      this.presentToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    // 2. Mostrar indicador de carga
    const loading = await this.loadingController.create({
      message: 'Verificando credenciales...',
      spinner: 'crescent',
      cssClass: 'custom-loading' // Por si quieres darle estilo en el global.scss
    });
    await loading.present();

    try {
      /**
       * 3. Intento de Login 
       * Formateamos el número de empleado para que actúe como correo: 123@estudio.com
       */
      const email = `${this.numEmpleado.trim()}@estudio.com`;
      
      await signInWithEmailAndPassword(
        this.auth, 
        email, 
        this.password
      );

      // 4. Éxito: Navegación al HOME
      // Usamos navigateRoot para que el Home sea la nueva raíz y no se pueda volver al Login con el botón atrás
      await loading.dismiss();
      this.navCtrl.navigateRoot('/home', { animated: true, animationDirection: 'forward' });

    } catch (error: any) {
      await loading.dismiss();
      console.error('Error de login:', error);

      // Manejo de mensajes de error amigables
      let mensaje = 'Error al iniciar sesión';
      
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/invalid-credential'
      ) {
        mensaje = 'Número de empleado o contraseña incorrectos';
      } else if (error.code === 'auth/network-request-failed') {
        mensaje = 'Sin conexión a internet';
      } else if (error.code === 'auth/too-many-requests') {
        mensaje = 'Demasiados intentos fallidos. Intenta más tarde.';
      }

      this.presentToast(mensaje, 'danger');
    }
  }

  /**
   * Muestra alertas rápidas en la parte inferior
   */
  async presentToast(message: string, color: 'danger' | 'success' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      mode: 'ios'
    });
    await toast.present();
  }
}