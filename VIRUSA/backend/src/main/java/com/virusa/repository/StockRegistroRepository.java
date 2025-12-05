package com.virusa.repository;

import com.virusa.entity.StockRegistro;
import com.virusa.entity.StockRegistro.EstadoStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface StockRegistroRepository extends JpaRepository<StockRegistro, Long> {

    // Buscar por proveedor
    List<StockRegistro> findByProveedorId(Long idProveedor);
    
    // Buscar por producto
    List<StockRegistro> findByProductoIdProducto(Long idProducto);
    
    // Buscar por estado
    List<StockRegistro> findByEstado(EstadoStock estado);
    
    // Buscar por lote
    List<StockRegistro> findByLoteContainingIgnoreCase(String lote);
    
    // Buscar por rango de fechas de ingreso
    List<StockRegistro> findByFechaIngresoBetween(LocalDate fechaInicio, LocalDate fechaFin);
    
    // Buscar por fecha de caducidad próxima (próximos 30 días)
    @Query("SELECT s FROM StockRegistro s WHERE s.fechaCaducidad BETWEEN :hoy AND :fechaLimite")
    List<StockRegistro> findCaducidadProxima(@Param("hoy") LocalDate hoy, @Param("fechaLimite") LocalDate fechaLimite);
    
    // Obtener stock total por producto
    @Query("SELECT s.producto, SUM(s.cantidad - s.cantidadExportada) as disponible " +
           "FROM StockRegistro s GROUP BY s.producto")
    List<Object[]> findStockTotalPorProducto();
    
    // Buscar por múltiples criterios
    @Query("SELECT s FROM StockRegistro s WHERE " +
           "(:idProveedor IS NULL OR s.proveedor.id = :idProveedor) AND " +
           "(:idProducto IS NULL OR s.producto.idProducto = :idProducto) AND " +
           "(:estado IS NULL OR s.estado = :estado) AND " +
           "(:lote IS NULL OR s.lote LIKE %:lote%)")
    List<StockRegistro> buscarPorCriterios(
        @Param("idProveedor") Long idProveedor,
        @Param("idProducto") Long idProducto,
        @Param("estado") EstadoStock estado,
        @Param("lote") String lote
    );
}
