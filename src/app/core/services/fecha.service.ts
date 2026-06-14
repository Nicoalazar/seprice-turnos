import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FechaService {

  // Obtiene la fecha actual en formato YYYY-MM-DD en zona horaria local (sin conversión UTC)
  obtenerHoy(): string {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const día = String(ahora.getDate()).padStart(2, '0');
    return `${año}-${mes}-${día}`;
  }

  // Obtiene un date input válido (min attribute en input type="date")
  obtenerFechaMinima(): string {
    return this.obtenerHoy();
  }
}
