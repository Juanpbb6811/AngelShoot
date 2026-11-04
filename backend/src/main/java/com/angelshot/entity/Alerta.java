package com.angelshot.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "establecimiento_id")
    private Establecimiento establecimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", nullable = false, length = 50)
    private TipoAlerta tipoAlerta;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_urgencia", nullable = false, length = 20)
    private NivelUrgencia nivelUrgencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoAlerta estado = EstadoAlerta.EMITIDA;

    private Double latitud;
    private Double longitud;

    @Column(length = 100)
    private String municipio; // Chía, Zipaquirá, Cajicá

    @Column(length = 100)
    private String departamento = "Cundinamarca";

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "ubicacion_detalle", length = 255)
    private String ubicacionDetalle; // Ej: "Frente a la U. Cundinamarca", "Mesa 12"

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "codigo_seguridad", length = 10)
    private String codigoSeguridad;

    @Lob
    @Column(name = "evidencia_foto")
    private byte[] evidenciaFoto;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Alerta() {
    }

    public Alerta(Usuario usuario, TipoAlerta tipoAlerta, NivelUrgencia nivelUrgencia, String municipio, String ubicacionDetalle, Double latitud, Double longitud, String descripcion) {
        this.usuario = usuario;
        this.tipoAlerta = tipoAlerta;
        this.nivelUrgencia = nivelUrgencia != null ? nivelUrgencia : NivelUrgencia.MEDIA;
        this.municipio = municipio;
        this.ubicacionDetalle = ubicacionDetalle;
        this.latitud = latitud;
        this.longitud = longitud;
        this.descripcion = descripcion;
        this.departamento = "Cundinamarca";
        this.activo = true;
        this.estado = EstadoAlerta.EMITIDA;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Establecimiento getEstablecimiento() {
        return establecimiento;
    }

    public void setEstablecimiento(Establecimiento establecimiento) {
        this.establecimiento = establecimiento;
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

    public byte[] getEvidenciaFoto() {
        return evidenciaFoto;
    }

    public void setEvidenciaFoto(byte[] evidenciaFoto) {
        this.evidenciaFoto = evidenciaFoto;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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

    public Boolean getActivo() {
        return activo != null ? activo : true;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
