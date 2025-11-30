package com.virusa.repository;

import com.virusa.entity.TipoEstadoProducto; 
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoEstadoRepository extends JpaRepository<TipoEstadoProducto, Integer> {
}
