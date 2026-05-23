import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TurnosService {

    // DATOS MOCK: Simulamos que en la base de datos ya hay un sobreturno agendado a las 09:30
    private sobreturnosMock: any[] = [
        {
            id: 1,
            fecha: '2026-05-05',
            hora: '09:30',
            pacienteId: '42333444',
            medicoId: 'Dr. Méndez, Carlos',
            consultorio: 'Consultorio 1',
            estado: 'pendiente',
            tipo: 'sobreturno',
            motivo: 'Control post-operatorio urgente.'
        }
    ];

    constructor() { }

    // Método Mock para obtener los sobreturnos de un médico en una fecha/hora
    getSoburnosDelDia(medicoId: string, fecha: string, hora: string): Observable<any[]> {
        const filtrados = this.sobreturnosMock.filter(t =>
            t.medicoId === medicoId &&
            t.fecha === fecha &&
            t.hora === hora &&
            t.tipo === 'sobreturno'
        );
        return of(filtrados);
    }

    // Método Mock para guardar un nuevo sobreturno
    guardarSobreturno(nuevoTurno: any): Observable<any> {
        const turnoConId = { ...nuevoTurno, id: this.sobreturnosMock.length + 1 };
        this.sobreturnosMock.push(turnoConId);
        console.log('--- ESTADO DE LA BASE DE DATOS MOCK ---', this.sobreturnosMock);
        return of({ success: true, data: turnoConId });
    }
}