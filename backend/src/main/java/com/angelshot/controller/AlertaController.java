package com.angelshot.controller;

import com.angelshot.dto.ActualizarEstadoRequest;
import com.angelshot.dto.AlertaDTO;
import com.angelshot.dto.CrearAlertaRequest;
import com.angelshot.entity.EstadoAlerta;
import com.angelshot.entity.TipoAlerta;
import com.angelshot.service.AlertaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertas")
@Tag(name = "Alertas y Puntos de Riesgo", description = "Emisión colaborativa, seguimiento y visualización en mapa de puntos de riesgo")
public class AlertaController {

    private final AlertaService alertaService;

    public AlertaController(AlertaService alertaService) {
        this.alertaService = alertaService;
    }

    // RF01 & RF03: Emisión protegida mediante JWT
    @PostMapping
    @Operation(summary = "Emitir una alerta de auxilio o registrar punto de riesgo")
    public ResponseEntity<AlertaDTO> emitirAlerta(Authentication auth, @Valid @RequestBody CrearAlertaRequest request) {
        return ResponseEntity.ok(alertaService.emitirAlerta(auth.getName(), request));
    }

    @GetMapping("/mis-alertas")
    @Operation(summary = "Listar alertas emitidas por la usuaria en sesión")
    public ResponseEntity<List<AlertaDTO>> listarMisAlertas(Authentication auth) {
        return ResponseEntity.ok(alertaService.listarMisAlertas(auth.getName()));
    }

    // RF04 & RF07: Consulta pública y filtros combinados por tipo y municipio (Chía, Zipaquirá, Cajicá)
    @GetMapping
    @Operation(summary = "Consultar alertas y puntos de riesgo con filtros (Público)")
    public ResponseEntity<List<AlertaDTO>> listarTodas(
            @RequestParam(required = false) TipoAlerta tipo,
            @RequestParam(required = false) EstadoAlerta estado,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false, defaultValue = "true") Boolean soloActivos
    ) {
        return ResponseEntity.ok(alertaService.filtrarAlertas(tipo, estado, municipio, soloActivos));
    }

    // RF05: Endpoint para mapa interactivo
    @GetMapping("/mapa")
    @Operation(summary = "Obtener puntos georreferenciados activos para el mapa Leaflet")
    public ResponseEntity<List<AlertaDTO>> listarParaMapa(
            @RequestParam(required = false) TipoAlerta tipo,
            @RequestParam(required = false) String municipio
    ) {
        return ResponseEntity.ok(alertaService.filtrarAlertas(tipo, null, municipio, true));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de una alerta por ID")
    public ResponseEntity<AlertaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(alertaService.obtenerPorId(id));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('OPERADOR', 'GESTOR', 'ADMIN')")
    @Operation(summary = "Actualizar estado de la alerta (Operadores / Gestores)")
    public ResponseEntity<AlertaDTO> actualizarEstado(
            @PathVariable Long id,
            Authentication auth,
            @Valid @RequestBody ActualizarEstadoRequest request) {
        return ResponseEntity.ok(alertaService.actualizarEstado(id, auth.getName(), request));
    }

    // RF08: Moderación administrativa de alertas
    @PatchMapping("/{id}/moderar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Moderar o inactivar alerta (Solo Admin)")
    public ResponseEntity<AlertaDTO> moderarAlerta(
            @PathVariable Long id,
            Authentication auth,
            @RequestParam boolean activo,
            @RequestParam(required = false) String motivo) {
        return ResponseEntity.ok(alertaService.moderarAlerta(id, activo, motivo, auth.getName()));
    }

    @PostMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN')")
    @Operation(summary = "Asignar alerta a un operador de seguridad")
    public ResponseEntity<AlertaDTO> asignarOperador(
            @PathVariable Long id,
            @RequestParam Long operadorId,
            @RequestParam(required = false, defaultValue = "") String notas) {
        return ResponseEntity.ok(alertaService.asignarOperador(id, operadorId, notas));
    }
}
