package com.virusa.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "proveedor")
@Getter
@Setter
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_proveedor", nullable = false)
    private String nombreProveedor;

    @Column(name = "empresa", nullable = false)
    private String empresa;

    @Column(name = "direccion_empresa", nullable = false)
    private String direccionEmpresa;

    @Column(name = "estado_empresa", nullable = false)
    private String estadoEmpresa; // "ACTIVO" / "INACTIVO"
}


