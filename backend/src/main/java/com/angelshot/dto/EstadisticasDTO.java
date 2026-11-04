package com.angelshot.dto;

import java.util.Map;

public class EstadisticasDTO {

    private long totalAlertas;
    private long alertasEmitidas;
    private long alertasEnAtencion;
    private long alertasResueltas;
    private long alertasCanceladas;
    private long totalEstablecimientos;
    private long totalUsuarios;
    private Map<String, Long> alertasPorTipo;

    public EstadisticasDTO() {
    }

    public long getTotalAlertas() {
        return totalAlertas;
    }

    public void setTotalAlertas(long totalAlertas) {
        this.totalAlertas = totalAlertas;
    }

    public long getAlertasEmitidas() {
        return alertasEmitidas;
    }

    public void setAlertasEmitidas(long alertasEmitidas) {
        this.alertasEmitidas = alertasEmitidas;
    }

    public long getAlertasEnAtencion() {
        return alertasEnAtencion;
    }

    public void setAlertasEnAtencion(long alertasEnAtencion) {
        this.alertasEnAtencion = alertasEnAtencion;
    }

    public long getAlertasResueltas() {
        return alertasResueltas;
    }

    public void setAlertasResueltas(long alertasResueltas) {
        this.alertasResueltas = alertasResueltas;
    }

    public long getAlertasCanceladas() {
        return alertasCanceladas;
    }

    public void setAlertasCanceladas(long alertasCanceladas) {
        this.alertasCanceladas = alertasCanceladas;
    }

    public long getTotalEstablecimientos() {
        return totalEstablecimientos;
    }

    public void setTotalEstablecimientos(long totalEstablecimientos) {
        this.totalEstablecimientos = totalEstablecimientos;
    }

    public long getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }

    public Map<String, Long> getAlertasPorTipo() {
        return alertasPorTipo;
    }

    public void setAlertasPorTipo(Map<String, Long> alertasPorTipo) {
        this.alertasPorTipo = alertasPorTipo;
    }
}
