import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router'; 
import { filter } from 'rxjs/operators';

// Firebase
import { Auth, authState, signOut } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { homeOutline, archiveOutline, addCircleOutline, personOutline, logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class TabsPage implements OnInit {
  private auth = inject(Auth);
  private navCtrl = inject(NavController);
  private router = inject(Router);

  // Cambiamos la variable para que guarde tu nombre
  public nombreUsuario: string = 'JOSE ARMANDO'; 
  public selectedTab: string = 'home';

  constructor() {
    addIcons({ homeOutline, archiveOutline, addCircleOutline, personOutline, logOutOutline });
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects;
      if (url.includes('home')) this.selectedTab = 'home';
      if (url.includes('medicion')) this.selectedTab = 'medicion';
      if (url.includes('recepcion')) this.selectedTab = 'recepcion';
      if (url.includes('entrega')) this.selectedTab = 'entrega';
    });
  }

  ngOnInit() {
    // Verificamos sesión y personalizamos el saludo
    authState(this.auth).subscribe(user => {
      if (user) {
        // Aquí podrías traer el nombre desde Firestore si lo prefieres,
        // pero por ahora lo dejamos con tu nombre real:
        this.nombreUsuario = 'JOSE ARMANDO';
      }
    });
  }

  async logout() {
    await signOut(this.auth);
    this.navCtrl.navigateRoot('/login');
  }
}