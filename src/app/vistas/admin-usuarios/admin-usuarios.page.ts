import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, LoadingController, NavController } from '@ionic/angular';

// Firebase
import { Auth, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

// Iconos e Interfaz
import { addIcons } from 'ionicons';
import { 
  personAddOutline, keyOutline, idCardOutline, 
  personOutline, calendarOutline, logOutOutline,
  shieldCheckmarkOutline 
} from 'ionicons/icons';

// Cifrado
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.page.html',
  styleUrls: ['./admin-usuarios.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminUsuariosPage {
  // Variables del formulario
  numEmpleado: string = '';
  password: string = '';
  nombreEmpleado: string = ''; 
  rolSeleccionado: string = 'empleado'; // Valor por defecto

  public navCtrl = inject(NavController);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private readonly secretKey = environment.cryptoKey;

  constructor() {
    addIcons({ 
      personAddOutline, keyOutline, idCardOutline, 
      personOutline, calendarOutline, logOutOutline,
      shieldCheckmarkOutline 
    });
  }

  async registrarEmpleado() {
    if (!this.numEmpleado || !this.password || !this.nombreEmpleado || !this.rolSeleccionado) {
      this.presentToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ 
      message: 'Registrando usuario...', 
      spinner: 'crescent',
      mode: 'ios'
    });
    await loading.present();

    try {
      // 1. Cifrar nombre
      const nombreCifrado = CryptoJS.AES.encrypt(this.nombreEmpleado.trim(), this.secretKey).toString();
      const email = `${this.numEmpleado.trim()}@estudio.com`;

      // 2. Crear en Auth
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, this.password);
      const uid = userCredential.user.uid;

      // 3. Guardar en Firestore con el ROL seleccionado
      await setDoc(doc(this.firestore, `usuarios/${uid}`), {
        numEmpleado: this.numEmpleado.trim(),
        nombre: nombreCifrado,
        rol: this.rolSeleccionado, // 'admin' o 'empleado'
        fechaRegistro: new Date().getTime()
      });

      await loading.dismiss();
      this.presentToast(`Usuario registrado como ${this.rolSeleccionado}`, 'success');
      
      // Limpiar campos
      this.numEmpleado = ''; 
      this.password = ''; 
      this.nombreEmpleado = '';
      this.rolSeleccionado = 'empleado';

    } catch (error: any) {
      await loading.dismiss();
      let msg = 'Error al registrar';
      if (error.code === 'auth/email-already-in-use') msg = 'Este número ya está registrado';
      this.presentToast(msg, 'danger');
    }
  }

  async logout() {
    await signOut(this.auth);
    this.navCtrl.navigateRoot('/login');
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, color: color as any, duration: 2500, mode: 'ios' });
    t.present();
  }
}