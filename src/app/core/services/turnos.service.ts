import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TurnosService {

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

    getSoburnosDelDia(medicoId: string, fecha: string, hora: string): Observable<any[]> {
        const filtrados = this.sobreturnosMock.filter(t =>
            t.medicoId === medicoId &&
            t.fecha === fecha &&
            t.hora === hora &&
            t.tipo === 'sobreturno'
        );
        return of(filtrados);
    }

    guardarSobreturno(nuevoTurno: any): Observable<any> {
        const turnoConId = { ...nuevoTurno, id: this.sobreturnosMock.length + 1 };
        this.sobreturnosMock.push(turnoConId);
        console.log('--- ESTADO DE LA BASE DE DATOS MOCK ---', this.sobreturnosMock);
        return of({ success: true, data: turnoConId });
    }

    // Agenda para el componente visual modificada exactamente como el Figma
    obtenerAgendaDelDia(medicoId: string, fecha: string): Observable<any[]> {
        const agenda = [
            { hora: '09:00', paciente: 'García, Luis', motivo: 'Control', obraSocial: 'OSDE 310', tipo: 'Normal', estado: 'Atendido' },
            { hora: '09:15', paciente: 'Romero, Ana', motivo: 'Consulta', obraSocial: 'Swiss Medical', tipo: 'Normal', estado: 'Atendido' },
            { hora: '09:30', paciente: 'López, Marta', motivo: 'Seguimiento', obraSocial: 'Medifé', tipo: 'Seguimiento', estado: 'En espera' }, // <-- Actualizado
            { hora: '09:45', paciente: 'Soria, Elena', motivo: 'Primera vez', obraSocial: 'Galeno', tipo: 'Normal', estado: 'En espera' },
            { hora: '10:00', paciente: 'Castro, Tomás', motivo: 'Control', obraSocial: 'Particular', tipo: 'Normal', estado: 'Acreditado' },
            { hora: '10:15', paciente: 'Flores, Diana', motivo: 'Derivación', obraSocial: 'OSDE 410', tipo: 'Sobreturno', estado: 'Acreditado' },
            { hora: '10:30', paciente: 'Vera, Miguel', motivo: 'Consulta', obraSocial: 'Swiss Medical', tipo: 'Normal', estado: 'Confirmado' }, // <-- Actualizado
            { hora: '10:45', paciente: 'Ríos, Patricia', motivo: 'Control', obraSocial: 'Medifé', tipo: 'Normal', estado: 'Confirmado' },
            { hora: '10:45', paciente: 'Ríos, Patricia', motivo: 'Control', obraSocial: 'Medifé', tipo: 'Normal', estado: 'Confirmado' },
            { hora: '11:00', paciente: '', motivo: '', obraSocial: '', tipo: 'Normal', estado: 'Libre' }, 
            { hora: '11:15', paciente: '', motivo: '', obraSocial: '', tipo: 'Normal', estado: 'Libre' }  
        ];

        return of(agenda);
    }
}