package com.angelshot.controller;

import com.angelshot.dto.ActualizarEstadoRequest;
import com.angelshot.dto.AlertaDTO;
import com.angelshot.dto.CrearAlertaRequest;
import com.angelshot.entity.EstadoAlerta;
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
@Tag(name = "Alertas Angel Shot", description = "Emisión, seguimiento y gestión de solicitudes de auxilio")
public class AlertaController {

    private final AlertaService alertaService;

    public AlertaController(AlertaService alertaService) {
        this.alertaService = alertaService;
    }

    @PostMapping
    @Operation(summary = "Emitir una alerta de auxilio Angel Shot")
    public ResponseEntity<AlertaDTO> emitirAlerta(Authentication auth, @Valid @RequestBody CrearAlertaRequest request) {
        return ResponseEntity.ok(alertaService.emitirAlerta(auth.getName(), request));
    }

    @GetMapping("/mis-alertas")
    @Operation(summary = "Listar alertas emitidas por el usuario en sesión")
    public ResponseEntity<List<AlertaDTO>> listarMisAlertas(Authentication auth) {
        return ResponseEntity.ok(alertaService.listarMisAlertas(auth.getName()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OPERADOR', 'GESTOR', 'ADMIN')")
    @Operation(summary = "Listar todas las alertas (Personal de seguridad / Admin)")
    public ResponseEntity<List<AlertaDTO>> listarTodas(@RequestParam(required = false) EstadoAlerta estado) {
        if (estado != null) {
            return ResponseEntity.ok(alertaService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(alertaService.listarTodas());
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
