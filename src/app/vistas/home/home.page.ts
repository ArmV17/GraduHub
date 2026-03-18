import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { 
  locationOutline, calendarOutline, timeOutline, 
  schoolOutline, personOutline, searchOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'], // Usarás el mismo SCSS
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  private firestore = inject(Firestore);
  private readonly secretKey = environment.cryptoKey;

  public eventos$!: Observable<any[]>;

  constructor() {
    addIcons({ 
      locationOutline, calendarOutline, timeOutline, 
      schoolOutline, personOutline, searchOutline 
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
          lugar: this.decrypt(a['lugar'] || 'S/N'), // Campo de ubicación
          fecha: a['fechaEvento'] || 'Pendiente',   // Campo de fecha
          hora: a['horaEvento'] || '00:00',         // Campo de hora
          grado: a['grado'] || 'S/N',
          turno: a['turno'] || 'Único'
        }));

        const gruposMap: any = {};
        descifrados.forEach(a => {
          // Agrupamos por Lugar + Fecha + Escuela + Grado
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