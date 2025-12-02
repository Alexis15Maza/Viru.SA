@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    // Endpoint para registrar un proveedor
    @PostMapping
    public ResponseEntity<Proveedor> registrarProveedor(@RequestBody Proveedor proveedor) {
        Proveedor nuevoProveedor = proveedorService.registrarProveedor(proveedor);
        return new ResponseEntity<>(nuevoProveedor, HttpStatus.CREATED);
    }

    // Endpoint para obtener todos los proveedores
    @GetMapping
    public ResponseEntity<List<Proveedor>> obtenerProveedores() {
        List<Proveedor> proveedores = proveedorService.obtenerProveedores();
        return new ResponseEntity<>(proveedores, HttpStatus.OK);
    }

    // Endpoint para exportar los proveedores a un archivo Excel
    @GetMapping("/exportar")
    public ResponseEntity<Resource> exportarExcel() {
        ByteArrayResource resource = proveedorService.exportarExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=proveedores.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}

