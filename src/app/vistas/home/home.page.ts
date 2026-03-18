import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Auth, signOut } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { 
  locationOutline, calendarOutline, timeOutline, 
  schoolOutline, personOutline, searchOutline, logOutOutline,
  chatbubbleEllipsesOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private readonly secretKey = environment.cryptoKey;

  public eventos$!: Observable<any[]>;

  constructor() {
    addIcons({ 
      locationOutline, calendarOutline, timeOutline, 
      schoolOutline, personOutline, searchOutline, logOutOutline,
      chatbubbleEllipsesOutline 
    });
  }

  ngOnInit() {
    const ref = collection(this.firestore, 'medidas');
    this.eventos$ = collectionData(ref, { idField: 'id' }).pipe(
      map(alumnos => {
        const descifrados = alumnos.map((a: any) => ({
          ...a,
          nombreCompleto: this.decrypt(a['nombreCompleto']),
          escuela: this.decrypt(a['escuela']),
          lugar: this.decrypt(a['lugar'] || 'Sin Ubicación'),
          notas: this.decrypt(a['notas'] || ''), // Desciframos notas para el Home
          fecha: a['fechaEvento'] || 'Pendiente',
          hora: a['horaEvento'] || '00:00',
          grado: a['grado'] || 'S/N',
          turno: a['turno'] || 'Único'
        }));

        const gruposMap: any = {};
        descifrados.forEach(a => {
          const key = `${a.lugar}-${a.fecha}-${a.escuela}-${a.grado}`;
          if (!gruposMap[key]) {
            gruposMap[key] = { 
              id_evento: key,
              lugar: a.lugar,
              fecha: a.fecha,
              hora: a.hora,
              escuela: a.escuela,
              grado: a.grado,
              turno: a.turno,
              alumnos: [],
              alumnosFiltrados: null
            };
          }
          gruposMap[key].alumnos.push(a);
        });

        return Object.values(gruposMap).sort((a: any, b: any) => 
          a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora)
        );
      }),
      catchError(() => of([]))
    );
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir?',
      mode: 'ios',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: async () => {
            await signOut(this.auth);
            this.navCtrl.navigateRoot('/login');
          }
        }
      ]
    });
    await alert.present();
  }

  trackByEvento(index: number, ev: any) { return ev.id_evento; }
  trackByAlumno(index: number, al: any) { return al.id; }
  getAlumnos(grupo: any) { return grupo.alumnosFiltrados || grupo.alumnos || []; }

  private decrypt(text: string): string {
    if (!text) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(text, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8) || text;
    } catch { return text; }
  }

  buscarInterno(ev: any, grupo: any) {
    const texto = ev.target.value?.toLowerCase().trim();
    if (!texto) {
      grupo.alumnosFiltrados = null;
      return;
    }
    grupo.alumnosFiltrados = grupo.alumnos.filter((a: any) => 
      a.nombreCompleto.toLowerCase().includes(texto)
    );
  }
}