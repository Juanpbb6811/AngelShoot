package com.angelshot.controller;

import com.angelshot.dto.EstadisticasDTO;
import com.angelshot.service.EstadisticaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/estadisticas")
@Tag(name = "Estadísticas y Métricas", description = "Dashboard gerencial y reportes operativos")
public class EstadisticaController {

    private final EstadisticaService estadisticaService;

    public EstadisticaController(EstadisticaService estadisticaService) {
        this.estadisticaService = estadisticaService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    @Operation(summary = "Obtener resumen general de estadísticas")
    public ResponseEntity<EstadisticasDTO> obtenerResumen() {
        return ResponseEntity.ok(estadisticaService.obtenerResumen());
    }
}
