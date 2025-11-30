package com.virusa.entity; 

import jakarta.persistence.*;

@Entity
@Table(name = "Tipos_Estados_Productos")
public class TipoEstadoProducto {
    
    @Id
    @Column(name = "id_estado_producto")
    private Integer idEstadoProducto;

    @Column(name = "nombre_estado_producto", nullable = false, unique = true, length = 50)
    private String nombreEstadoProducto;

    public Integer getIdEstadoProducto() {
        return idEstadoProducto;
    }
    public void setIdEstadoProducto(Integer idEstadoProducto) {
        this.idEstadoProducto = idEstadoProducto;
    }
    public String getNombreEstadoProducto() {
        return nombreEstadoProducto;
    }
    public void setNombreEstadoProducto(String nombreEstadoProducto) {
        this.nombreEstadoProducto = nombreEstadoProducto;
    }
}
