-- ============================================================================
-- SEED DATA para SePrice Turnos
-- Datos mínimos para pruebas completas del sistema
-- ============================================================================

-- TRUNCATE para limpiar (descomentar si necesitas empezar de cero)
-- TRUNCATE TABLE "Turno" CASCADE;
-- TRUNCATE TABLE "Franja" CASCADE;
-- TRUNCATE TABLE "Agenda" CASCADE;
-- TRUNCATE TABLE "Atencion" CASCADE;
-- TRUNCATE TABLE "Liquidacion" CASCADE;
-- TRUNCATE TABLE "Medico" CASCADE;
-- TRUNCATE TABLE "Administrativo" CASCADE;
-- TRUNCATE TABLE "Paciente" CASCADE;
-- TRUNCATE TABLE "Usuario" CASCADE;

-- ============================================================================
-- 1. USUARIOS (para login y relaciones)
-- ============================================================================

INSERT INTO "Usuario" (id, email, password, rol, activo, "creadoEn") VALUES
  ('user-001', 'carlos@seprice.com', 'password123', 'MEDICO', true, NOW()),
  ('user-002', 'laura@seprice.com', 'password123', 'MEDICO', true, NOW()),
  ('user-003', 'ricardo@seprice.com', 'password123', 'MEDICO', true, NOW()),
  ('user-004', 'sofia@seprice.com', 'password123', 'MEDICO', true, NOW()),
  ('user-admin', 'admin@seprice.com', 'password123', 'SUPER', true, NOW()),
  ('user-admin2', 'recepcion@seprice.com', 'password123', 'SUPER', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 2. MÉDICOS
-- ============================================================================

INSERT INTO "Medico" (id, matricula, nombre, apellido, especialidad, tarifa, "usuarioId") VALUES
  ('medico-001', 'MAT-001-2024', 'Carlos', 'Méndez', 'Clínica Médica', 150.00, 'user-001'),
  ('medico-002', 'MAT-002-2024', 'Laura', 'Torres', 'Pediatría', 120.00, 'user-002'),
  ('medico-003', 'MAT-003-2024', 'Ricardo', 'Ramírez', 'Cardiología', 200.00, 'user-003'),
  ('medico-004', 'MAT-004-2024', 'Sofía', 'Sánchez', 'Dermatología', 180.00, 'user-004')
ON CONFLICT (matricula) DO NOTHING;

-- ============================================================================
-- 3. ADMINISTRATIVOS
-- ============================================================================

INSERT INTO "Administrativo" (id, nombre, apellido, "usuarioId") VALUES
  ('admin-001', 'Mateo', 'Albornoz', 'user-admin'),
  ('admin-002', 'Recepción', 'SePrice', 'user-admin2')
ON CONFLICT ("usuarioId") DO NOTHING;

-- ============================================================================
-- 4. PACIENTES
-- ============================================================================

INSERT INTO "Paciente" (id, dni, nombre, apellido, "fechaNac", telefono, "obraSocial", "creadoEn") VALUES
  ('paciente-001', '28456789', 'Luis', 'García', '1985-03-12', '11-2222-3333', 'Swiss Medical', NOW()),
  ('paciente-002', '31111222', 'Ana', 'Romero', '1992-11-05', '11-4444-5555', 'OSDE 310', NOW()),
  ('paciente-003', '25333444', 'Marta', 'López', '1979-08-22', '11-6666-7777', 'Medifé', NOW()),
  ('paciente-004', '35555666', 'Elena', 'Soria', '1995-01-14', '11-8888-9999', 'Galeno', NOW()),
  ('paciente-005', '29777888', 'Tomás', 'Castro', '1988-06-30', '11-0000-1111', NULL, NOW()),
  ('paciente-006', '32888999', 'Juan', 'Pérez', '1980-09-15', '11-1111-2222', 'IOMA', NOW()),
  ('paciente-007', '26999000', 'María', 'González', '1975-04-20', '11-3333-4444', 'Swiss Medical', NOW())
ON CONFLICT (dni) DO NOTHING;

-- ============================================================================
-- 5. AGENDAS (horarios por día de semana)
-- Lunes (1) a Viernes (5): 08:00 a 17:00
-- Duración de turnos: 15 minutos
-- ============================================================================

INSERT INTO "Agenda" (id, "medicoId", "diaSemana", "horaInicio", "horaFin", "duracionMin", "creadoEn") VALUES
  -- Carlos Méndez (Clínica Médica)
  ('agenda-001', 'medico-001', 1, '08:00', '17:00', 15, NOW()),
  ('agenda-002', 'medico-001', 2, '08:00', '17:00', 15, NOW()),
  ('agenda-003', 'medico-001', 3, '08:00', '17:00', 15, NOW()),
  ('agenda-004', 'medico-001', 4, '08:00', '17:00', 15, NOW()),
  ('agenda-005', 'medico-001', 5, '08:00', '17:00', 15, NOW()),

  -- Laura Torres (Pediatría)
  ('agenda-006', 'medico-002', 1, '08:00', '16:00', 15, NOW()),
  ('agenda-007', 'medico-002', 2, '08:00', '16:00', 15, NOW()),
  ('agenda-008', 'medico-002', 3, '08:00', '16:00', 15, NOW()),
  ('agenda-009', 'medico-002', 4, '08:00', '16:00', 15, NOW()),
  ('agenda-010', 'medico-002', 5, '08:00', '16:00', 15, NOW()),

  -- Ricardo Ramírez (Cardiología)
  ('agenda-011', 'medico-003', 1, '09:00', '17:00', 25, NOW()),
  ('agenda-012', 'medico-003', 2, '09:00', '17:00', 25, NOW()),
  ('agenda-013', 'medico-003', 3, '09:00', '17:00', 25, NOW()),
  ('agenda-014', 'medico-003', 4, '09:00', '17:00', 25, NOW()),
  ('agenda-015', 'medico-003', 5, '09:00', '17:00', 25, NOW()),

  -- Sofía Sánchez (Dermatología)
  ('agenda-016', 'medico-004', 1, '10:00', '18:00', 20, NOW()),
  ('agenda-017', 'medico-004', 2, '10:00', '18:00', 20, NOW()),
  ('agenda-018', 'medico-004', 3, '10:00', '18:00', 20, NOW()),
  ('agenda-019', 'medico-004', 4, '10:00', '18:00', 20, NOW()),
  ('agenda-020', 'medico-004', 5, '10:00', '18:00', 20, NOW());

-- ============================================================================
-- 6. FRANJAS (slots de tiempo para hoy y próximos días)
-- Generar franjas para las próximas 2 semanas
-- ============================================================================

-- Franjas para hoy (para pruebas inmediatas)
INSERT INTO "Franja" (id, "agendaId", fecha, hora, disponible, sobreturno) VALUES
  -- Carlos Méndez - Hoy (Lunes)
  ('franja-001', 'agenda-001', CURRENT_DATE, '08:00', true, false),
  ('franja-002', 'agenda-001', CURRENT_DATE, '08:15', true, false),
  ('franja-003', 'agenda-001', CURRENT_DATE, '08:30', true, false),
  ('franja-004', 'agenda-001', CURRENT_DATE, '08:45', true, false),
  ('franja-005', 'agenda-001', CURRENT_DATE, '09:00', true, false),
  ('franja-006', 'agenda-001', CURRENT_DATE, '09:15', true, false),
  ('franja-007', 'agenda-001', CURRENT_DATE, '09:30', true, false),
  ('franja-008', 'agenda-001', CURRENT_DATE, '09:45', true, false),
  ('franja-009', 'agenda-001', CURRENT_DATE, '10:00', true, false),
  ('franja-010', 'agenda-001', CURRENT_DATE, '10:15', true, false),

  -- Laura Torres - Hoy
  ('franja-011', 'agenda-006', CURRENT_DATE, '08:00', true, false),
  ('franja-012', 'agenda-006', CURRENT_DATE, '08:15', true, false),
  ('franja-013', 'agenda-006', CURRENT_DATE, '08:30', true, false),
  ('franja-014', 'agenda-006', CURRENT_DATE, '08:45', true, false),
  ('franja-015', 'agenda-006', CURRENT_DATE, '09:00', true, false),
  ('franja-016', 'agenda-006', CURRENT_DATE, '09:15', true, false),

  -- Ricardo Ramírez - Hoy (25 min)
  ('franja-017', 'agenda-011', CURRENT_DATE, '09:00', true, false),
  ('franja-018', 'agenda-011', CURRENT_DATE, '09:25', true, false),
  ('franja-019', 'agenda-011', CURRENT_DATE, '09:50', true, false),

  -- Sofía Sánchez - Hoy (20 min)
  ('franja-020', 'agenda-016', CURRENT_DATE, '10:00', true, false),
  ('franja-021', 'agenda-016', CURRENT_DATE, '10:20', true, false),
  ('franja-022', 'agenda-016', CURRENT_DATE, '10:40', true, false);

-- Franjas para mañana (más pruebas)
INSERT INTO "Franja" (id, "agendaId", fecha, hora, disponible, sobreturno)
SELECT
  'franja-' || ROW_NUMBER() OVER (ORDER BY a.id, h) || '-' || EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '1 day'),
  a.id,
  CURRENT_DATE + INTERVAL '1 day',
  CONCAT(LPAD(h::text, 2, '0'), ':00'),
  true,
  false
FROM
  "Agenda" a,
  (SELECT GENERATE_SERIES(8, 16) as h) hours
WHERE
  a."medicoId" IN ('medico-001', 'medico-002');

-- ============================================================================
-- 7. TURNOS (algunos ya confirmados para pruebas)
-- ============================================================================

INSERT INTO "Turno" (id, "pacienteId", "medicoId", "franjaId", estado, tipo, "modalidadPago", "creadoEn", "actualizadoEn") VALUES
  ('turno-001', 'paciente-001', 'medico-001', 'franja-005', 'CONFIRMADO', 'NORMAL', 'OBRA_SOCIAL', NOW(), NOW()),
  ('turno-002', 'paciente-002', 'medico-002', 'franja-011', 'CONFIRMADO', 'NORMAL', 'OBRA_SOCIAL', NOW(), NOW()),
  ('turno-003', 'paciente-003', 'medico-003', 'franja-017', 'CONFIRMADO', 'NORMAL', 'OBRA_SOCIAL', NOW(), NOW()),
  ('turno-004', 'paciente-004', 'medico-001', 'franja-007', 'CONFIRMADO', 'NORMAL', 'OBRA_SOCIAL', NOW(), NOW()),
  ('turno-005', 'paciente-005', 'medico-004', 'franja-020', 'CONFIRMADO', 'SOBRETURNO', 'PARTICULAR', NOW(), NOW());

-- Marcar franjas como ocupadas
UPDATE "Franja" SET disponible = false WHERE id IN ('franja-005', 'franja-011', 'franja-017', 'franja-007', 'franja-020');

-- ============================================================================
-- 8. VERIFICACIÓN - Mostrar datos insertados
-- ============================================================================

SELECT 'USUARIOS' as "Tabla", COUNT(*) as "Registros" FROM "Usuario"
UNION ALL
SELECT 'MÉDICOS', COUNT(*) FROM "Medico"
UNION ALL
SELECT 'PACIENTES', COUNT(*) FROM "Paciente"
UNION ALL
SELECT 'AGENDAS', COUNT(*) FROM "Agenda"
UNION ALL
SELECT 'FRANJAS', COUNT(*) FROM "Franja"
UNION ALL
SELECT 'TURNOS', COUNT(*) FROM "Turno";

-- ============================================================================
-- CREDENCIALES PARA LOGIN (copia esto en un documento seguro)
-- ============================================================================
-- Admin:
--   Email: admin@seprice.com
--   Contraseña: password123
--   Rol: SUPER
--
-- Médico (Clínica Médica):
--   Email: carlos@seprice.com
--   Contraseña: password123
--   Rol: MEDICO
--
-- Médico (Pediatría):
--   Email: laura@seprice.com
--   Contraseña: password123
--   Rol: MEDICO
--
-- Médico (Cardiología):
--   Email: ricardo@seprice.com
--   Contraseña: password123
--   Rol: MEDICO
--
-- Médico (Dermatología):
--   Email: sofia@seprice.com
--   Contraseña: password123
--   Rol: MEDICO
-- ============================================================================
