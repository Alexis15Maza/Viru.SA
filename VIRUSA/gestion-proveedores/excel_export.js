const ExcelJS = require('exceljs');

router.get('/exportar-excel', async (req, res) => {
  const proveedores = [
    { id: 1, nombre: 'Proveedor A', empresa: 'Empresa A', direccion: 'Dirección A', estado: 'activo' },
    { id: 2, nombre: 'Proveedor B', empresa: 'Empresa B', direccion: 'Dirección B', estado: 'inactivo' }
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Proveedores');

  worksheet.columns = [
    { header: 'ID', key: 'id' },
    { header: 'Nombre', key: 'nombre' },
    { header: 'Empresa', key: 'empresa' },
    { header: 'Dirección', key: 'direccion' },
    { header: 'Estado', key: 'estado' }
  ];

  proveedores.forEach(proveedor => {
    worksheet.addRow(proveedor);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=proveedores.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

