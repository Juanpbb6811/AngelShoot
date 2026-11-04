-- =======================================================================
-- Esquema de Base de Datos - Angel Shot
-- PostgreSQL / Supabase
-- =======================================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    contacto_emergencia_nombre VARCHAR(100),
    contacto_emergencia_telefono VARCHAR(30),
    pin_cancelacion VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id)
);

CREATE TABLE IF NOT EXISTS establecimientos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- BAR, DISCOTECA, RESTAURANTE, EVENTO, ZONA_PUBLICA
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    telefono_contacto VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alertas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    establecimiento_id BIGINT REFERENCES establecimientos(id) ON DELETE SET NULL,
    tipo_alerta VARCHAR(50) NOT NULL, -- ANGEL_SHOT_SOLO, ANGEL_SHOT_CON_HIELO, ANGEL_SHOT_CON_LIMA, ACOSO, OTRO
    nivel_urgencia VARCHAR(20) NOT NULL, -- BAJA, MEDIA, ALTA, CRITICA
    estado VARCHAR(30) NOT NULL, -- EMITIDA, EN_ATENCION, ASISTENCIA_EN_CURSO, RESUELTA, CANCELADA
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    ubicacion_detalle VARCHAR(255),
    descripcion TEXT,
    codigo_seguridad VARCHAR(10),
    evidencia_foto BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asignaciones (
    id BIGSERIAL PRIMARY KEY,
    alerta_id BIGINT REFERENCES alertas(id) ON DELETE CASCADE,
    operador_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_atencion VARCHAR(50) DEFAULT 'ASIGNADO',
    notas TEXT
);

CREATE TABLE IF NOT EXISTS seguimientos (
    id BIGSERIAL PRIMARY KEY,
    alerta_id BIGINT REFERENCES alertas(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comentarios (
    id BIGSERIAL PRIMARY KEY,
    alerta_id BIGINT REFERENCES alertas(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    mensaje TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
