package com.angelshot.dto;

import com.angelshot.entity.EstadoAlerta;
import jakarta.validation.constraints.NotNull;

public class ActualizarEstadoRequest {

    @NotNull(message = "El nuevo estado es obligatorio")
    private EstadoAlerta nuevoEstado;

    private String comentario;

    public ActualizarEstadoRequest() {
    }

    public ActualizarEstadoRequest(EstadoAlerta nuevoEstado, String comentario) {
        this.nuevoEstado = nuevoEstado;
        this.comentario = comentario;
    }

    public EstadoAlerta getNuevoEstado() {
        return nuevoEstado;
    }

    public void setNuevoEstado(EstadoAlerta nuevoEstado) {
        this.nuevoEstado = nuevoEstado;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
}
