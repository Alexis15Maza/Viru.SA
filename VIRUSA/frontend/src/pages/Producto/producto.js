//
// Archivo: script.js - Lógica FINAL y CORREGIDA para el CRUD REST
//
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. CONFIGURACIÓN Y REFERENCIAS ---
    const API_BASE_URL = 'http://localhost:8080/api/productos'; // URL base del ProductoController

    // Referencias al DOM
    const formTitle = document.getElementById('form-title');
    const productForm = document.getElementById('product-form');
    const btnSubmitForm = document.getElementById('btn-submit-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaBody = document.querySelector('#tabla-productos tbody');
    const selectTemperatura = document.getElementById('temperatura');
    const inputDescripcion = document.getElementById('descripcion'); // Asumimos ID 'descripcion'
    const selectEstado = document.getElementById('estado'); // Asumimos ID 'estado'

    let currentProductId = null; // ID del producto en edición (null si es nuevo)

    // --- 2. FUNCIONES DE UTILIDAD ---

    function resetForm() {
        productForm.reset();
        formTitle.textContent = '➕ Agregar Producto';
        btnSubmitForm.textContent = 'Crear Producto';
        btnSubmitForm.classList.remove('btn-warning');
        btnSubmitForm.classList.add('btn-primary');
        document.getElementById('estado-group').style.display = 'none';
        btnCancelar.textContent = 'Limpiar Formulario';
        currentProductId = null;
        selectTemperatura.value = "";
        cargarProductos();
    }

    // Función que carga los datos de un producto en el formulario para editar
    async function loadProductForEdit(id) {
        try {
            // 🚨 CORRECCIÓN 1: Usar API_BASE_URL para la llamada GET por ID
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado. Código: ' + response.status);

            const producto = await response.json();

            // 1. Cargar datos
            currentProductId = id;
            document.getElementById('nombreProducto').value = producto.nombreProducto;

            // 🚨 CORRECCIÓN 2: Usar inputDescripcion (ID 'descripcion')
            inputDescripcion.value = producto.descripcionProducto || '';

            // 2. Cargar RELACIONES 
            selectTemperatura.value = producto.temperatura.idTemperaturaProducto;
            selectEstado.value = producto.estado.idEstadoProducto;

            // 3. Cambiar UI a modo Edición
            formTitle.textContent = `✏️ Editar Producto ID: ${id}`;
            btnSubmitForm.textContent = 'Guardar Cambios';
            btnSubmitForm.classList.remove('btn-primary');
            btnSubmitForm.classList.add('btn-warning');
            document.getElementById('estado-group').style.display = 'block';
            btnCancelar.textContent = 'Cancelar Edición';

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error al cargar el producto para edición:', error);
            alert(`Error al cargar la información: ${error.message}.`);
        }
    }

    // --- 3. FUNCIONES DE CARGA DE DATOS (GET) ---

    // Llena el desplegable de Temperaturas (Catálogo)
    async function cargarTemperaturas() {
        try {
            const response = await fetch(`${API_BASE_URL}/temperaturas`);
            if (!response.ok) throw new Error('No se pudieron cargar las temperaturas.');

            const temperaturas = await response.json();
            selectTemperatura.innerHTML = '<option value="" disabled selected>Seleccione la temperatura</option>';

            temperaturas.forEach(t => {
                const option = document.createElement('option');
                option.value = t.idTemperaturaProducto;
                option.textContent = t.nombreTemperaturaProducto;
                selectTemperatura.appendChild(option);
            });

        } catch (error) {
            console.error("Error cargando temperaturas:", error);
            alert("No se pudieron cargar las opciones de temperatura.");
        }
    }

    // Llena el desplegable de Estados (Catálogo)
    async function cargarEstados() {
        try {
            const response = await fetch(`${API_BASE_URL}/estados`); // endpoint que ya existe
            if (!response.ok) throw new Error('No se pudieron cargar los estados.');

            const estados = await response.json();
            selectEstado.innerHTML = '<option value="" disabled selected>Seleccione el estado</option>';

            estados.forEach(e => {
                const option = document.createElement('option');
                option.value = e.idEstadoProducto;
                option.textContent = e.nombreEstadoProducto;
                selectEstado.appendChild(option);
            });

        } catch (error) {
            console.error("Error cargando estados:", error);
            alert("No se pudieron cargar las opciones de estado.");
        }
    }

    // Rellena la tabla con productos activos
    async function cargarProductos() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error('Error al listar productos.');

            const productos = await response.json();
            tablaBody.innerHTML = '';

            productos.forEach(p => {
                const estadoClass = p.estado.idEstadoProducto === 1 ? 'bg-success' : 'bg-danger';
                const estadoTexto = p.estado.nombreEstadoProducto;

                let botonAccion;
                // Si el producto está ACTIVO (1), ofrecemos Inactivar (2)
                if (p.estado.idEstadoProducto === 1) {
                    botonAccion = `
                        <button class="btn btn-sm btn-danger btn-cambiar-estado" 
                            data-id="${p.idProducto}" data-nuevo-estado="2">
                            <i class="bi bi-trash-fill"></i> Eliminar (Lógica)
                        </button>`;
                } else {
                    // Si el producto está INACTIVO (2), ofrecemos Activar (1)
                    botonAccion = `
                        <button class="btn btn-sm btn-success btn-cambiar-estado" 
                            data-id="${p.idProducto}" data-nuevo-estado="1">
                            <i class="bi bi-arrow-clockwise"></i> Restaurar
                        </button>`;
                }

                const row = `
                    <tr>
                        <td>${p.idProducto}</td>
                        <td>${p.nombreProducto}</td>
                        <td>${p.descripcionProducto || ''}</td>
                        <td><span class="badge ${estadoClass}">${estadoTexto}</span></td>
                        <td>${p.temperatura.nombreTemperaturaProducto}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-info text-white me-2 btn-editar" data-id="${p.idProducto}">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                            ${botonAccion}
                        </td>
                    </tr>
                `;
                tablaBody.innerHTML += row;
            });

            asignarEventosTabla();

        } catch (error) {
            console.error("Error al cargar productos:", error);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos del servidor.</td></tr>';
        }
    }

    // --- 4. ASIGNACIÓN DE EVENTOS DINÁMICOS ---

    function asignarEventosTabla() {
        // Evento para los botones de Editar
        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                loadProductForEdit(id);
            });
        });

        // Evento para los botones de Eliminar/Restaurar
        document.querySelectorAll('.btn-cambiar-estado').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const nuevoEstado = this.getAttribute('data-nuevo-estado');
                cambiarEstadoProducto(id, parseInt(nuevoEstado));
            });
        });
    }

    /* ========== BUSCADOR EN VIVO ========== */
    const inputBuscador = document.getElementById('buscador-productos');

    inputBuscador.addEventListener('input', function () {
        const texto = this.value.toLowerCase();
        const filas = tablaBody.querySelectorAll('tr');

        filas.forEach(fila => {
            const nombre = fila.cells[1].textContent.toLowerCase(); // columna "Nombre"
            fila.style.display = nombre.includes(texto) ? '' : 'none';
        });
    });

    // --- 5. FUNCIONES DE ACCIÓN (POST, PUT) ---

    // Función para manejar la Eliminación Lógica o Restauración
    async function cambiarEstadoProducto(id, nuevoEstadoId) {
        // ... (lógica de confirmación) ...
        // Simplificado para evitar redundancia
        const productoNombre = document.querySelector(`[data-id="${id}"]`).closest('tr').cells[1].textContent;
        const accion = nuevoEstadoId === 2 ? 'INACTIVAR' : 'RESTAURAR';

        const confirmacion = confirm(`¿Está seguro de ${accion} el producto "${productoNombre}" (ID: ${id})?`);

        if (confirmacion) {
            try {
                const response = await fetch(`${API_BASE_URL}/estado/${id}/${nuevoEstadoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) throw new Error('Error al actualizar el estado.');

                alert(`Producto "${productoNombre}" ${accion} con éxito.`);
                cargarProductos();

            } catch (error) {
                alert(`Fallo la operación: ${error.message}`);
            }
        }
    }

    // Manejar el envío del Formulario (Crear o Actualizar)
    productForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // 1. Recolección de datos
        const nombreProducto = document.getElementById('nombreProducto').value;
        const descripcionProducto = inputDescripcion.value; // Usamos la referencia
        const idTemperaturaProducto = parseInt(selectTemperatura.value);
        const idEstadoProducto = currentProductId ? parseInt(selectEstado.value) : 1;

        /* === NUEVOS LOGS === */
        console.log('Valor del selectEstado →', selectEstado.value);
        console.log('idEstadoProducto que se enviará →', idEstadoProducto);
        /* =================== */

        if (!idTemperaturaProducto) {
            alert("Debe seleccionar la temperatura del producto.");
            return;
        }

        // 2. Crear el objeto de datos que Spring Boot espera
        const productoData = {
            nombreProducto: nombreProducto,
            descripcionProducto: descripcionProducto,
            temperatura: { idTemperaturaProducto: idTemperaturaProducto },
            estado: { idEstadoProducto: idEstadoProducto }
        };

        const method = currentProductId ? 'PUT' : 'POST';
        const url = currentProductId ? `${API_BASE_URL}/${currentProductId}` : API_BASE_URL;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productoData)
            });

            if (!response.ok) throw new Error(`Fallo la ${method} de datos: ${response.statusText}`);

            const accion = currentProductId ? 'Actualizado' : 'Creado';
            alert(`Producto: "${nombreProducto}" - ${accion} con éxito.`);

            resetForm();

        } catch (error) {
            console.error(error);
            alert(`Error al guardar el producto: ${error.message}`);
        }
    });

    // --- 6. INICIALIZACIÓN ---

    function inicializar() {
        cargarTemperaturas();
        cargarEstados();
        cargarProductos();
    }

    // Inicia la aplicación JavaScript cuando el DOM esté listo
    inicializar();
});