import { Component, OnInit, inject } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular'; 
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AppComponent implements OnInit {
  private auth = inject(Auth);
  private navCtrl = inject(NavController);

  constructor() {}

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.navCtrl.navigateRoot('/home');
      } else {
        this.navCtrl.navigateRoot('/login');
      }
    });
  }
}