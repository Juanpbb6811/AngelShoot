package com.angelshot.service;

import com.angelshot.dto.ActualizarEstadoRequest;
import com.angelshot.dto.AlertaDTO;
import com.angelshot.dto.CrearAlertaRequest;
import com.angelshot.entity.*;
import com.angelshot.exception.BadRequestException;
import com.angelshot.exception.ConflictException;
import com.angelshot.exception.ResourceNotFoundException;
import com.angelshot.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

        // RF09: Control de concurrencia y rechazo de duplicados en < 10 minutos
        LocalDateTime diezMinAtras = LocalDateTime.now().minusMinutes(10);
        List<Alerta> duplicados = alertaRepository.buscarDuplicadosRecientes(
                usuario.getId(),
                request.getTipoAlerta(),
                request.getLatitud(),
                request.getLongitud(),
                request.getUbicacionDetalle(),
                diezMinAtras
        );
        if (!duplicados.isEmpty()) {
            throw new ConflictException("Ya has emitido una alerta o reporte en esta misma zona en los últimos 10 minutos.");
        }

        Alerta alerta = new Alerta();
        alerta.setUsuario(usuario);
        alerta.setTipoAlerta(request.getTipoAlerta());
        alerta.setLatitud(request.getLatitud());
        alerta.setLongitud(request.getLongitud());
        alerta.setMunicipio(request.getMunicipio() != null && !request.getMunicipio().isBlank() ? request.getMunicipio() : "Chía");
        alerta.setDepartamento(request.getDepartamento() != null && !request.getDepartamento().isBlank() ? request.getDepartamento() : "Cundinamarca");
        alerta.setUbicacionDetalle(request.getUbicacionDetalle());
        alerta.setDescripcion(request.getDescripcion());
        alerta.setCodigoSeguridad(request.getCodigoSeguridad());
        alerta.setActivo(true);

        // Asignar urgencia según tipo si no viene especificada
        if (request.getNivelUrgencia() != null) {
            alerta.setNivelUrgencia(request.getNivelUrgencia());
        } else {
            alerta.setNivelUrgencia(
                request.getTipoAlerta() == TipoAlerta.ANGEL_SHOT_CON_LIMA || request.getTipoAlerta() == TipoAlerta.ACOSO_O_INTIMIDACION ? NivelUrgencia.CRITICA :
                request.getTipoAlerta() == TipoAlerta.ANGEL_SHOT_CON_HIELO || request.getTipoAlerta() == TipoAlerta.ILUMINACION_DEFICIENTE ? NivelUrgencia.ALTA :
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

    // RF04 & RF07: Filtrar alertas combinadas por tipo, estado, municipio (Chía, Zipaquirá, Cajicá) y visibilidad
    public List<AlertaDTO> filtrarAlertas(TipoAlerta tipo, EstadoAlerta estado, String municipio, Boolean soloActivos) {
        return alertaRepository.filtrarAlertas(tipo, estado, municipio, soloActivos != null ? soloActivos : true).stream()
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

    // RF08: Moderación de alertas por administración (ocultar del mapa sin borrar)
    @Transactional
    public AlertaDTO moderarAlerta(Long id, boolean activo, String motivo, String emailAdmin) {
        Alerta alerta = alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada con ID: " + id));
        alerta.setActivo(activo);
        Alerta guardada = alertaRepository.save(alerta);

        Usuario admin = usuarioRepository.findByEmail(emailAdmin).orElse(null);
        Seguimiento seg = new Seguimiento(
                guardada,
                admin,
                alerta.getEstado(),
                alerta.getEstado(),
                (activo ? "Alerta reactivada en el mapa. " : "Alerta inactivada por moderación. ") + (motivo != null ? "Motivo: " + motivo : "")
        );
        seguimientoRepository.save(seg);

        return mapToDTO(guardada);
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
        dto.setMunicipio(a.getMunicipio());
        dto.setDepartamento(a.getDepartamento());
        dto.setUbicacionDetalle(a.getUbicacionDetalle());
        dto.setDescripcion(a.getDescripcion());
        dto.setCodigoSeguridad(a.getCodigoSeguridad());
        dto.setActivo(a.getActivo());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}
