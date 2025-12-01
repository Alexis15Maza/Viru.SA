package com.virusa.controller;

import com.virusa.entity.Producto;
import com.virusa.entity.TipoEstadoProducto;
import com.virusa.entity.TipoTemperaturaProducto;
import com.virusa.repository.ProductoRepository;
import com.virusa.repository.TipoEstadoRepository;
import com.virusa.repository.TipoTemperaturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.virusa.service.ProductoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private TipoEstadoRepository estadoRepository;

    @Autowired
    private TipoTemperaturaRepository temperaturaRepository;

    @Autowired
    private ProductoService productoService;

    @GetMapping("/temperaturas")
    public List<TipoTemperaturaProducto> obtenerTemperaturas() {
        return temperaturaRepository.findAll();
    }

    @GetMapping
    public List<Producto> listarProductosActivos() {
        final Integer ESTADO_ACTIVO = 1;
        return productoRepository.findByEstado_IdEstadoProducto(ESTADO_ACTIVO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto productoNuevo) {
        final Integer ESTADO_ACTIVO_ID = 1;
        Optional<TipoEstadoProducto> estadoActivoOpt = estadoRepository.findById(ESTADO_ACTIVO_ID);

        if (estadoActivoOpt.isEmpty()) {
            return ResponseEntity.internalServerError().build();
        }
        productoNuevo.setEstado(estadoActivoOpt.get());
        Producto productoGuardado = productoRepository.save(productoNuevo);
        return ResponseEntity.ok(productoGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id,
            @RequestBody Producto detallesProducto) {
        if (id == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Producto> optProd = productoRepository.findById(id);
        if (optProd.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Producto productoExistente = optProd.get();
        productoExistente.setNombreProducto(detallesProducto.getNombreProducto());
        productoExistente.setDescripcionProducto(detallesProducto.getDescripcionProducto());

        Integer tempId = detallesProducto.getTemperatura().getIdTemperaturaProducto();
        if (tempId == null) {
            return ResponseEntity.badRequest().build();
        }

        System.out.println("tempId = " + tempId);

        Optional<TipoTemperaturaProducto> tempOpt = temperaturaRepository.findById(tempId);

        if (tempOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        productoExistente.setTemperatura(tempOpt.get());

        Integer estId = detallesProducto.getEstado().getIdEstadoProducto();
        if (estId == null) {
            return ResponseEntity.badRequest().build();
        }

        System.out.println("estId = " + estId);

        Optional<TipoEstadoProducto> estadoOpt = estadoRepository.findById(estId);

        if (estadoOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        productoExistente.setEstado(estadoOpt.get());

        Producto productoActualizado = productoRepository.save(productoExistente);
        return ResponseEntity.ok(productoActualizado);
    }

    @GetMapping("/estados")
    public List<TipoEstadoProducto> obtenerEstados() {
        return estadoRepository.findAll();
    }

    @PutMapping("/estado/{id}/{nuevoEstadoId}")
    public ResponseEntity<Producto> cambiarEstado(@PathVariable long id,
            @PathVariable int nuevoEstadoId) {

        Optional<TipoEstadoProducto> nuevoEstadoOpt = estadoRepository.findById(nuevoEstadoId);
        if (nuevoEstadoOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setEstado(nuevoEstadoOpt.get());
                    Producto productoModificado = productoRepository.save(producto);
                    return ResponseEntity.ok(productoModificado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/pagina")
    public ResponseEntity<Page<Producto>> listarProductosPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idProducto") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        if (sort == null || direction == null) {
            return ResponseEntity.badRequest().build();
        }

        Sort sortObj = Sort.by(Sort.Direction.fromString(direction), sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);
        Page<Producto> productos = productoRepository.findAll(pageable);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<Producto>> buscarPorNombre(
            @RequestParam String nombre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idProducto") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        if (nombre == null || nombre.trim().isEmpty() || sort == null || direction == null) {
            return ResponseEntity.badRequest().build();
        }

        Sort sortObj = Sort.by(Sort.Direction.fromString(direction), sort);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Producto> productos = productoRepository.findByNombreProductoContainingIgnoreCase(nombre, pageable);

        return ResponseEntity.ok(productos);
    }

    @GetMapping("/exportar")
    public ResponseEntity<byte[]> exportarAExcel() {
        try {

            byte[] excelContent = productoService.exportarProductosAExcel();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            String fileName = "productos_" + System.currentTimeMillis() + ".xlsx";
            headers.setContentDispositionFormData("attachment", fileName);

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(excelContent);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
