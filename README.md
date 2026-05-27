# SePrice — Sistema de Gestión de Consultorios Externos

Sistema de información para la gestión administrativa del Circuito A (Consultorios Externos) de la Clínica SePrice.

Desarrollado como trabajo integrador de la materia **Práctica Profesionalizante II** — IFTS N° 29, Comisión A, Grupo 9.

---

## Descripción

La Clínica SePrice se encuentra en proceso de modernización tecnológica. Este sistema cubre el circuito completo de consultorios externos: desde la toma de turnos hasta la liquidación de honorarios médicos, pasando por la acreditación del paciente y el registro de atenciones.

## Funcionalidades

- Registro, cancelación y reasignación de turnos
- Gestión de sobreturnos
- Acreditación de pacientes y verificación de obra social
- Vista de agenda para médicos
- Registro de atención y solicitud de turnos de seguimiento
- Liquidación de honorarios

## Stack

- **Frontend:** Angular 17
- **Estilos:** CSS
- **Backend:** Supabase (PostgreSQL) + Supabase Auth
- **Backend Node.js:** _(próximas iteraciones)_

## Estructura de sprints

| Sprint | Objetivo | HU cubiertas |
|--------|----------|--------------|
| Sprint 1 | Gestión de turnos | HU-01, HU-02, HU-03 |
| Sprint 2 | Acreditación y atención médica | HU-04, HU-05, HU-06, HU-07, HU-08 |
| Sprint 3 | Liquidación y cierre del circuito | HU-09 + pruebas integrales |

## Diseño en Figma
[Clínica SePrice](https://www.figma.com/design/DxBbzFkg41HcKCtW0iVSpN/sePrice?node-id=0-1&t=QqmfKYE9RxaLLtIe-1)

## Instalación

```bash
npm install
ng serve
```

Navegar a `http://localhost:4200`.

## Equipo

Albornoz · Blanco · Olivera · Tome · Zalazar

**Docente:** Prof. Silvia Elizabeth Cañizares  
**Institución:** IFTS N° 29 — 2026, 1° cuatrimestre