package com.angelshot.app.data.model

data class AuthRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val token: String,
    val tipo: String,
    val id: Long,
    val nombre: String,
    val email: String,
    val roles: List<String>
)

data class RegistroRequest(
    val nombre: String,
    val email: String,
    val password: String,
    val telefono: String?,
    val contactoEmergenciaNombre: String?,
    val contactoEmergenciaTelefono: String?,
    val pinCancelacion: String?
)

enum class TipoAlerta {
    ANGEL_SHOT_SOLO,        // Acompañamiento discreto al vehículo
    ANGEL_SHOT_CON_HIELO,   // Solicitar taxi/Uber seguro
    ANGEL_SHOT_CON_LIMA,    // Peligro inminente / Policía
    ACOSO_O_INTIMIDACION,
    EMERGENCIA_MEDICA
}

enum class EstadoAlerta {
    EMITIDA,
    EN_ATENCION,
    ASISTENCIA_EN_CURSO,
    RESUELTA,
    CANCELADA
}

enum class NivelUrgencia {
    BAJA,
    MEDIA,
    ALTA,
    CRITICA
}

data class CrearAlertaRequest(
    val tipoAlerta: TipoAlerta,
    val nivelUrgencia: NivelUrgencia? = null,
    val latitud: Double? = null,
    val longitud: Double? = null,
    val ubicacionDetalle: String? = null,
    val descripcion: String? = null,
    val codigoSeguridad: String? = null,
    val establecimientoId: Long? = null
)

data class AlertaDTO(
    val id: Long,
    val usuarioId: Long?,
    val usuarioNombre: String?,
    val usuarioTelefono: String?,
    val establecimientoId: Long?,
    val establecimientoNombre: String?,
    val tipoAlerta: TipoAlerta,
    val nivelUrgencia: NivelUrgencia,
    val estado: EstadoAlerta,
    val latitud: Double?,
    val longitud: Double?,
    val ubicacionDetalle: String?,
    val descripcion: String?,
    val codigoSeguridad: String?,
    val createdAt: String?,
    val updatedAt: String?
)

data class ActualizarEstadoRequest(
    val nuevoEstado: EstadoAlerta,
    val comentario: String? = null
)

data class EstablecimientoDTO(
    val id: Long,
    val nombre: String,
    val direccion: String,
    val tipo: String,
    val latitud: Double,
    val longitud: Double,
    val telefonoContacto: String?,
    val activo: Boolean?
)
