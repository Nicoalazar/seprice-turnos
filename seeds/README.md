# Seed Data - SePrice Turnos

Este directorio contiene el script SQL para cargar datos de prueba mínimos en Supabase.

## Contenido

- **seed-data.sql**: Script SQL con datos de prueba para todas las tablas

## ¿Qué incluye?

### Usuarios (6 registros)
- **1 Admin** (SUPER): `admin@seprice.com`
- **4 Médicos** (MEDICO):
  - Carlos Méndez - Clínica Médica
  - Laura Torres - Pediatría
  - Ricardo Ramírez - Cardiología
  - Sofía Sánchez - Dermatología
- **1 Personal Administrativo**: `recepcion@seprice.com`

### Datos Médicos
- **4 Médicos** vinculados a Usuarios con especialidades y aranceles
- **4 Administrativos** (si aplica)

### Pacientes (7 registros)
Pacientes de prueba con DNI, teléfono, obra social (algunos sin cobertura)

### Agendas
- Horarios para cada médico (L-V)
- Diferentes duraciones de turno:
  - Clínica Médica: 15 min
  - Pediatría: 15 min
  - Cardiología: 25 min
  - Dermatología: 20 min

### Franjas (Slots disponibles)
- Franjas para HOY (con algunos turnos confirmados)
- Franjas para mañana (totalmente disponibles)
- Total: ~50 franjas disponibles para pruebas

### Turnos (5 confirmados)
Turnos ya registrados para probar vistas de agenda y acreditación

## Cómo Cargar los Datos

### Opción 1: SQL Editor de Supabase (Recomendado)

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Click en **+ New Query**
4. Copia todo el contenido de `seed-data.sql`
5. Pega en el editor
6. Click en **Run** (Ctrl+Enter)
7. Verifica que todos los datos se insertaron correctamente

### Opción 2: CLI de Supabase

```bash
supabase db push
supabase seed
```

(Si configuras el seed en `supabase/seed.sql`)

### Opción 3: psql (si tienes PostgreSQL instalado)

```bash
psql "postgresql://[user]:[password]@[host]/[database]" < seeds/seed-data.sql
```

## Credenciales de Prueba

Todas usan la contraseña: **`password123`**

| Email | Rol | Especialidad |
|-------|-----|--------------|
| admin@seprice.com | SUPER | N/A |
| recepcion@seprice.com | SUPER | N/A |
| carlos@seprice.com | MEDICO | Clínica Médica |
| laura@seprice.com | MEDICO | Pediatría |
| ricardo@seprice.com | MEDICO | Cardiología |
| sofia@seprice.com | MEDICO | Dermatología |

## Flujos de Prueba

### 1. Login
- Email: `carlos@seprice.com`
- Contraseña: `password123`
- Espera: Dashboard del médico con turnos de hoy

### 2. Registrar Turno (como Admin)
- Login con `admin@seprice.com`
- Ir a **Registrar turno**
- Seleccionar especialidad → médico → fecha → franja disponible
- Confirmar

### 3. Acreditar Paciente
- Login con `admin@seprice.com`
- Ir a **Acreditar paciente**
- Buscar por DNI: `28456789` (Luis García)
- Debería mostrar su turno de hoy
- Confirmar acreditación

### 4. Cancelar Turno
- Ir a **Cancelar turno**
- Buscar por DNI: `28456789`
- Cancelar el turno

### 5. Ver Agenda
- Login con `carlos@seprice.com`
- Ir a **Agenda**
- Ver turnos del día (deberían verse los registrados hoy)

### 6. Registrar Sobreturno
- Login con `admin@seprice.com`
- Ir a **Sobreturno**
- Seleccionar médico, fecha (hoy), franja para sobreturno
- Confirmar

## Reiniciar Datos

Si necesitas volver a empezar, descomenta las líneas de TRUNCATE al principio del script:

```sql
TRUNCATE TABLE "Turno" CASCADE;
TRUNCATE TABLE "Franja" CASCADE;
-- ... (resto de TRUNCATE statements)
```

Luego ejecuta nuevamente el script.

## Notas

- Todas las contraseñas son **`password123`** por simplicidad en pruebas
- En producción, usar contraseñas seguras y hash con bcrypt
- Los DNI de prueba son ficticios pero válidos en formato
- Las franjas se generan automáticamente para hoy y mañana
- Los turnos confirmados ocupan las franjas (disponible = false)

## Próximos Pasos

Después de cargar los datos:

1. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```

2. Abre http://localhost:4200

3. Prueba los diferentes flujos con las credenciales

4. Verifica que:
   - Login funciona
   - Datos se cargan desde Supabase
   - Puedes registrar turnos nuevos
   - Los turnos aparecen en la agenda

¡Listo para probar! 🚀
