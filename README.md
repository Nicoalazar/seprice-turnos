# SePrice — Sistema de Gestión de Consultorios Externos

Sistema de información para la gestión administrativa del Circuito A (Consultorios Externos) de la Clínica SePrice.

Desarrollado como trabajo integrador de la materia **Práctica Profesionalizante II** — IFTS N° 29, Comisión A, Grupo 9.

---

## Descripción

La Clínica SePrice se encuentra en proceso de modernización tecnológica. Este sistema cubre el circuito completo de consultorios externos: desde la toma de turnos hasta la liquidación de honorarios médicos, pasando por la acreditación del paciente y el registro de atenciones.

**Deploy en vivo:** https://seprice.netlify.app/

## Estado final — Casos de uso

| CU | Caso de uso | Ruta | Rol | Estado |
|----|-------------|------|-----|--------|
| CU-00 | Iniciar sesión | `/login` | Todos | ✅ Completo (FA: credenciales inválidas con mensaje genérico, cuenta inactiva) |
| CU-00B | Crear usuario | `/crear-usuario` | Gestor (SUPER) | ✅ Completo (FA: persona no encontrada, cuenta existente, email duplicado) |
| CU-01 | Solicitar turno | `/turnos/registrar` | Administrativo | ✅ Completo (FA: sin disponibilidad, alta de paciente no registrado) |
| CU-02 | Cancelar / modificar turno | `/cancelar-turno` | Administrativo | ✅ Completo (FA: reasignación, turno no encontrado) |
| CU-03 | Verificar disponibilidad | _(interno, incluido por CU-01/02)_ | — | ✅ Completo (FA: sin agenda configurada) |
| CU-04 | Configurar agenda médica | `/configurar-agenda` | Administrativo | ✅ Completo (duración mínima por especialidad, generación de franjas a 60 días) |
| CU-05 | Asignar sobreturno | `/sobreturnos` | Administrativo | ✅ Completo (límite de 1 sobreturno por hora) |
| CU-06 | Acreditar paciente | `/acreditacion` | Administrativo | ✅ Completo (FA: sin turno hoy, sin cobertura → particular) |
| CU-07 | Consultar sala de espera | `/sala-espera` | Médico | ✅ Completo (auto-refresco cada 30 s) |
| CU-07B | Ver agenda médica | `/agenda` | Médico | ✅ Completo |
| CU-08 | Registrar atención médica | `/registrar-atencion` | Médico | ✅ Completo (prescripción/derivación opcionales) |
| CU-09 | Generar liquidación | `/liquidacion` | Administrativo | ✅ Completo (FA: sin prestaciones, liquidación duplicada) |
| CU-10 | Consultar liquidación | `/mi-liquidacion` | Médico | ✅ Completo (FA: sin liquidaciones generadas) |

> `/verificar-autorizacion` es una pantalla de demostración con datos de ejemplo (verificación de autorización de obra social).

## Seguridad y roles

- Todas las rutas privadas están protegidas con `authGuard` (sesión iniciada).
- El sistema define 4 roles de usuario: `SUPER` (gestor/superusuario), `RECEPCIONISTA`, `MEDICO`, y un rol activo interno `ADMIN` (para vistas administrativas).
- Cada ruta valida el rol con `roleGuard`: 
  - Rutas administrativas (`ADMIN`) → accesibles por `SUPER` y `RECEPCIONISTA`
  - Rutas médicas (`MEDICO`) → solo para `MEDICO`
  - Crear usuario → solo `SUPER` (gestor de usuarios)
  - `SUPER` puede alternar entre vista administrativa (`ADMIN`) y médica (`MEDICO`) desde el header

## Stack

- **Frontend:** Angular 17 (componentes standalone, Signals)
- **UI Components:** Angular Material
- **Estilos:** CSS puro con paleta centralizada en `src/styles/colors.css`
- **Backend:** Supabase (PostgreSQL)
- **Alertas:** SweetAlert2 para diálogos de confirmación
- **Arquitectura:** Componentes standalone (sin NgModules); todas las operaciones CRUD se realizan directamente desde el frontend usando el cliente Supabase JS

## Instalación

```bash
npm install
```

Crear un archivo `.env` en la raíz con las siguientes variables:

```
SUPABASE_URL=<url del proyecto Supabase>
SUPABASE_ANON_KEY=<clave pública de Supabase>
```

O definir estas como variables de entorno en tu shell.

Luego iniciar el servidor:

```bash
npm start
```

**Nota importante:** `npm start` ejecuta automáticamente `scripts/generate-env.js`, que genera `src/environments/env.ts` a partir de las variables de entorno. Si `env.ts` ya existe, se conserva el archivo aunque no haya variables definidas. El servidor se levanta en `http://localhost:4200`.

## Usuarios de prueba

| Email | Rol | Notas | Contraseña |
|-------|-----|-------|------------|
| admin@seprice.com | SUPER | Gestor de usuarios; puede alternar entre vista administrativa (`ADMIN`) y médica (`MEDICO`) | password123 |
| raul@seprice.com | RECEPCIONISTA | Acceso a funciones administrativas (vista `ADMIN`) | password123 |
| laura@seprice.com | MEDICO | Especialidad: Pediatría | password123 |
| carlos@seprice.com | MEDICO | Especialidad: Clínica Médica | password123 |

Los datos iniciales se cargan con la semilla de datos en la base de datos Supabase.

## Estructura de sprints

| Sprint | Objetivo | HU cubiertas |
|--------|----------|--------------|
| Sprint 1 | Gestión de turnos | HU-01, HU-02, HU-03 |
| Sprint 2 | Acreditación y atención médica | HU-04, HU-05, HU-06, HU-07, HU-08 |
| Sprint 3 | Liquidación y cierre del circuito | HU-09 + pruebas integrales |

## Diseño en Figma
[Clínica SePrice](https://www.figma.com/design/DxBbzFkg41HcKCtW0iVSpN/sePrice?node-id=0-1&t=QqmfKYE9RxaLLtIe-1)

## Equipo

Albornoz · Blanco · Olivera · Tome · Zalazar

**Docente:** Prof. Silvia Elizabeth Cañizares  
**Institución:** IFTS N° 29 — 2026, 1° cuatrimestre
