document.addEventListener('DOMContentLoaded', function () {

    const API_BASE_URL = 'http://localhost:8080/api/productos'; 

    const formTitle = document.getElementById('form-title');
    const productForm = document.getElementById('product-form');
    const btnSubmitForm = document.getElementById('btn-submit-form');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tablaBody = document.querySelector('#tabla-productos tbody');
    const selectTemperatura = document.getElementById('temperatura');
    const inputDescripcion = document.getElementById('descripcion');
    const selectEstado = document.getElementById('estado');

    const inputBuscador = document.getElementById('buscador-productos');
    const btnExportar = document.getElementById('btn-exportar'); 

    let currentProductId = null; 

    /* ===== PAGINACIÓN Y FILTRADO ===== */
    const FILAS_POR_PAGINA = 10;
    let paginaActual = 1; 
    let totalPaginas = 1;
    let textoBusqueda = ""; 

    function resetForm() {
        productForm.reset();
        formTitle.textContent = 'Agregar Producto';
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
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error('Producto no encontrado. Código: ' + response.status);

            const producto = await response.json();

            // 1. Cargar datos
            currentProductId = id;
            document.getElementById('nombreProducto').value = producto.nombreProducto;
            inputDescripcion.value = producto.descripcionProducto || '';

            // 2. Cargar RELACIONES 
            selectTemperatura.value = producto.temperatura.idTemperaturaProducto;
            selectEstado.value = producto.estado.idEstadoProducto;

            // 3. Cambiar UI a modo Edición
            formTitle.textContent = `Editar Producto ID: ${id}`;
            btnSubmitForm.textContent = 'Guardar Cambios';
            btnSubmitForm.classList.remove('btn-primary');
            btnSubmitForm.classList.add('btn-warning');
            document.getElementById('estado-group').style.display = 'block';
            btnCancelar.textContent = 'Cancelar Edición';

            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error al cargar el producto para edición:', error);
            mostrarNotificacion(`Error al cargar la información: ${error.message}.`, 'danger');
        }
    }

    function mostrarNotificacion(message, type = 'info') {

        const notificationArea = document.createElement('div');
        notificationArea.className = `alert alert-${type} alert-dismissible fade show fixed-top mt-3 mx-auto w-50`;
        notificationArea.setAttribute('role', 'alert');
        notificationArea.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(notificationArea);
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(notificationArea);
            bsAlert.close();
        }, 4000); 
    }

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
            mostrarNotificacion("No se pudieron cargar las opciones de temperatura.", 'danger');
        }
    }

    async function cargarEstados() {
        try {
            const response = await fetch(`${API_BASE_URL}/estados`); 
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
            mostrarNotificacion("No se pudieron cargar las opciones de estado.", 'danger');
        }
    }

    function construirUrlCarga() {

        const params = `page=${paginaActual - 1}&size=${FILAS_POR_PAGINA}&sort=idProducto&direction=desc`;
        let url = API_BASE_URL;

        if (textoBusqueda && textoBusqueda.length > 0) {

            url += `/buscar?nombre=${encodeURIComponent(textoBusqueda)}&${params}`;
        } else {

            url += `/pagina?${params}`;
        }
        return url;
    }

    async function cargarProductos() {
        try {
            const urlFinal = construirUrlCarga(); 
            const response = await fetch(urlFinal);
            
            if (!response.ok) throw new Error('Error al cargar productos paginados.');

            const pagina = await response.json();
            const productos = pagina.content;
            totalPaginas = pagina.totalPages;

            tablaBody.innerHTML = '';
            
            if (productos.length === 0) {
                 tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron productos que coincidan con la búsqueda.</td></tr>';
            } else {
                productos.forEach(p => {
                    const estadoClass = p.estado.idEstadoProducto === 1 ? 'bg-success' : 'bg-danger';
                    const estadoTexto = p.estado.nombreEstadoProducto;

                    let botonAccion;
                    if (p.estado.idEstadoProducto === 1) {
                        botonAccion = `
                        <button class="btn btn-sm btn-danger btn-cambiar-estado" 
                            data-id="${p.idProducto}" data-nuevo-estado="2">
                            <i class="bi bi-trash-fill"></i> Eliminar
                        </button>`;
                    } else {
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
            }


            asignarEventosTabla();
            actualizarPaginacion(); 

        } catch (error) {
            console.error("Error al cargar productos paginados:", error);
            tablaBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar datos del servidor.</td></tr>';
        }
    }


    function asignarEventosTabla() {

        document.querySelectorAll('.btn-editar').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                loadProductForEdit(id);
            });
        });

        document.querySelectorAll('.btn-cambiar-estado').forEach(button => {
            button.addEventListener('click', function () {
                const id = this.getAttribute('data-id');
                const nuevoEstado = this.getAttribute('data-nuevo-estado');

                const accionTexto = nuevoEstado === '2' ? 'INACTIVAR' : 'RESTAURAR';

                if (window.confirm(`¿Está seguro de ${accionTexto} el producto ID: ${id}?`)) {
                    cambiarEstadoProducto(id, parseInt(nuevoEstado));
                }
            });
        });
    }

    function actualizarPaginacion() {
        document.getElementById('num-pagina').textContent = paginaActual;
        document.getElementById('btn-anterior').disabled = paginaActual === 1;
        document.getElementById('btn-siguiente').disabled = paginaActual >= totalPaginas;
    }

    inputBuscador.addEventListener('input', function () {
        textoBusqueda = this.value.trim();
        paginaActual = 1; 
        cargarProductos();
    });

    async function cambiarEstadoProducto(id, nuevoEstadoId) {
        try {
            const response = await fetch(`${API_BASE_URL}/estado/${id}/${nuevoEstadoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Error al actualizar el estado.');

            const accion = nuevoEstadoId === 2 ? 'INACTIVADO' : 'RESTAURADO';
            mostrarNotificacion(`Producto ID: ${id} ${accion} con éxito.`, 'success');
            cargarProductos();

        } catch (error) {
            mostrarNotificacion(`Fallo la operación: ${error.message}`, 'danger');
        }
    }

    productForm.addEventListener('submit', async function (event) {
        event.preventDefault();


        const nombreProducto = document.getElementById('nombreProducto').value;
        const descripcionProducto = inputDescripcion.value; 
        const idTemperaturaProducto = parseInt(selectTemperatura.value);
        const idEstadoProducto = currentProductId ? parseInt(selectEstado.value) : 1;

        if (!idTemperaturaProducto) {
            mostrarNotificacion("Debe seleccionar la temperatura del producto.", 'warning');
            return;
        }

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
            mostrarNotificacion(`Producto: "${nombreProducto}" - ${accion} con éxito.`, 'success');

            resetForm();

        } catch (error) {
            console.error(error);
            mostrarNotificacion(`Error al guardar el producto: ${error.message}`, 'danger');
        }
    });

    btnExportar.addEventListener('click', function() {

        mostrarNotificacion("Preparando descarga de todos los productos en Excel...", 'info');
        window.location.href = `${API_BASE_URL}/exportar`;
    });

    document.getElementById('btn-anterior').addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            cargarProductos();
        }
    });

    document.getElementById('btn-siguiente').addEventListener('click', () => {
        if (paginaActual < totalPaginas) {
            paginaActual++;
            cargarProductos();
        }
    });

    function inicializar() {
        cargarTemperaturas();
        cargarEstados();
        cargarProductos();
    }

    inicializar();
});