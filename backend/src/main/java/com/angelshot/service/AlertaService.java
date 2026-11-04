package com.angelshot.service;

import com.angelshot.dto.ActualizarEstadoRequest;
import com.angelshot.dto.AlertaDTO;
import com.angelshot.dto.CrearAlertaRequest;
import com.angelshot.entity.*;
import com.angelshot.exception.BadRequestException;
import com.angelshot.exception.ResourceNotFoundException;
import com.angelshot.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstablecimientoRepository establecimientoRepository;
    private final SeguimientoRepository seguimientoRepository;
    private final AsignacionRepository asignacionRepository;
    private final EmailService emailService;

    public AlertaService(AlertaRepository alertaRepository,
                         UsuarioRepository usuarioRepository,
                         EstablecimientoRepository establecimientoRepository,
                         SeguimientoRepository seguimientoRepository,
                         AsignacionRepository asignacionRepository,
                         EmailService emailService) {
        this.alertaRepository = alertaRepository;
        this.usuarioRepository = usuarioRepository;
        this.establecimientoRepository = establecimientoRepository;
        this.seguimientoRepository = seguimientoRepository;
        this.asignacionRepository = asignacionRepository;
        this.emailService = emailService;
    }

    @Transactional
    public AlertaDTO emitirAlerta(String emailUsuario, CrearAlertaRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Alerta alerta = new Alerta();
        alerta.setUsuario(usuario);
        alerta.setTipoAlerta(request.getTipoAlerta());
        alerta.setLatitud(request.getLatitud());
        alerta.setLongitud(request.getLongitud());
        alerta.setUbicacionDetalle(request.getUbicacionDetalle());
        alerta.setDescripcion(request.getDescripcion());
        alerta.setCodigoSeguridad(request.getCodigoSeguridad());

        // Asignar urgencia según tipo si no viene especificada
        if (request.getNivelUrgencia() != null) {
            alerta.setNivelUrgencia(request.getNivelUrgencia());
        } else {
            alerta.setNivelUrgencia(
                request.getTipoAlerta() == TipoAlerta.ANGEL_SHOT_CON_LIMA ? NivelUrgencia.CRITICA :
                request.getTipoAlerta() == TipoAlerta.ANGEL_SHOT_CON_HIELO ? NivelUrgencia.ALTA :
                NivelUrgencia.MEDIA
            );
        }

        if (request.getEstablecimientoId() != null) {
            Establecimiento est = establecimientoRepository.findById(request.getEstablecimientoId())
                    .orElse(null);
            alerta.setEstablecimiento(est);
        }

        alerta.setEstado(EstadoAlerta.EMITIDA);
        Alerta guardada = alertaRepository.save(alerta);

        // Registro de seguimiento inicial
        Seguimiento seg = new Seguimiento(guardada, usuario, null, EstadoAlerta.EMITIDA, "Alerta Angel Shot emitida por el usuario");
        seguimientoRepository.save(seg);

        // Notificación de emergencia a contacto si existe
        if (usuario.getContactoEmergenciaTelefono() != null || usuario.getEmail() != null) {
            emailService.enviarAlertaEmergencia(
                usuario.getEmail(),
                usuario.getNombre(),
                alerta.getTipoAlerta().name(),
                alerta.getUbicacionDetalle() != null ? alerta.getUbicacionDetalle() : "Coordenadas: " + alerta.getLatitud() + ", " + alerta.getLongitud()
            );
        }

        return mapToDTO(guardada);
    }

    public List<AlertaDTO> listarMisAlertas(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return alertaRepository.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertaDTO> listarPorEstado(EstadoAlerta estado) {
        return alertaRepository.findByEstadoOrderByCreatedAtDesc(estado).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AlertaDTO> listarTodas() {
        return alertaRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AlertaDTO obtenerPorId(Long id) {
        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada con ID: " + id));
        return mapToDTO(alerta);
    }

    @Transactional
    public AlertaDTO actualizarEstado(Long id, String emailOperador, ActualizarEstadoRequest request) {
        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada con ID: " + id));

        Usuario operador = usuarioRepository.findByEmail(emailOperador).orElse(null);
        EstadoAlerta anterior = alerta.getEstado();
        alerta.setEstado(request.getNuevoEstado());

        Alerta actualizada = alertaRepository.save(alerta);

        Seguimiento seg = new Seguimiento(
                actualizada,
                operador,
                anterior,
                request.getNuevoEstado(),
                request.getComentario() != null ? request.getComentario() : "Estado actualizado a " + request.getNuevoEstado()
        );
        seguimientoRepository.save(seg);

        return mapToDTO(actualizada);
    }

    @Transactional
    public AlertaDTO asignarOperador(Long alertaId, Long operadorId, String notas) {
        Alerta alerta = alertaRepository.findById(alertaId)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada"));
        Usuario operador = usuarioRepository.findById(operadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Operador no encontrado"));

        Asignacion asignacion = asignacionRepository.findByAlertaId(alertaId)
                .orElse(new Asignacion(alerta, operador));

        asignacion.setOperador(operador);
        asignacion.setNotas(notas);
        asignacion.setEstadoAtencion("EN_CAMINO");
        asignacionRepository.save(asignacion);

        alerta.setEstado(EstadoAlerta.EN_ATENCION);
        alertaRepository.save(alerta);

        return mapToDTO(alerta);
    }

    private AlertaDTO mapToDTO(Alerta a) {
        AlertaDTO dto = new AlertaDTO();
        dto.setId(a.getId());
        if (a.getUsuario() != null) {
            dto.setUsuarioId(a.getUsuario().getId());
            dto.setUsuarioNombre(a.getUsuario().getNombre());
            dto.setUsuarioTelefono(a.getUsuario().getTelefono());
        }
        if (a.getEstablecimiento() != null) {
            dto.setEstablecimientoId(a.getEstablecimiento().getId());
            dto.setEstablecimientoNombre(a.getEstablecimiento().getNombre());
        }
        dto.setTipoAlerta(a.getTipoAlerta());
        dto.setNivelUrgencia(a.getNivelUrgencia());
        dto.setEstado(a.getEstado());
        dto.setLatitud(a.getLatitud());
        dto.setLongitud(a.getLongitud());
        dto.setUbicacionDetalle(a.getUbicacionDetalle());
        dto.setDescripcion(a.getDescripcion());
        dto.setCodigoSeguridad(a.getCodigoSeguridad());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
