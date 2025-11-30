package com.virusa.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Tipos_Temperaturas_Productos")
@Data
@NoArgsConstructor
public class TipoTemperaturaProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_temperatura_producto")
    private Integer idTemperaturaProducto;

    @Column(name = "nombre_temperatura_producto", nullable = false, unique = true, length = 50)
    private String nombreTemperaturaProducto;

    @Column(name = "descripcion_temperatura_producto", length = 100)
    private String descripcionTemperaturaProducto;
}
