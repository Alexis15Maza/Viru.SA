package com.virusa.repository;

import com.virusa.entity.TipoTemperaturaProducto; 
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoTemperaturaRepository extends JpaRepository<TipoTemperaturaProducto, Integer> {
}