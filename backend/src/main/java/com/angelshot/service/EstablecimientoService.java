package com.angelshot.service;

import com.angelshot.dto.EstablecimientoDTO;
import com.angelshot.entity.Establecimiento;
import com.angelshot.exception.ResourceNotFoundException;
import com.angelshot.repository.EstablecimientoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EstablecimientoService {

    private final EstablecimientoRepository establecimientoRepository;

    public EstablecimientoService(EstablecimientoRepository establecimientoRepository) {
        this.establecimientoRepository = establecimientoRepository;
    }

    public List<EstablecimientoDTO> listarActivos() {
        return establecimientoRepository.findByActivoTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public EstablecimientoDTO obtenerPorId(Long id) {
        Establecimiento est = establecimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Establecimiento no encontrado con ID: " + id));
        return mapToDTO(est);
    }

    @Transactional
    public EstablecimientoDTO crear(EstablecimientoDTO dto) {
        Establecimiento est = new Establecimiento(
                dto.getNombre(),
                dto.getDireccion(),
                dto.getTipo(),
                dto.getLatitud(),
                dto.getLongitud(),
                dto.getTelefonoContacto()
        );
        est.setActivo(true);
        return mapToDTO(establecimientoRepository.save(est));
    }

    private EstablecimientoDTO mapToDTO(Establecimiento est) {
        EstablecimientoDTO dto = new EstablecimientoDTO();
        dto.setId(est.getId());
        dto.setNombre(est.getNombre());
        dto.setDireccion(est.getDireccion());
        dto.setTipo(est.getTipo());
        dto.setLatitud(est.getLatitud());
        dto.getLongitud();
        dto.setLongitud(est.getLongitud());
        dto.setTelefonoContacto(est.getTelefonoContacto());
        dto.setActivo(est.getActivo());
        return dto;
    }
}
