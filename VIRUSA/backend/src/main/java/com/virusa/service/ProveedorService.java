@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    // Método para registrar proveedor
    public Proveedor registrarProveedor(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    // Método para obtener todos los proveedores
    public List<Proveedor> obtenerProveedores() {
        return proveedorRepository.findAll();
    }

    // Método para exportar a Excel
    public ByteArrayResource exportarExcel() {
        List<Proveedor> proveedores = proveedorRepository.findAll();
        // Aquí va la lógica para generar el archivo Excel con Apache POI
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        // Implementar la generación de Excel con POI aquí
        return new ByteArrayResource(out.toByteArray());
    }
}

