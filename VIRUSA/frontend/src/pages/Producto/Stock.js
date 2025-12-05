document.addEventListener('DOMContentLoaded', function() {
    // URLs de la API
    const API_BASE = 'http://localhost:8080/api';
    const API_STOCK = `${API_BASE}/stock`;
    const API_PROVEEDORES = `${API_BASE}/proveedores`;
    const API_PRODUCTOS = `${API_BASE}/productos`;
    const API_TEMPERATURAS = `${API_BASE}/productos/temperaturas`;
    
    // Variables globales
    let modoEdicion = false;
    let registros = [];
    let proveedores = [];
    let productos = [];
    let temperaturas = [];
    let registroActual = null;
    
    // Configuración de paginación
    const ITEMS_POR_PAGINA = 10;
    let paginaActual = 1;
    let totalPaginas = 1;
    let filtrosActivos = {};
    
    // Elementos DOM
    const elementos = {
        formContainer: document.getElementById('formulario-container'),
        formTitulo: document.getElementById('form-titulo'),
        formStock: document.getElementById('form-stock'),
        btnGuardar: document.getElementById('btn-guardar'),
        btnCancelar: document.getElementById('btn-cancelar'),
        btnNuevo: document.getElementById('btn-nuevo-registro'),
        btnBuscar: document.getElementById('btn-buscar'),
        btnRefresh: document.getElementById('btn-refresh'),
        btnExportarExcel: document.getElementById('btn-exportar-excel'),
        tablaBody: document.getElementById('tabla-body'),
        totalRegistros: document.getElementById('total-registros'),
        paginacion: document.getElementById('paginacion'),
        
        // Filtros
        filtroProveedor: document.getElementById('filtro-proveedor'),
        filtroProducto: document.getElementById('filtro-producto'),
        filtroEstado: document.getElementById('filtro-estado'),
        filtroLote: document.getElementById('filtro-lote'),
        
        // Selects del formulario
        selectProveedor: document.getElementById('proveedor'),
        selectProducto: document.getElementById('producto'),
        selectTemperatura: document.getElementById('temperatura'),
        
        // Modal exportar
        modalExportar: new bootstrap.Modal(document.getElementById('modalExportar')),
        exportarStockId: document.getElementById('exportar-stock-id'),
        exportarCantidad: document.getElementById('exportar-cantidad'),
        cantidadDisponible: document.getElementById('cantidad-disponible'),
        btnConfirmarExportar: document.getElementById('btn-confirmar-exportar'),
        
        // Modal detalles
        modalDetalles: new bootstrap.Modal(document.getElementById('modalDetalles')),
        detallesContenido: document.getElementById('detalles-contenido')
    };
    
    // Inicializar la aplicación
    async function inicializar() {
        await cargarDatosIniciales();
        cargarRegistros();
        configurarEventListeners();
        
        // Establecer fecha de hoy como valor por defecto
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-ingreso').value = hoy;
    }
    
    // Cargar datos iniciales (proveedores, productos, temperaturas)
    async function cargarDatosIniciales() {
        try {
            // Cargar proveedores activos
            const resProveedores = await fetch(`${API_PROVEEDORES}`);
            proveedores = await resProveedores.json();
            
            // Cargar productos activos
            const resProductos = await fetch(`${API_PRODUCTOS}`);
            productos = await resProductos.json();
            
            // Cargar temperaturas
            const resTemperaturas = await fetch(API_TEMPERATURAS);
            temperaturas = await resTemperaturas.json();
            
            // Llenar selects
            llenarSelectProveedores();
            llenarSelectProductos();
            llenarSelectTemperaturas();
            
            // Llenar filtros
            llenarFiltroProveedores();
            llenarFiltroProductos();
            
        } catch (error) {
            mostrarError('Error al cargar datos iniciales', error);
        }
    }
    
    // Llenar selects con datos
    function llenarSelectProveedores() {
        elementos.selectProveedor.innerHTML = '<option value="">Seleccione un proveedor</option>';
        proveedores.filter(p => p.estadoEmpresa === 'ACTIVO')
            .forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.id;
                option.textContent = `${proveedor.nombreProveedor} - ${proveedor.empresa}`;
                elementos.selectProveedor.appendChild(option);
            });
    }
    
    function llenarFiltroProveedores() {
        elementos.filtroProveedor.innerHTML = '<option value="">Todos los proveedores</option>';
        proveedores.filter(p => p.estadoEmpresa === 'ACTIVO')
            .forEach(proveedor => {
                const option = document.createElement('option');
                option.value = proveedor.id;
                option.textContent = `${proveedor.nombreProveedor}`;
                elementos.filtroProveedor.appendChild(option);
            });
    }
    
    function llenarSelectProductos() {
        elementos.selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.idProducto;
            option.textContent = producto.nombreProducto;
            elementos.selectProducto.appendChild(option);
        });
    }
    
    function llenarFiltroProductos() {
        elementos.filtroProducto.innerHTML = '<option value="">Todos los productos</option>';
        productos.forEach(producto => {
            const option = document.createElement('option');
            option.value = producto.idProducto;
            option.textContent = producto.nombreProducto;
            elementos.filtroProducto.appendChild(option);
        });
    }
    
    function llenarSelectTemperaturas() {
        elementos.selectTemperatura.innerHTML = '<option value="">Usar temperatura del producto</option>';
        temperaturas.forEach(temp => {
            const option = document.createElement('option');
            option.value = temp.idTemperaturaProducto;
            option.textContent = temp.nombreTemperaturaProducto;
            elementos.selectTemperatura.appendChild(option);
        });
    }
    
    // Cargar registros de stock
    async function cargarRegistros() {
        try {
            elementos.tablaBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando registros...</p>
                    </td>
                </tr>
            `;
            
            let url = API_STOCK;
            
            // Aplicar filtros si existen
            const params = new URLSearchParams();
            if (filtrosActivos.proveedor) params.append('proveedor', filtrosActivos.proveedor);
            if (filtrosActivos.producto) params.append('producto', filtrosActivos.producto);
            if (filtrosActivos.estado) params.append('estado', filtrosActivos.estado);
            if (filtrosActivos.lote) params.append('lote', filtrosActivos.lote);
            
            if (params.toString()) {
                url = `${API_STOCK}/buscar?${params.toString()}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            registros = await response.json();
            mostrarRegistros();
            
        } catch (error) {
            mostrarError('Error al cargar registros', error);
            elementos.tablaBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle fs-4"></i><br>
                        Error al cargar los datos
                    </td>
                </tr>
            `;
        }
    }
    
    // Mostrar registros en la tabla
    function mostrarRegistros() {
        elementos.totalRegistros.textContent = registros.length;
        
        if (registros.length === 0) {
            elementos.tablaBody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted">
                        <i class="bi bi-inbox fs-4"></i><br>
                        No se encontraron registros de stock
                    </td>
                </tr>
            `;
            elementos.paginacion.innerHTML = '';
            return;
        }
        
        // Calcular paginación
        totalPaginas = Math.ceil(registros.length / ITEMS_POR_PAGINA);
        const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
        const fin = inicio + ITEMS_POR_PAGINA;
        const registrosPagina = registros.slice(inicio, fin);
        
        // Renderizar registros
        elementos.tablaBody.innerHTML = '';
        registrosPagina.forEach(registro => {
            const fila = crearFilaRegistro(registro);
            elementos.tablaBody.appendChild(fila);
        });
        
        // Renderizar paginación
        renderizarPaginacion();
    }
    
    // Crear fila de tabla para un registro
    function crearFilaRegistro(registro) {
        const tr = document.createElement('tr');
        
        // Determinar clase CSS según estado
        let estadoClass = '';
        let estadoText = '';
        
        switch(registro.estado) {
            case 'POR_EXPORTAR':
                estadoClass = 'badge-estado badge-por-exportar';
                estadoText = 'Por Exportar';
                break;
            case 'EXPORTADO_PARCIAL':
                estadoClass = 'badge-estado badge-exportado-parcial';
                estadoText = 'Exportado Parcial';
                break;
            case 'EXPORTADO_COMPLETO':
                estadoClass = 'badge-estado badge-exportado-completo';
                estadoText = 'Exportado Completo';
                break;
        }
        
        // Formatear fechas
        const fechaIngreso = new Date(registro.fechaIngreso).toLocaleDateString('es-ES');
        const fechaCaducidad = registro.fechaCaducidad 
            ? new Date(registro.fechaCaducidad).toLocaleDateString('es-ES')
            : 'No aplica';
        
        tr.innerHTML = `
            <td class="fw-bold">${registro.idStockRegistro}</td>
            <td>
                <div class="fw-semibold">${registro.nombreProveedor}</div>
                <small class="text-muted">${registro.proveedor?.empresa || ''}</small>
            </td>
            <td>${registro.nombreProducto}</td>
            <td>
                ${registro.lote || '<span class="text-muted">Sin lote</span>'}
            </td>
            <td>
                <span class="fw-bold">${registro.cantidad}</span>
                <small class="d-block text-muted">${registro.temperaturaNombre || ''}</small>
            </td>
            <td>
                <span class="fw-bold ${registro.cantidadDisponible === 0 ? 'text-success' : ''}">
                    ${registro.cantidadDisponible}
                </span>
                <small class="d-block text-muted">de ${registro.cantidad}</small>
            </td>
            <td><span class="${estadoClass}">${estadoText}</span></td>
            <td>${fechaIngreso}</td>
            <td>${fechaCaducidad}</td>
            <td class="text-center action-buttons">
                <button class="btn btn-sm btn-info" onclick="verDetalles(${registro.idStockRegistro})"
                        title="Ver detalles">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editarRegistro(${registro.idStockRegistro})"
                        ${registro.estado === 'EXPORTADO_COMPLETO' ? 'disabled' : ''}
                        title="Editar registro">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="abrirModalExportar(${registro.idStockRegistro}, ${registro.cantidadDisponible})"
                        ${registro.cantidadDisponible === 0 ? 'disabled' : ''}
                        title="Exportar stock">
                    <i class="bi bi-upload"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarRegistro(${registro.idStockRegistro})"
                        title="Eliminar registro">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        return tr;
    }
    
    // Renderizar controles de paginación
    function renderizarPaginacion() {
        elementos.paginacion.innerHTML = '';
        
        // Botón anterior
        const liAnterior = document.createElement('li');
        liAnterior.className = `page-item ${paginaActual === 1 ? 'disabled' : ''}`;
        liAnterior.innerHTML = `
            <button class="page-link" onclick="cambiarPagina(${paginaActual - 1})">
                <i class="bi bi-chevron-left"></i>
            </button>
        `;
        elementos.paginacion.appendChild(liAnterior);
        
        // Números de página
        const inicio = Math.max(1, paginaActual - 2);
        const fin = Math.min(totalPaginas, inicio + 4);
        
        for (let i = inicio; i <= fin; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === paginaActual ? 'active' : ''}`;
            li.innerHTML = `
                <button class="page-link" onclick="cambiarPagina(${i})">${i}</button>
            `;
            elementos.paginacion.appendChild(li);
        }
        
        // Botón siguiente
        const liSiguiente = document.createElement('li');
        liSiguiente.className = `page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`;
        liSiguiente.innerHTML = `
            <button class="page-link" onclick="cambiarPagina(${paginaActual + 1})">
                <i class="bi bi-chevron-right"></i>
            </button>
        `;
        elementos.paginacion.appendChild(liSiguiente);
    }
    
    // Configurar event listeners
    function configurarEventListeners() {
        // Formulario principal
        elementos.formStock.addEventListener('submit', manejarSubmitForm);
        elementos.btnCancelar.addEventListener('click', cancelarEdicion);
        elementos.btnNuevo.addEventListener('click', mostrarFormularioNuevo);
        elementos.btnBuscar.addEventListener('click', aplicarFiltros);
        elementos.btnRefresh.addEventListener('click', () => {
            limpiarFiltros();
            cargarRegistros();
        });
        elementos.btnExportarExcel.addEventListener('click', exportarAExcel);
        
        // Filtros (búsqueda en tiempo real)
        elementos.filtroLote.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') aplicarFiltros();
        });
        
        // Modal de exportar
        elementos.btnConfirmarExportar.addEventListener('click', confirmarExportacion);
        
        // Cuando se selecciona un producto, cargar su temperatura por defecto
        elementos.selectProducto.addEventListener('change', async function() {
            const productoId = this.value;
            if (productoId) {
                const producto = productos.find(p => p.idProducto == productoId);
                if (producto && producto.temperatura) {
                    // Establecer la temperatura del producto como seleccionada
                    elementos.selectTemperatura.value = producto.temperatura.idTemperaturaProducto;
                }
            }
        });
    }
    
    // Manejar envío del formulario
    async function manejarSubmitForm(e) {
        e.preventDefault();
        
        if (!validarFormulario()) return;
        
        const formData = {
            idProveedor: parseInt(elementos.selectProveedor.value),
            idProducto: parseInt(elementos.selectProducto.value),
            cantidad: parseInt(document.getElementById('cantidad').value),
            lote: document.getElementById('lote').value || null,
            fechaIngreso: document.getElementById('fecha-ingreso').value,
            fechaCaducidad: document.getElementById('fecha-caducidad').value || null,
            idTemperaturaProducto: elementos.selectTemperatura.value 
                ? parseInt(elementos.selectTemperatura.value) 
                : null,
            comentarios: document.getElementById('comentarios').value || null
        };
        
        try {
            let response;
            let mensaje;
            
            if (modoEdicion && registroActual) {
                // Actualizar
                response = await fetch(`${API_STOCK}/${registroActual.idStockRegistro}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                mensaje = 'Registro actualizado correctamente';
            } else {
                // Crear nuevo
                response = await fetch(API_STOCK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                mensaje = 'Registro creado correctamente';
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error en la operación');
            }
            
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: mensaje,
                timer: 2000,
                showConfirmButton: false
            });
            
            ocultarFormulario();
            cargarRegistros();
            
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al guardar el registro'
            });
        }
    }
    
    // Validar formulario
    function validarFormulario() {
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const fechaIngreso = new Date(document.getElementById('fecha-ingreso').value);
        const fechaCaducidad = document.getElementById('fecha-caducidad').value 
            ? new Date(document.getElementById('fecha-caducidad').value)
            : null;
        const hoy = new Date();
        
        // Validar cantidad
        if (cantidad <= 0) {
            Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
            return false;
        }
        
        // Validar fecha de ingreso (no puede ser futura)
        if (fechaIngreso > hoy) {
            Swal.fire('Error', 'La fecha de ingreso no puede ser futura', 'error');
            return false;
        }
        
        // Validar fecha de caducidad (si existe)
        if (fechaCaducidad && fechaCaducidad < hoy) {
            Swal.fire('Advertencia', 'La fecha de caducidad ya pasó. ¿Desea continuar?', 'warning')
                .then(result => {
                    if (!result.isConfirmed) return false;
                });
        }
        
        return true;
    }
    
    // Mostrar formulario para nuevo registro
    function mostrarFormularioNuevo() {
        modoEdicion = false;
        registroActual = null;
        
        // Resetear formulario
        elementos.formStock.reset();
        document.getElementById('stock-id').value = '';
        
        // Establecer valores por defecto
        const hoy = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-ingreso').value = hoy;
        
        // Actualizar UI
        elementos.formTitulo.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Registro de Stock';
        elementos.btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i>Guardar Registro';
        elementos.formContainer.style.display = 'block';
        
        // Scroll al formulario
        elementos.formContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Editar registro existente
    async function editarRegistro(id) {
        try {
            const response = await fetch(`${API_STOCK}/${id}`);
            if (!response.ok) throw new Error('Error al cargar registro');
            
            registroActual = await response.json();
            modoEdicion = true;
            
            // Llenar formulario con datos
            document.getElementById('stock-id').value = registroActual.idStockRegistro;
            elementos.selectProveedor.value = registroActual.idProveedor;
            elementos.selectProducto.value = registroActual.idProducto;
            document.getElementById('cantidad').value = registroActual.cantidad;
            document.getElementById('lote').value = registroActual.lote || '';
            document.getElementById('fecha-ingreso').value = registroActual.fechaIngreso;
            document.getElementById('fecha-caducidad').value = registroActual.fechaCaducidad || '';
            elementos.selectTemperatura.value = registroActual.idTemperaturaProducto || '';
            document.getElementById('comentarios').value = registroActual.comentarios || '';
            
            // Actualizar UI
            elementos.formTitulo.innerHTML = `
                <i class="bi bi-pencil me-2"></i>Editar Registro #${registroActual.idStockRegistro}
            `;
            elementos.btnGuardar.innerHTML = '<i class="bi bi-save me-1"></i>Actualizar Registro';
            elementos.formContainer.style.display = 'block';
            
            // Scroll al formulario
            elementos.formContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            mostrarError('Error al cargar registro para edición', error);
        }
    }
    
    // Ver detalles del registro
    async function verDetalles(id) {
        try {
            const response = await fetch(`${API_STOCK}/${id}`);
            if (!response.ok) throw new Error('Error al cargar detalles');
            
            const registro = await response.json();
            
            // Formatear fechas
            const fechaIngreso = new Date(registro.fechaIngreso).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const fechaCaducidad = registro.fechaCaducidad 
                ? new Date(registro.fechaCaducidad).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
                : 'No aplica';
            
            // Determinar color del estado
            let estadoColor = '';
            let estadoIcon = '';
            
            switch(registro.estado) {
                case 'POR_EXPORTAR':
                    estadoColor = 'warning';
                    estadoIcon = 'bi-clock';
                    break;
                case 'EXPORTADO_PARCIAL':
                    estadoColor = 'info';
                    estadoIcon = 'bi-arrow-up-right';
                    break;
                case 'EXPORTADO_COMPLETO':
                    estadoColor = 'success';
                    estadoIcon = 'bi-check-circle';
                    break;
            }
            
            // Crear contenido del modal
            elementos.detallesContenido.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header bg-primary text-white">
                                <h6 class="mb-0"><i class="bi bi-box-seam me-2"></i>Información del Producto</h6>
                            </div>
                            <div class="card-body">
                                <p><strong>Producto:</strong> ${registro.nombreProducto}</p>
                                <p><strong>Proveedor:</strong> ${registro.nombreProveedor}</p>
                                <p><strong>Temperatura:</strong> ${registro.temperaturaNombre || 'No especificada'}</p>
                                <p><strong>Lote:</strong> ${registro.lote || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header bg-success text-white">
                                <h6 class="mb-0"><i class="bi bi-clipboard-data me-2"></i>Información de Stock</h6>
                            </div>
                            <div class="card-body">
                                <p><strong>Cantidad Total:</strong> ${registro.cantidad} unidades</p>
                                <p><strong>Disponible:</strong> ${registro.cantidadDisponible} unidades</p>
                                <p><strong>Exportado:</strong> ${registro.cantidadExportada} unidades</p>
                                <p>
                                    <strong>Estado:</strong> 
                                    <span class="badge bg-${estadoColor}">
                                        <i class="bi ${estadoIcon} me-1"></i>${registro.estado}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header bg-info text-white">
                                <h6 class="mb-0"><i class="bi bi-calendar me-2"></i>Fechas</h6>
                            </div>
                            <div class="card-body">
                                <p><strong>Fecha de Ingreso:</strong> ${fechaIngreso}</p>
                                <p><strong>Fecha de Caducidad:</strong> ${fechaCaducidad}</p>
                                <p><strong>Fecha de Registro:</strong> ${registro.fechaRegistro}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card mb-3">
                            <div class="card-header bg-secondary text-white">
                                <h6 class="mb-0"><i class="bi bi-chat-text me-2"></i>Observaciones</h6>
                            </div>
                            <div class="card-body">
                                <p>${registro.comentarios || '<span class="text-muted">Sin observaciones</span>'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-light border mt-3">
                    <small class="text-muted">
                        <i class="bi bi-info-circle me-1"></i>
                        ID del registro: ${registro.idStockRegistro}
                    </small>
                </div>
            `;
            
            elementos.modalDetalles.show();
            
        } catch (error) {
            mostrarError('Error al cargar detalles', error);
        }
    }
    
    // Abrir modal para exportar stock
    function abrirModalExportar(id, disponible) {
        elementos.exportarStockId.value = id;
        elementos.exportarCantidad.value = '';
        elementos.exportarCantidad.max = disponible;
        elementos.cantidadDisponible.textContent = disponible;
        elementos.exportarMotivo.value = '';
        elementos.modalExportar.show();
    }
    
    // Confirmar exportación de stock
    async function confirmarExportacion() {
        const id = elementos.exportarStockId.value;
        const cantidad = parseInt(elementos.exportarCantidad.value);
        const motivo = elementos.exportarMotivo.value;
        
        if (!cantidad || cantidad <= 0) {
            Swal.fire('Error', 'Ingrese una cantidad válida', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_STOCK}/exportar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idStockRegistro: parseInt(id),
                    cantidadExportar: cantidad,
                    motivo: motivo || null
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al exportar');
            }
            
            await Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: `Se exportaron ${cantidad} unidades correctamente`,
                timer: 2000,
                showConfirmButton: false
            });
            
            elementos.modalExportar.hide();
            cargarRegistros();
            
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
    
    // Eliminar registro (eliminación lógica)
    async function eliminarRegistro(id) {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!result.isConfirmed) return;
        
        try {
            const response = await fetch(`${API_STOCK}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Error al eliminar');
            
            await Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'Registro eliminado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            
            cargarRegistros();
            
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
        }
    }
    
    // Aplicar filtros de búsqueda
    function aplicarFiltros() {
        filtrosActivos = {
            proveedor: elementos.filtroProveedor.value || null,
            producto: elementos.filtroProducto.value || null,
            estado: elementos.filtroEstado.value || null,
            lote: elementos.filtroLote.value || null
        };
        
        paginaActual = 1;
        cargarRegistros();
    }
    
    // Limpiar filtros
    function limpiarFiltros() {
        elementos.filtroProveedor.value = '';
        elementos.filtroProducto.value = '';
        elementos.filtroEstado.value = '';
        elementos.filtroLote.value = '';
        filtrosActivos = {};
    }
    
    // Cancelar edición
    function cancelarEdicion() {
        if (modoEdicion) {
            Swal.fire({
                title: '¿Cancelar edición?',
                text: 'Los cambios no guardados se perderán',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, continuar'
            }).then(result => {
                if (result.isConfirmed) {
                    ocultarFormulario();
                }
            });
        } else {
            ocultarFormulario();
        }
    }
    
    // Ocultar formulario
    function ocultarFormulario() {
        elementos.formContainer.style.display = 'none';
        elementos.formStock.reset();
        modoEdicion = false;
        registroActual = null;
    }
    
    // Exportar a Excel
    async function exportarAExcel() {
        try {
            const response = await fetch(`${API_STOCK}/exportar-excel`);
            if (!response.ok) throw new Error('Error al exportar');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stock_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            await Swal.fire({
                icon: 'success',
                title: 'Exportación completada',
                text: 'El archivo se ha descargado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (error) {
            Swal.fire('Error', 'No se pudo exportar a Excel', 'error');
        }
    }
    
    // Cambiar página
    function cambiarPagina(pagina) {
        if (pagina < 1 || pagina > totalPaginas) return;
        paginaActual = pagina;
        mostrarRegistros();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Mostrar error
    function mostrarError(titulo, error) {
        console.error(titulo, error);
        Swal.fire({
            icon: 'error',
            title: titulo,
            text: error.message || 'Error desconocido',
            timer: 3000
        });
    }
    
    // Hacer funciones globales
    window.verDetalles = verDetalles;
    window.editarRegistro = editarRegistro;
    window.abrirModalExportar = abrirModalExportar;
    window.eliminarRegistro = eliminarRegistro;
    window.cambiarPagina = cambiarPagina;
    
    // Inicializar
    inicializar();
});
