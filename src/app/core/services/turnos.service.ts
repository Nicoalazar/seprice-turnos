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


    // Agenda para el componente visual
    obtenerAgendaDelDia(medicoId: string, fecha: string): Observable<any[]> {
        // lista basada en el figma que hizo Nico
        const agenda = [
            { hora: '09:00', paciente: 'García, Luis', motivo: 'Control', obraSocial: 'OSDE 310', tipo: 'Normal', estado: 'Atendido' },
            { hora: '09:15', paciente: 'Romero, Ana', motivo: 'Consulta', obraSocial: 'Swiss Medical', tipo: 'Normal', estado: 'Atendido' },
            { hora: '09:30', paciente: '', motivo: '', obraSocial: '', tipo: 'Normal', estado: 'Libre' },
            { hora: '09:45', paciente: 'Soria, Elena', motivo: 'Primera vez', obraSocial: 'Galeno', tipo: 'Normal', estado: 'En espera' },
            { hora: '10:00', paciente: 'Castro, Tomás', motivo: 'Control', obraSocial: 'Particular', tipo: 'Normal', estado: 'Acreditado' },
            { hora: '10:15', paciente: 'Flores, Diana', motivo: 'Derivación', obraSocial: 'OSDE 410', tipo: 'Sobreturno', estado: 'Acreditado' },
            { hora: '10:30', paciente: '', motivo: '', obraSocial: '', tipo: 'Normal', estado: 'Libre' },
            { hora: '10:45', paciente: 'Ríos, Patricia', motivo: 'Control', obraSocial: 'Medifé', tipo: 'Normal', estado: 'Confirmado' }
        ];

        return of(agenda);
    }
}