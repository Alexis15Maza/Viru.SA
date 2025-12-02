const express = require('express');
const router = express.Router();


let proveedores = [];


router.post('/registrar-proveedor', (req, res) => {
  const { nombreProveedor, empresa, direccion, estado } = req.body;


  const nuevoProveedor = { id: proveedores.length + 1, nombreProveedor, empresa, direccion, estado };
  proveedores.push(nuevoProveedor);

  res.status(200).json({ mensaje: 'Proveedor registrado exitosamente', proveedor: nuevoProveedor });
});


router.get('/proveedores', (req, res) => {
  res.json(proveedores);
});


router.put('/editar-proveedor/:id', (req, res) => {
  const { id } = req.params;
  const { nombreProveedor, empresa, direccion, estado } = req.body;

  const proveedor = proveedores.find(p => p.id == id);
  if (proveedor) {
    proveedor.nombreProveedor = nombreProveedor;
    proveedor.empresa = empresa;
    proveedor.direccion = direccion;
    proveedor.estado = estado;

    res.status(200).json({ mensaje: 'Proveedor actualizado exitosamente', proveedor });
  } else {
    res.status(404).json({ mensaje: 'Proveedor no encontrado' });
  }
});


router.delete('/eliminar-proveedor/:id', (req, res) => {
  const { id } = req.params;
  const proveedor = proveedores.find(p => p.id == id);
  if (proveedor) {
    proveedor.estado = 'inactivo';  // Eliminación lógica
    res.status(200).json({ mensaje: 'Proveedor eliminado (inactivo) exitosamente', proveedor });
  } else {
    res.status(404).json({ mensaje: 'Proveedor no encontrado' });
  }
});

module.exports = router;

