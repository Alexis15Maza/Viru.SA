package com.virusa.entity;

import jakarta.persistence.*;
import lombok.Data;              
import lombok.NoArgsConstructor;    

@Entity
@Table(name = "Tipos_Estados_Productos")
@Data 
@NoArgsConstructor 
public class TipoEstadoProducto {
    
    @Id
    @Column(name = "id_estado_producto")
    private Integer idEstadoProducto;

    @Column(name = "nombre_estado_producto", nullable = false, unique = true, length = 50)
    private String nombreEstadoProducto;

}
