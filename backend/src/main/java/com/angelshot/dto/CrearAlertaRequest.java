package com.angelshot.dto;

import com.angelshot.entity.NivelUrgencia;
import com.angelshot.entity.TipoAlerta;
import jakarta.validation.constraints.NotNull;

public class CrearAlertaRequest {

    private Long establecimientoId;

    @NotNull(message = "El tipo de alerta es obligatorio")
    private TipoAlerta tipoAlerta;

    private NivelUrgencia nivelUrgencia;

    private Double latitud;
    private Double longitud;

    private String municipio; // Chía, Zipaquirá, Cajicá
    private String departamento;
    private String ubicacionDetalle; // Punto de referencia específico
    private String descripcion;
    private String codigoSeguridad;
    private Boolean anonimo;

    public CrearAlertaRequest() {
    }

    public Long getEstablecimientoId() {
        return establecimientoId;
    }

    public void setEstablecimientoId(Long establecimientoId) {
        this.establecimientoId = establecimientoId;
    }

    public TipoAlerta getTipoAlerta() {
        return tipoAlerta;
    }

    public void setTipoAlerta(TipoAlerta tipoAlerta) {
        this.tipoAlerta = tipoAlerta;
    }

    public NivelUrgencia getNivelUrgencia() {
        return nivelUrgencia;
    }

    public void setNivelUrgencia(NivelUrgencia nivelUrgencia) {
        this.nivelUrgencia = nivelUrgencia;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getUbicacionDetalle() {
        return ubicacionDetalle;
    }

    public void setUbicacionDetalle(String ubicacionDetalle) {
        this.ubicacionDetalle = ubicacionDetalle;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCodigoSeguridad() {
        return codigoSeguridad;
    }

    public void setCodigoSeguridad(String codigoSeguridad) {
        this.codigoSeguridad = codigoSeguridad;
    }

    public Boolean getAnonimo() {
        return anonimo;
    }

    public void setAnonimo(Boolean anonimo) {
        this.anonimo = anonimo;
    }
}
