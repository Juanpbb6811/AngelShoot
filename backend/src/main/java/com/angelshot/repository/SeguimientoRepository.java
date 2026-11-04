package com.angelshot.repository;

import com.angelshot.entity.Seguimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeguimientoRepository extends JpaRepository<Seguimiento, Long> {
    List<Seguimiento> findByAlertaIdOrderByCreatedAtAsc(Long alertaId);
}
