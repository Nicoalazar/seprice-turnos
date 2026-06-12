export type EstadoTurno = 'CONFIRMADO' | 'PRESENTE EN SALA' | 'ATENDIDO' | 'CANCELADO' | 'AUSENTE';
export type TipoTurno = 'NORMAL' | 'SOBRETURNO' | 'SEGUIMIENTO';
export type ModalidadPago = 'OBRA_SOCIAL' | 'PARTICULAR';

export interface Turno {
  id: string;
  pacienteId: string;
  medicoId: string;
  franjaId: string;
  estado: EstadoTurno;
  tipo: TipoTurno;
  modalidadPago?: ModalidadPago;
  autorizacion?: string;
  creadoEn: string;
  actualizadoEn: string;

  paciente?: any;
  medico?: any;
  franja?: any;
}

export interface TurnoConDetalles extends Turno {
  paciente: {
    nombre: string;
    apellido: string;
    dni: string;
    telefono: string;
    obraSocial: string | null;
  };
  medico: {
    nombre: string;
    apellido: string;
    especialidad: string;
  };
  franja: {
    fecha: string;
    hora: string;
  };
}
