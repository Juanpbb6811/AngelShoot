package com.angelshot.controller;

import com.angelshot.dto.EstablecimientoDTO;
import com.angelshot.service.EstablecimientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/establecimientos")
@Tag(name = "Establecimientos y Zonas Seguras", description = "Locales, bares y puntos seguros afiliados")
public class EstablecimientoController {

    private final EstablecimientoService establecimientoService;

    public EstablecimientoController(EstablecimientoService establecimientoService) {
        this.establecimientoService = establecimientoService;
    }

    @GetMapping
    @Operation(summary = "Listar establecimientos y puntos seguros activos")
    public ResponseEntity<List<EstablecimientoDTO>> listarActivos() {
        return ResponseEntity.ok(establecimientoService.listarActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener establecimiento por ID")
    public ResponseEntity<EstablecimientoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(establecimientoService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Registrar nuevo establecimiento o punto seguro (Solo Administrador)")
    public ResponseEntity<EstablecimientoDTO> crear(@Valid @RequestBody EstablecimientoDTO dto) {
        return ResponseEntity.ok(establecimientoService.crear(dto));
    }
}
