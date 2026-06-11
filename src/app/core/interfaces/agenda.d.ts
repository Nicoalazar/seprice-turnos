export interface Agenda {
  id: string;
  medicoId: string;
  diaSemana: number; // 0=domingo ... 6=sábado
  horaInicio: string; // "08:00"
  horaFin: string; // "17:00"
  duracionMin: number; // minutos por turno (15, 25, 30)
  creadoEn: string;
}
