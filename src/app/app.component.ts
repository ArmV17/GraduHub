import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular'; // Importar IonicModule
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true, // Tu componente es standalone
  imports: [IonicModule, CommonModule], // AQUÍ es donde debes agregarlo
})
export class AppComponent implements OnInit {
  private auth = inject(Auth);
  private navCtrl = inject(NavController);

  constructor() {}

  ngOnInit() {
    // Observador para redirección automática y protección
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.navCtrl.navigateRoot('/home');
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }
}