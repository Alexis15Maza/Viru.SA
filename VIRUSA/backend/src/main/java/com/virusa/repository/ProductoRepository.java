package com.virusa.repository;

import com.virusa.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List; 

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByEstado_IdEstadoProducto(Integer estadoId);

    Page<Producto> findByNombreProductoContainingIgnoreCase(String nombre, Pageable pageable);
}