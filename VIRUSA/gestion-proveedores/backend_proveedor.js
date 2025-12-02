
router.get('/proveedores', (req, res) => {
  
  const proveedores = [
    { id: 1, nombre: 'Proveedor A', empresa: 'Empresa A', direccion: 'Dirección A', estado: 'activo' },
    { id: 2, nombre: 'Proveedor B', empresa: 'Empresa B', direccion: 'Dirección B', estado: 'inactivo' }
  ];

  res.json(proveedores);
});

