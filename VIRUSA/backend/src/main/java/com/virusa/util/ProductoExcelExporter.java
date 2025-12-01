package com.virusa.util; 

import com.virusa.entity.Producto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
public class ProductoExcelExporter {

    public byte[] exportar(List<Producto> productos) throws IOException {

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Productos");
 
        String[] headers = {"ID", "Nombre", "Descripción", "Estado", "Temperatura", "Fecha Creación"};
        Row headerRow = sheet.createRow(0);

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Producto p : productos) {
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(p.getIdProducto());
            row.createCell(1).setCellValue(p.getNombreProducto());
            row.createCell(2).setCellValue(p.getDescripcionProducto());

            row.createCell(3).setCellValue(p.getEstado().getNombreEstadoProducto());
            row.createCell(4).setCellValue(p.getTemperatura().getNombreTemperaturaProducto());

            if (p.getFechaCreacion() != null) {

                row.createCell(5).setCellValue(p.getFechaCreacion().toString()); 
            } else {
                row.createCell(5).setCellValue("");
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }
}