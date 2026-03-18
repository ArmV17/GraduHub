import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Firestore, collection, collectionData, doc, updateDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { addIcons } from 'ionicons';
import { businessOutline, checkmarkCircle, ellipseOutline, searchOutline, schoolOutline, archiveOutline } from 'ionicons/icons';

@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.page.html',
  styleUrls: ['./recepcion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecepcionPage implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private readonly secretKey = environment.cryptoKey;
  public grupos$!: Observable<any[]>;

  constructor() {
    addIcons({ businessOutline, checkmarkCircle, ellipseOutline, searchOutline, schoolOutline, archiveOutline });
  }

  ngOnInit() {
    this.grupos$ = authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        const numLogueado = user.email?.split('@')[0].trim() || '';

        const ref = collection(this.firestore, 'medidas');
        return collectionData(ref, { idField: 'id' }).pipe(
          map(alumnos => {
            const filtrados = alumnos.filter((a: any) => String(a['asignadoA'] || '').trim() === numLogueado);

            const descifrados = filtrados.map((a: any) => ({
              ...a,
              nombreCompleto: this.decrypt(a['nombreCompleto']),
              escuela: this.decrypt(a['escuela']),
              recibido: a['recibido'] || false
            }));

            const gruposMap: any = {};
            descifrados.forEach(a => {
              const key = `${a.escuela}-${a.grado}`;
              if (!gruposMap[key]) {
                gruposMap[key] = { id_grupo: key, escuela: a.escuela, alumnos: [], total: 0, recuperados: 0 };
              }
              gruposMap[key].alumnos.push(a);
              gruposMap[key].total++;
              if (a.recibido) gruposMap[key].recuperados++;
            });
            return Object.values(gruposMap);
          })
        );
      }),
      catchError(() => of([]))
    );
  }

  // FUNCIONES FALTANTES QUE CAUSABAN EL ERROR
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
    grupo.alumnosFiltrados = !texto ? null : grupo.alumnos.filter((a: any) => a.nombreCompleto.toLowerCase().includes(texto));
  }
}