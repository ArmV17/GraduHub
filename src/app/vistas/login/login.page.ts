import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, LoadingController } from '@ionic/angular';

// Firebase Auth & Firestore
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

// Iconos
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  numEmpleado: string = '';
  password: string = '';

  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private navCtrl = inject(NavController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  constructor() {
    addIcons({ personOutline, lockClosedOutline, logInOutline });
  }

  async login() {
    if (!this.numEmpleado || !this.password) {
      this.presentToast('Por favor, ingresa tus credenciales', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      // FORZAR LIMPIEZA: Eliminamos cualquier rastro del usuario anterior
      await signOut(this.auth);

      const email = `${this.numEmpleado.trim()}@estudio.com`;
      await signInWithEmailAndPassword(this.auth, email, this.password);

      // Verificamos el rol en Firestore para saber a dónde mandarlo
      const usuariosRef = collection(this.firestore, 'usuarios');
      const q = query(usuariosRef, where("numEmpleado", "==", this.numEmpleado.trim()));
      const querySnapshot = await getDocs(q);

      await loading.dismiss();

      if (!querySnapshot.empty) {
        const rol = querySnapshot.docs[0].data()['rol'];
        if (rol === 'admin') {
          this.navCtrl.navigateRoot('/admin-home');
        } else {
          // Ruta de Staff (Tabs)
          this.navCtrl.navigateRoot('/tabs/home');
        }
      } else {
        this.navCtrl.navigateRoot('/tabs/home');
      }

    } catch (error: any) {
      await loading.dismiss();
      this.presentToast('Número de empleado o contraseña incorrectos', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color as any,
      position: 'bottom'
    });
    toast.present();
  }
}