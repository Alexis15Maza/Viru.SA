package com.virusa.service;

import com.virusa.entity.Proveedor;
import com.virusa.repository.ProveedorRepository;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public ProveedorService(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    // LISTAR
    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    // REGISTRAR
    public Proveedor registrarProveedor(Proveedor proveedor) {
        // aquí podrías validar datos si quieres
        return proveedorRepository.save(proveedor);
    }

    // EDITAR
    public Optional<Proveedor> editarProveedor(Long id, Proveedor datos) {
        return proveedorRepository.findById(id).map(p -> {
            p.setNombreProveedor(datos.getNombreProveedor());
            p.setEmpresa(datos.getEmpresa());
            p.setDireccionEmpresa(datos.getDireccionEmpresa());
            p.setEstadoEmpresa(datos.getEstadoEmpresa());
            return proveedorRepository.save(p);
        });
    }

    // CAMBIAR ESTADO (ACTIVO/INACTIVO) – eliminación lógica
    public Optional<Proveedor> cambiarEstado(Long id, String nuevoEstado) {
        return proveedorRepository.findById(id).map(p -> {
            p.setEstadoEmpresa(nuevoEstado);
            return proveedorRepository.save(p);
        });
    }

    // EXPORTAR A EXCEL (Apache POI) – TODO en Java
    public ByteArrayResource exportarExcel() {
        List<Proveedor> proveedores = proveedorRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            XSSFSheet sheet = workbook.createSheet("Proveedores");

            // Cabecera
            XSSFRow header = sheet.createRow(0);
            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("Nombre del proveedor");
            header.createCell(2).setCellValue("Empresa");
            header.createCell(3).setCellValue("Dirección");
            header.createCell(4).setCellValue("Estado");

            // Filas de datos
            int rowNum = 1;
            for (Proveedor p : proveedores) {
                XSSFRow row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(p.getId());
                row.createCell(1).setCellValue(p.getNombreProveedor());
                row.createCell(2).setCellValue(p.getEmpresa());
                row.createCell(3).setCellValue(p.getDireccionEmpresa());
                row.createCell(4).setCellValue(p.getEstadoEmpresa());
            }

            workbook.write(out);
            return new ByteArrayResource(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Error al generar el Excel de proveedores", e);
        }
    }
}
