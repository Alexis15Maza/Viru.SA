package com.virusa.entity; 

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.Data;           
import lombok.NoArgsConstructor;    


@Entity
@Table(name = "Productos") 
@EntityListeners(AuditingEntityListener.class)
@Data 
@NoArgsConstructor 
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(name = "nombre_producto", nullable = false, length = 100)
    private String nombreProducto;

    @Column(name = "descripcion_producto", length = 500)
    private String descripcionProducto;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_temperatura_producto", nullable = false)
    private TipoTemperaturaProducto temperatura; 

    @ManyToOne(fetch = FetchType.EAGER) 
    @JoinColumn(name = "id_estado_producto", nullable = false)
    private TipoEstadoProducto estado; 

    @CreatedDate 
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

}