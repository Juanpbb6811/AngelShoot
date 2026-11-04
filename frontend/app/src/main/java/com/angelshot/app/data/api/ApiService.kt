package com.angelshot.app.data.api

import com.angelshot.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @POST("api/auth/login")
    suspend fun login(@Body request: AuthRequest): Response<AuthResponse>

    @POST("api/auth/registro")
    suspend fun registrar(@Body request: RegistroRequest): Response<AuthResponse>

    @POST("api/alertas")
    suspend fun emitirAlerta(@Body request: CrearAlertaRequest): Response<AlertaDTO>

    @GET("api/alertas/mis-alertas")
    suspend fun listarMisAlertas(): Response<List<AlertaDTO>>

    @GET("api/alertas")
    suspend fun listarTodas(@Query("estado") estado: EstadoAlerta? = null): Response<List<AlertaDTO>>

    @GET("api/alertas/{id}")
    suspend fun obtenerAlerta(@Path("id") id: Long): Response<AlertaDTO>

    @PATCH("api/alertas/{id}/estado")
    suspend fun actualizarEstado(
        @Path("id") id: Long,
        @Body request: ActualizarEstadoRequest
    ): Response<AlertaDTO>

    @GET("api/establecimientos")
    suspend fun listarEstablecimientos(): Response<List<EstablecimientoDTO>>
}
