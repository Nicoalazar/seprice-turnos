import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RolUsuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private rolActivoSubject = new BehaviorSubject<RolUsuario>('RECEPCIONISTA');
  rolActivo$: Observable<RolUsuario> = this.rolActivoSubject.asObservable();

  setRolActivo(rol: RolUsuario): void {
    this.rolActivoSubject.next(rol);
  }

  getRolActivo(): RolUsuario {
    return this.rolActivoSubject.value;
  }
}
