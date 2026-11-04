package com.angelshot.repository;

import com.angelshot.entity.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByAlertaIdOrderByCreatedAtAsc(Long alertaId);
}
