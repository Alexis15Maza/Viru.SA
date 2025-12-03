document.addEventListener('DOMContentLoaded', function () {


    // Manejador de envío de formulario
    document.getElementById('formularioProveedor').addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const empresa = document.getElementById('empresa').value;
        const direccion = document.getElementById('direccion').value;
        const estado = document.getElementById('estado').value;

        const proveedor = {
            id: Date.now(), // ID temporal solo en el front
            nombre,
            empresa,
            direccion,
            estado
        };

        // Añadir proveedor a la tabla
        const tablaBody = document
            .getElementById('tablaProveedores')
            .getElementsByTagName('tbody')[0];

        const nuevaFila = tablaBody.insertRow();
        nuevaFila.innerHTML = `
            <td>${proveedor.id}</td>
            <td>${proveedor.nombre}</td>
            <td>${proveedor.empresa}</td>
            <td>${proveedor.direccion}</td>
            <td>${proveedor.estado}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editarProveedor(${proveedor.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
            </td>
        `;

        // Limpiar formulario
        document.getElementById('formularioProveedor').reset();
    });

    // Botón Exportar a Excel (por ahora solo mensaje)
    document.getElementById('exportarExcel').addEventListener('click', function () {
        alert('Funcionalidad para exportar a Excel (implementada en Java con Apache POI).');
    });
});

// Función para editar proveedor (por ahora solo mensaje)
function editarProveedor(id) {
    alert('Funcionalidad de editar proveedor con ID: ' + id);
}

// Función para eliminar proveedor (eliminación en la tabla = eliminación lógica visual)
function eliminarProveedor(id) {
    const filas = document.querySelectorAll('#tablaProveedores tbody tr');
    filas.forEach(fila => {
        const idCelda = fila.cells[0].textContent;
        if (idCelda === String(id)) {
            fila.remove();
        }
    });
}
