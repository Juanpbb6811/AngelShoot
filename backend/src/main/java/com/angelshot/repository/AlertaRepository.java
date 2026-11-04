package com.angelshot.repository;

import com.angelshot.entity.Alerta;
import com.angelshot.entity.EstadoAlerta;
import com.angelshot.entity.TipoAlerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Long> {

    List<Alerta> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    List<Alerta> findByEstadoOrderByCreatedAtDesc(EstadoAlerta estado);

    List<Alerta> findByEstablecimientoIdOrderByCreatedAtDesc(Long establecimientoId);

    @Query("SELECT a FROM Alerta a WHERE " +
           "(:tipo IS NULL OR a.tipoAlerta = :tipo) AND " +
           "(:estado IS NULL OR a.estado = :estado) AND " +
           "(:municipio IS NULL OR :municipio = '' OR LOWER(a.municipio) LIKE LOWER(CONCAT('%', :municipio, '%'))) AND " +
           "(:soloActivos IS NULL OR :soloActivos = false OR a.activo = true) " +
           "ORDER BY a.createdAt DESC")
    List<Alerta> filtrarAlertas(
            @Param("tipo") TipoAlerta tipo,
            @Param("estado") EstadoAlerta estado,
            @Param("municipio") String municipio,
            @Param("soloActivos") Boolean soloActivos
    );

    // RF09: Control de concurrencia y duplicados en < 10 minutos
    @Query("SELECT a FROM Alerta a WHERE a.usuario.id = :usuarioId AND a.createdAt >= :desde AND " +
           "(a.tipoAlerta = :tipoAlerta OR " +
           "(:latitud IS NOT NULL AND :longitud IS NOT NULL AND a.latitud IS NOT NULL AND a.longitud IS NOT NULL AND " +
           "ABS(a.latitud - :latitud) < 0.0008 AND ABS(a.longitud - :longitud) < 0.0008) OR " +
           "(:ubicacionDetalle IS NOT NULL AND :ubicacionDetalle != '' AND LOWER(a.ubicacionDetalle) = LOWER(:ubicacionDetalle)))")
    List<Alerta> buscarDuplicadosRecientes(
            @Param("usuarioId") Long usuarioId,
            @Param("tipoAlerta") TipoAlerta tipoAlerta,
            @Param("latitud") Double latitud,
            @Param("longitud") Double longitud,
            @Param("ubicacionDetalle") String ubicacionDetalle,
            @Param("desde") LocalDateTime desde
    );

    long countByEstado(EstadoAlerta estado);
}
