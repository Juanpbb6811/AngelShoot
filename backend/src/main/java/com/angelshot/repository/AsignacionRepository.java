package com.angelshot.repository;

import com.angelshot.entity.Asignacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, Long> {
    List<Asignacion> findByOperadorIdOrderByFechaAsignacionDesc(Long operadorId);
    Optional<Asignacion> findByAlertaId(Long alertaId);
}
