package com.angelshot.repository;

import com.angelshot.entity.Alerta;
import com.angelshot.entity.EstadoAlerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
    List<Alerta> findByEstadoOrderByCreatedAtDesc(EstadoAlerta estado);
    List<Alerta> findByEstablecimientoIdOrderByCreatedAtDesc(Long establecimientoId);
    long countByEstado(EstadoAlerta estado);
}
