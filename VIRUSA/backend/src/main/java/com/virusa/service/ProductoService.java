package com.virusa.service;

import com.virusa.entity.Producto;
import com.virusa.repository.ProductoRepository;
import com.virusa.util.ProductoExcelExporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ProductoExcelExporter exporter;

    public byte[] exportarProductosAExcel() throws IOException {

        List<Producto> productos = productoRepository.findAll();
        
        return exporter.exportar(productos);
    }
}
