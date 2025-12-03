package com.virusa.controller;

import com.virusa.entity.Proveedor;
import com.virusa.service.ProveedorService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "http://localhost:5500") // cambia al puerto de tu frontend
public class ProveedorController {

    private final ProveedorService proveedorService;

    public ProveedorController(ProveedorService proveedorService) {
        this.proveedorService = proveedorService;
    }

    // LISTAR
    @GetMapping
    public List<Proveedor> listar() {
        return proveedorService.listarProveedores();
    }

    // REGISTRAR
    @PostMapping
    public Proveedor registrar(@RequestBody Proveedor proveedor) {
        return proveedorService.registrarProveedor(proveedor);
    }

    // EDITAR
    @PutMapping("/{id}")
    public ResponseEntity<Proveedor> editar(@PathVariable Long id,
                                            @RequestBody Proveedor proveedor) {
        return proveedorService.editarProveedor(id, proveedor)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CAMBIAR ESTADO (ACTIVO/INACTIVO)
    @PutMapping("/{id}/estado")
    public ResponseEntity<Proveedor> cambiarEstado(@PathVariable Long id,
                                                   @RequestParam String estado) {
        return proveedorService.cambiarEstado(id, estado)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // EXPORTAR EXCEL
    @GetMapping("/exportar")
    public ResponseEntity<Resource> exportarExcel() {
        ByteArrayResource resource = proveedorService.exportarExcel();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=proveedores.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(resource.contentLength())
                .body(resource);
    }
}

