package com.virusa.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_registro")
@Data
public class StockRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_stock_registro")
    private Long idStockRegistro;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "lote", length = 50)
    private String lote;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDate fechaIngreso;

    @Column(name = "fecha_caducidad")
    private LocalDate fechaCaducidad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_temperatura_producto")
    private TipoTemperaturaProducto temperaturaAlmacenamiento;

    @Column(name = "comentarios", length = 500)
    private String comentarios;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoStock estado = EstadoStock.POR_EXPORTAR;

    @Column(name = "cantidad_exportada", nullable = false)
    private Integer cantidadExportada = 0;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @Column(name = "fecha_ultima_modificacion")
    private LocalDateTime fechaUltimaModificacion;

    @PreUpdate
    protected void onUpdate() {
        this.fechaUltimaModificacion = LocalDateTime.now();
    }

    public void setProveedor(Proveedor proveedor) {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    public enum EstadoStock {
        POR_EXPORTAR,
        EXPORTADO_PARCIAL,
        EXPORTADO_COMPLETO
    }

    // Método para calcular el estado basado en cantidades
    public EstadoStock calcularEstado() {
        if (cantidadExportada == 0) {
            return EstadoStock.POR_EXPORTAR;
        } else if (cantidadExportada > 0 && cantidadExportada < cantidad) {
            return EstadoStock.EXPORTADO_PARCIAL;
        } else {
            return EstadoStock.EXPORTADO_COMPLETO;
        }
    }

    // Método para exportar cantidad
    public void exportarCantidad(Integer cantidadExportar) {
        if (cantidadExportar <= (cantidad - cantidadExportada)) {
            this.cantidadExportada += cantidadExportar;
            this.estado = calcularEstado();
        } else {
            throw new IllegalArgumentException("Cantidad a exportar excede el stock disponible");
        }
    }

    // Método para obtener cantidad disponible
    public Integer getCantidadDisponible() {
        return cantidad - cantidadExportada;
    }
}
