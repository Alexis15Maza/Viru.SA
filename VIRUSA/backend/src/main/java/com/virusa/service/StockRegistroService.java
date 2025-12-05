package com.virusa.service;

import com.virusa.dto.StockRegistroCreateDTO;
import com.virusa.dto.StockRegistroDTO;
import com.virusa.dto.ExportarStockDTO;
import com.virusa.entity.*;
import com.virusa.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StockRegistroService {

    @Autowired
    private StockRegistroRepository stockRegistroRepository;
    
    @Autowired
    private ProveedorRepository proveedorRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private TipoTemperaturaRepository temperaturaRepository;
    
    public StockRegistroDTO registrarStock(StockRegistroCreateDTO dto) {
        // Validar proveedor
        Proveedor proveedor = proveedorRepository.findById(dto.getIdProveedor())
            .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        
        // Validar producto
        Producto producto = productoRepository.findById(dto.getIdProducto())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Validar temperatura (si se especifica)
        TipoTemperaturaProducto temperatura = null;
        if (dto.getIdTemperaturaProducto() != null) {
            temperatura = temperaturaRepository.findById(dto.getIdTemperaturaProducto())
                .orElseThrow(() -> new RuntimeException("Temperatura no encontrada"));
        }
        
        // Crear registro de stock
        StockRegistro stock = new StockRegistro();
        stock.setProveedor(proveedor);
        stock.setProducto(producto);
        stock.setCantidad(dto.getCantidad());
        stock.setLote(dto.getLote());
        stock.setFechaIngreso(dto.getFechaIngreso());
        stock.setFechaCaducidad(dto.getFechaCaducidad());
        stock.setTemperaturaAlmacenamiento(temperatura);
        stock.setComentarios(dto.getComentarios());
        
        // Si no se especifica temperatura, usar la del producto
        if (temperatura == null) {
            stock.setTemperaturaAlmacenamiento(producto.getTemperatura());
        }
        
        StockRegistro saved = stockRegistroRepository.save(stock);
        return convertirADTO(saved);
    }
    
    public List<StockRegistroDTO> obtenerTodos() {
        return stockRegistroRepository.findAll().stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    public StockRegistroDTO obtenerPorId(Long id) {
        StockRegistro stock = stockRegistroRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro de stock no encontrado"));
        return convertirADTO(stock);
    }
    
    public StockRegistroDTO actualizarStock(Long id, StockRegistroCreateDTO dto) {
        StockRegistro stock = stockRegistroRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro de stock no encontrado"));
        
        // Actualizar campos
        if (dto.getIdProveedor() != null) {
            Proveedor proveedor = proveedorRepository.findById(dto.getIdProveedor())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
            stock.setProveedor(proveedor);
        }
        
        if (dto.getIdProducto() != null) {
            Producto producto = productoRepository.findById(dto.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            stock.setProducto(producto);
        }
        
        if (dto.getCantidad() != null) {
            // Validar que la nueva cantidad no sea menor que lo ya exportado
            if (dto.getCantidad() < stock.getCantidadExportada()) {
                throw new RuntimeException("La cantidad no puede ser menor que lo ya exportado");
            }
            stock.setCantidad(dto.getCantidad());
        }
        
        if (dto.getLote() != null) {
            stock.setLote(dto.getLote());
        }
        
        if (dto.getFechaIngreso() != null) {
            stock.setFechaIngreso(dto.getFechaIngreso());
        }
        
        if (dto.getFechaCaducidad() != null) {
            stock.setFechaCaducidad(dto.getFechaCaducidad());
        }
        
        if (dto.getIdTemperaturaProducto() != null) {
            TipoTemperaturaProducto temperatura = temperaturaRepository.findById(dto.getIdTemperaturaProducto())
                .orElseThrow(() -> new RuntimeException("Temperatura no encontrada"));
            stock.setTemperaturaAlmacenamiento(temperatura);
        }
        
        if (dto.getComentarios() != null) {
            stock.setComentarios(dto.getComentarios());
        }
        
        StockRegistro actualizado = stockRegistroRepository.save(stock);
        return convertirADTO(actualizado);
    }
    
    @Transactional
    public StockRegistroDTO exportarStock(ExportarStockDTO dto) {
        StockRegistro stock = stockRegistroRepository.findById(dto.getIdStockRegistro())
            .orElseThrow(() -> new RuntimeException("Registro de stock no encontrado"));
        
        stock.exportarCantidad(dto.getCantidadExportar());
        
        StockRegistro actualizado = stockRegistroRepository.save(stock);
        return convertirADTO(actualizado);
    }
    
    public void eliminarLogicamente(Long id) {
        StockRegistro stock = stockRegistroRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registro de stock no encontrado"));
        
        // Podríamos marcar como eliminado o simplemente eliminar físicamente
        // Para eliminación lógica, agregaríamos un campo "activo" a la entidad
        stockRegistroRepository.delete(stock);
    }
    
    public List<StockRegistroDTO> buscarPorCriterios(Long idProveedor, Long idProducto, String estado, String lote) {
        StockRegistro.EstadoStock estadoEnum = null;
        if (estado != null && !estado.isEmpty()) {
            try {
                estadoEnum = StockRegistro.EstadoStock.valueOf(estado.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Estado inválido: " + estado);
            }
        }
        
        List<StockRegistro> resultados = stockRegistroRepository.buscarPorCriterios(
            idProveedor, idProducto, estadoEnum, lote
        );
        
        return resultados.stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    public ByteArrayResource exportarAExcel() throws IOException {
        List<StockRegistroDTO> registros = obtenerTodos();
        
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Registros de Stock");
            
            // Estilo para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            // Crear encabezados
            String[] headers = {
                "ID", "Proveedor", "Producto", "Lote", "Cantidad", 
                "Disponible", "Exportado", "Estado", "F.Ingreso", 
                "F.Caducidad", "Temperatura", "Comentarios", "F.Registro"
            };
            
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            int rowNum = 1;
            
            for (StockRegistroDTO reg : registros) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(reg.getIdStockRegistro());
                row.createCell(1).setCellValue(reg.getNombreProveedor());
                row.createCell(2).setCellValue(reg.getNombreProducto());
                row.createCell(3).setCellValue(reg.getLote() != null ? reg.getLote() : "");
                row.createCell(4).setCellValue(reg.getCantidad());
                row.createCell(5).setCellValue(reg.getCantidadDisponible());
                row.createCell(6).setCellValue(reg.getCantidadExportada());
                row.createCell(7).setCellValue(reg.getEstado());
                row.createCell(8).setCellValue(reg.getFechaIngreso().format(formatter));
                row.createCell(9).setCellValue(reg.getFechaCaducidad() != null ? 
                    reg.getFechaCaducidad().format(formatter) : "");
                row.createCell(10).setCellValue(reg.getTemperaturaNombre() != null ? 
                    reg.getTemperaturaNombre() : "");
                row.createCell(11).setCellValue(reg.getComentarios() != null ? 
                    reg.getComentarios() : "");
                row.createCell(12).setCellValue(reg.getFechaRegistro());
            }
            
            // Autoajustar columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            // Convertir a byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            return new ByteArrayResource(outputStream.toByteArray());
        }
    }
    
    private StockRegistroDTO convertirADTO(StockRegistro stock) {
        StockRegistroDTO dto = new StockRegistroDTO();
        dto.setIdStockRegistro(stock.getIdStockRegistro());
        dto.setIdProveedor(stock.getProveedor().getId());
        dto.setNombreProveedor(stock.getProveedor().getNombreProveedor());
        dto.setIdProducto(stock.getProducto().getIdProducto());
        dto.setNombreProducto(stock.getProducto().getNombreProducto());
        dto.setCantidad(stock.getCantidad());
        dto.setLote(stock.getLote());
        dto.setFechaIngreso(stock.getFechaIngreso());
        dto.setFechaCaducidad(stock.getFechaCaducidad());
        
        if (stock.getTemperaturaAlmacenamiento() != null) {
            dto.setIdTemperaturaProducto(stock.getTemperaturaAlmacenamiento().getIdTemperaturaProducto());
            dto.setTemperaturaNombre(stock.getTemperaturaAlmacenamiento().getNombreTemperaturaProducto());
        }
        
        dto.setComentarios(stock.getComentarios());
        dto.setEstado(stock.getEstado().toString());
        dto.setCantidadExportada(stock.getCantidadExportada());
        dto.setCantidadDisponible(stock.getCantidadDisponible());
        dto.setFechaRegistro(stock.getFechaRegistro().toString());
        
        return dto;
    }
}
