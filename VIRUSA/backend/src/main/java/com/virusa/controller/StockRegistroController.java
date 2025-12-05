package com.virusa.controller;

import com.virusa.dto.StockRegistroCreateDTO;
import com.virusa.dto.StockRegistroDTO;
import com.virusa.dto.ExportarStockDTO;
import com.virusa.service.StockRegistroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "http://localhost:5500")
public class StockRegistroController {

    @Autowired
    private StockRegistroService stockRegistroService;

    @GetMapping
    public ResponseEntity<List<StockRegistroDTO>> listarTodos() {
        List<StockRegistroDTO> registros = stockRegistroService.obtenerTodos();
        return ResponseEntity.ok(registros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StockRegistroDTO> obtenerPorId(@PathVariable Long id) {
        StockRegistroDTO registro = stockRegistroService.obtenerPorId(id);
        return ResponseEntity.ok(registro);
    }

    @PostMapping
    public ResponseEntity<StockRegistroDTO> registrar(@RequestBody StockRegistroCreateDTO dto) {
        // Validar fecha de ingreso (no puede ser futura)
        if (dto.getFechaIngreso().isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body(null);
        }
        
        StockRegistroDTO registro = stockRegistroService.registrarStock(dto);
        return ResponseEntity.ok(registro);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StockRegistroDTO> actualizar(
            @PathVariable Long id,
            @RequestBody StockRegistroCreateDTO dto) {
        StockRegistroDTO actualizado = stockRegistroService.actualizarStock(id, dto);
        return ResponseEntity.ok(actualizado);
    }

    @PostMapping("/exportar")
    public ResponseEntity<StockRegistroDTO> exportarStock(@RequestBody ExportarStockDTO dto) {
        StockRegistroDTO actualizado = stockRegistroService.exportarStock(dto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        stockRegistroService.eliminarLogicamente(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<StockRegistroDTO>> buscar(
            @RequestParam(required = false) Long proveedor,
            @RequestParam(required = false) Long producto,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String lote) {
        
        List<StockRegistroDTO> resultados = stockRegistroService.buscarPorCriterios(
            proveedor, producto, estado, lote
        );
        return ResponseEntity.ok(resultados);
    }

    @GetMapping("/exportar-excel")
    public ResponseEntity<ByteArrayResource> exportarExcel() throws IOException {
        ByteArrayResource resource = stockRegistroService.exportarAExcel();
        
        String nombreArchivo = "registros_stock_" + LocalDate.now() + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + nombreArchivo + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(resource.contentLength())
                .body(resource);
    }
}
