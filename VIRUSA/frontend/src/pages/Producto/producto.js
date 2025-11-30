//
// Archivo: script.js
// Contiene la lógica de JavaScript para la vista CRUD de Productos.
//
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const formTitle = document.getElementById('form-title');
    const productForm = document.getElementById('product-form');
    const btnSubmitForm = document.getElementById('btn-submit-form');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Función para resetear el formulario y volver al modo "Agregar"
    function resetForm() {
        productForm.reset(); 
        formTitle.textContent = '➕ Agregar Producto';
        btnSubmitForm.textContent = 'Crear Producto';
        btnSubmitForm.classList.remove('btn-warning');
        btnSubmitForm.classList.add('btn-primary');
        // Ocultar campo de Estado al volver al modo Agregar
        document.getElementById('estado-group').style.display = 'none';
        btnCancelar.textContent = 'Limpiar Formulario';
        // Asegurar que el desplegable de temperatura vuelva al valor por defecto
        document.getElementById('temperatura').value = ""; 
    }

    // Función para cargar los datos en el formulario y cambiar a modo "Editar"
    function loadProductForEdit() {
        // **Aquí iría la llamada a Java/backend para obtener los datos del producto**
        
        formTitle.textContent = '✏️ Editar Producto Existente';
        btnSubmitForm.textContent = 'Guardar Cambios';
        btnSubmitForm.classList.remove('btn-primary');
        btnSubmitForm.classList.add('btn-warning'); // Usar color de advertencia para edición
        
        // Mostrar campo de Estado y simular carga de datos
        document.getElementById('estado-group').style.display = 'block';
        document.getElementById('nombreProducto').value = 'Café Grano Arabica (Editando)';
        document.getElementById('temperatura').value = 'Ambiente'; // Cargar la opción seleccionada
        document.getElementById('descripcion').value = 'Simulación de carga de datos para editar.';
        document.getElementById('estado').value = 'Activo';
        
        btnCancelar.textContent = 'Cancelar Edición';
        
        // Desplazar a la parte superior para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 1. Manejar el click de "Cancelar/Limpiar"
    btnCancelar.addEventListener('click', resetForm);

    // 2. Manejar el click de "Editar"
    document.querySelectorAll('.btn-editar').forEach(button => {
        button.addEventListener('click', loadProductForEdit);
    });

    // 3. Manejar el click de "Eliminar/Restaurar" (Eliminación Lógica)
    document.querySelectorAll('.btn-cambiar-estado').forEach(button => {
        button.addEventListener('click', function() {
            const productoNombre = this.closest('tr').querySelector('td:nth-child(2)').textContent;
            const nuevoEstado = this.getAttribute('data-nuevo-estado'); // Lee el nuevo estado (Activo o Inactivo)
            
            let mensaje;
            if (nuevoEstado === 'Inactivo') {
                mensaje = `¿Está seguro de INACTIVAR (Eliminación Lógica) el producto "${productoNombre}"?`;
            } else {
                mensaje = `¿Está seguro de RESTAURAR (Activar) el producto "${productoNombre}"?`;
            }
            
            const confirmacion = confirm(mensaje);
            
            if (confirmacion) {
                // **Aquí iría la llamada a Java/backend para actualizar el estado:**
                alert(`Producto "${productoNombre}" actualizado a estado: ${nuevoEstado}.`);
                // En una aplicación real, recargarías la tabla aquí.
            }
        });
    });

    // 4. Manejar el click de "Exportar a Excel" (simulación)
    document.getElementById('btn-exportar').addEventListener('click', function() {
        alert('Iniciando exportación de la tabla de productos a Excel...');
    });

    // 5. Manejar el envío del Formulario (Crear o Actualizar)
    productForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        
        const nombre = document.getElementById('nombreProducto').value;
        const temperatura = document.getElementById('temperatura').value;
        const accion = formTitle.textContent.includes('Agregar') ? 'Creado' : 'Actualizado';
        
        // Validar que se haya seleccionado una temperatura
        if (temperatura === "") {
            alert("Debe seleccionar la temperatura del producto.");
            return;
        }

        // **Aquí iría la llamada a Java/backend para registrar o actualizar**
        
        alert(`Producto: "${nombre}" - ${accion} con éxito. Temperatura: ${temperatura}`);
        
        resetForm(); // Limpiar el formulario después de la acción
    });
});