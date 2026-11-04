package com.angelshot.service;

import com.angelshot.dto.EstadisticasDTO;
import com.angelshot.entity.EstadoAlerta;
import com.angelshot.entity.TipoAlerta;
import com.angelshot.repository.AlertaRepository;
import com.angelshot.repository.EstablecimientoRepository;
import com.angelshot.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class EstadisticaService {

    private final AlertaRepository alertaRepository;
    private final EstablecimientoRepository establecimientoRepository;
    private final UsuarioRepository usuarioRepository;

    public EstadisticaService(AlertaRepository alertaRepository,
                              EstablecimientoRepository establecimientoRepository,
                              UsuarioRepository usuarioRepository) {
        this.alertaRepository = alertaRepository;
        this.establecimientoRepository = establecimientoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public EstadisticasDTO obtenerResumen() {
        EstadisticasDTO dto = new EstadisticasDTO();
        dto.setTotalAlertas(alertaRepository.count());
        dto.setAlertasEmitidas(alertaRepository.countByEstado(EstadoAlerta.EMITIDA));
        dto.setAlertasEnAtencion(alertaRepository.countByEstado(EstadoAlerta.EN_ATENCION) + alertaRepository.countByEstado(EstadoAlerta.ASISTENCIA_EN_CURSO));
        dto.setAlertasResueltas(alertaRepository.countByEstado(EstadoAlerta.RESUELTA));
        dto.setAlertasCanceladas(alertaRepository.countByEstado(EstadoAlerta.CANCELADA));
        dto.setTotalEstablecimientos(establecimientoRepository.count());
        dto.setTotalUsuarios(usuarioRepository.count());

        Map<String, Long> porTipo = new HashMap<>();
        for (TipoAlerta tipo : TipoAlerta.values()) {
            porTipo.put(tipo.name(), 0L);
        }
        alertaRepository.findAll().forEach(a -> {
            porTipo.put(a.getTipoAlerta().name(), porTipo.getOrDefault(a.getTipoAlerta().name(), 0L) + 1);
        });
        dto.setAlertasPorTipo(porTipo);

        return dto;
    }
}
