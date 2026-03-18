import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Firestore, collection, collectionData, doc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { 
  businessOutline, checkmarkCircle, ellipseOutline, 
  searchOutline, timeOutline, schoolOutline,
  chatbubbleEllipsesOutline, archiveOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecepcionPage implements OnInit {
  private firestore = inject(Firestore);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private readonly secretKey = environment.cryptoKey;

  public grupos$!: Observable<any[]>;

  constructor() {
    addIcons({ 
      businessOutline, checkmarkCircle, ellipseOutline, 
      searchOutline, timeOutline, schoolOutline,
      chatbubbleEllipsesOutline, archiveOutline 
    });
  }

  ngOnInit() {
    const ref = collection(this.firestore, 'medidas');
    this.grupos$ = collectionData(ref, { idField: 'id' }).pipe(
      map(alumnos => {
        const descifrados = alumnos.map((a: any) => ({
          ...a,
          nombreCompleto: this.decrypt(a['nombreCompleto']),
          escuela: this.decrypt(a['escuela']),
          profesor: this.decrypt(a['profesor'] || 'Sin asignar'),
          notas: this.decrypt(a['notas'] || ''),
          turno: a['turno'] || 'Único',
          grado: a['grado'] || 'S/N',
          recibido: a['recibido'] || false // Campo para la recepción
        }));

        const gruposMap: any = {};
        descifrados.forEach(a => {
          const key = `${a.escuela}-${a.turno}-${a.grado}`;
          if (!gruposMap[key]) {
            gruposMap[key] = { 
              id_grupo: key, 
              escuela: a.escuela,
              turno: a.turno,
              grado: a.grado,
              profesor: a.profesor,
              alumnos: [],
              alumnosFiltrados: null,
              total: 0,
              recuperados: 0
            };
          }
          gruposMap[key].alumnos.push(a);
          gruposMap[key].total++;
          if (a.recibido) gruposMap[key].recuperados++;
        });

        return Object.values(gruposMap).sort((a: any, b: any) => 
          a.escuela.localeCompare(b.escuela) || a.grado.localeCompare(b.grado)
        );
      }),
      catchError(() => of([]))
    );
  }

  trackByGrupo(index: number, grupo: any) { return grupo.id_grupo; }
  trackByAlumno(index: number, alumno: any) { return alumno.id; }
  getAlumnos(grupo: any) { return grupo.alumnosFiltrados || grupo.alumnos || []; }

  private decrypt(text: string): string {
    if (!text) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(text, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8) || text;
    } catch { return text; }
  }

  async toggleRecepcion(alumno: any) {
    const docRef = doc(this.firestore, `medidas/${alumno.id}`);
    await updateDoc(docRef, { recibido: !alumno.recibido });
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