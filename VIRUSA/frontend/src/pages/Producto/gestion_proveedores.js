document.getElementById('formularioProveedor').addEventListener('submit', function(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const empresa = document.getElementById('empresa').value;
    const direccion = document.getElementById('direccion').value;
    const estado = document.getElementById('estado').value;

    const proveedor = {
        id: Date.now(),
        nombre,
        empresa,
        direccion,
        estado
    };

    // Añadir proveedor a la tabla
    const tabla = document.getElementById('tablaProveedores').getElementsByTagName('tbody')[0];
    const nuevaFila = tabla.insertRow();
    nuevaFila.innerHTML = `
        <td>${proveedor.id}</td>
        <td>${proveedor.nombre}</td>
        <td>${proveedor.empresa}</td>
        <td>${proveedor.direccion}</td>
        <td>${proveedor.estado}</td>
        <td>
            <button onclick="editarProveedor(${proveedor.id})">Editar</button>
            <button class="delete" onclick="eliminarProveedor(${proveedor.id})">Eliminar</button>
        </td>
    `;

    // Limpiar formulario
    document.getElementById('formularioProveedor').reset();
});

function editarProveedor(id) {
    alert('Funcionalidad de editar proveedor con ID: ' + id);
}

function eliminarProveedor(id) {
    const fila = document.querySelector(`td:first-child:contains('${id}')`).parentElement;
    fila.remove();
}

document.getElementById('exportarExcel').addEventListener('click', function() {
    alert('Funcionalidad para exportar a Excel');
});

