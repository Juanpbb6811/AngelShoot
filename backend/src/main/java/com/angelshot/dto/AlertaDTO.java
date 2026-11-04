package com.angelshot.dto;

import com.angelshot.entity.Alerta;
import com.angelshot.entity.EstadoAlerta;
import com.angelshot.entity.NivelUrgencia;
import com.angelshot.entity.TipoAlerta;

import java.time.LocalDateTime;

public class AlertaDTO {

    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioTelefono;
    private Long establecimientoId;
    private String establecimientoNombre;
    private TipoAlerta tipoAlerta;
    private NivelUrgencia nivelUrgencia;
    private EstadoAlerta estado;
    private Double latitud;
    private Double longitud;
    private String municipio;
    private String departamento;
    private String ubicacionDetalle;
    private String descripcion;
    private String codigoSeguridad;
    private Boolean activo;
    private Integer votosPositivos;
    private Integer votosTotales;
    private Integer porcentajeCoincidencia;
    private Boolean anonimo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AlertaDTO() {
    }

    public AlertaDTO(Alerta alerta) {
        if (alerta == null) return;
        this.id = alerta.getId();
        if (alerta.getUsuario() != null) {
            this.usuarioId = alerta.getUsuario().getId();
            this.usuarioNombre = alerta.getUsuario().getNombre();
            this.usuarioTelefono = alerta.getUsuario().getTelefono();
        }
        if (alerta.getEstablecimiento() != null) {
            this.establecimientoId = alerta.getEstablecimiento().getId();
            this.establecimientoNombre = alerta.getEstablecimiento().getNombre();
        }
        this.tipoAlerta = alerta.getTipoAlerta();
        this.nivelUrgencia = alerta.getNivelUrgencia();
        this.estado = alerta.getEstado();
        this.latitud = alerta.getLatitud();
        this.longitud = alerta.getLongitud();
        this.municipio = alerta.getMunicipio();
        this.departamento = alerta.getDepartamento();
        this.ubicacionDetalle = alerta.getUbicacionDetalle();
        this.descripcion = alerta.getDescripcion();
        this.codigoSeguridad = alerta.getCodigoSeguridad();
        this.activo = alerta.getActivo();
        this.votosPositivos = alerta.getVotosPositivos();
        this.votosTotales = alerta.getVotosTotales();
        this.anonimo = alerta.getAnonimo();
        this.porcentajeCoincidencia = (alerta.getVotosTotales() != null && alerta.getVotosTotales() > 0)
                ? (int) Math.round((alerta.getVotosPositivos() * 100.0) / alerta.getVotosTotales())
                : 100;
        this.createdAt = alerta.getCreatedAt();
        this.updatedAt = alerta.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getUsuarioTelefono() {
        return usuarioTelefono;
    }

    public void setUsuarioTelefono(String usuarioTelefono) {
        this.usuarioTelefono = usuarioTelefono;
    }

    public Long getEstablecimientoId() {
        return establecimientoId;
    }

    public void setEstablecimientoId(Long establecimientoId) {
        this.establecimientoId = establecimientoId;
    }

    public String getEstablecimientoNombre() {
        return establecimientoNombre;
    }

    public void setEstablecimientoNombre(String establecimientoNombre) {
        this.establecimientoNombre = establecimientoNombre;
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

    public EstadoAlerta getEstado() {
        return estado;
    }

    public void setEstado(EstadoAlerta estado) {
        this.estado = estado;
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

    public Boolean getActivo() {
        return activo != null ? activo : true;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getVotosPositivos() {
        return votosPositivos;
    }

    public void setVotosPositivos(Integer votosPositivos) {
        this.votosPositivos = votosPositivos;
    }

    public Integer getVotosTotales() {
        return votosTotales;
    }

    public void setVotosTotales(Integer votosTotales) {
        this.votosTotales = votosTotales;
    }

    public Integer getPorcentajeCoincidencia() {
        return porcentajeCoincidencia;
    }

    public void setPorcentajeCoincidencia(Integer porcentajeCoincidencia) {
        this.porcentajeCoincidencia = porcentajeCoincidencia;
    }

    public Boolean getAnonimo() {
        return anonimo;
    }

    public void setAnonimo(Boolean anonimo) {
        this.anonimo = anonimo;
    }
}
