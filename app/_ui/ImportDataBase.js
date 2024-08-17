'use client'
import ExcelJS from 'exceljs';
import { useState, useCallback, useEffect } from "react";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { Box, Input, Flex, HStack, Button, Icon, Select, useToast, Switch, VStack, Text, Alert, Progress } from '@chakra-ui/react';
import { FaCloudArrowUp } from "react-icons/fa6";
import { insertMaterial, insertSupplier, insertRecord, getMaterial, getRecords, getMaterials, getSuppliers, getSupplier, generateUniqueId, checkSupplierIdExists, updateMaterial } from '@/app/_lib/database/service'; 
import { Search } from 'handsontable/plugins';
import { Domain } from 'domain';

const initialData = {
  materials: Array(20).fill().map(() => ['', '', '', '']),
  suppliers: Array(20).fill().map(() => ['', '', '']),
  records: Array(20).fill().map(() => ['', '', '', '', '', '', '', '', '', '']),
};

const headers = {
  materials: ["Material Code", "Subheading", "Type", "Measurement Unit"],
  suppliers: ["Domain", "Name"],
  records: ["Orden de Compra", "Posición", "Material", "Texto breve", "Cantidad de pedido", "Unidad medida pedido", "Precio neto", "Valor neto de pedido", "Proveedor", "Moneda"],
};

export const ImportDataBase = () => {
;
  const [data1, setData1] = useState(Array(40).fill().map(() => Array(4).fill('')));
  const [data, setData] = useState(initialData.records);
  const [excelData, setExcelData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState(headers.records);
  const [selectedTable, setSelectedTable] = useState('records');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workbook, setWorkbook] = useState(null);  // Removed TypeScript type annotation
  const [showDatabaseData, setShowDatabaseData] = useState(true);
  const toast = useToast();
  const [Buttons, setButtons] = useState(true);

  const handleTableChange = useCallback((event) => {
    const table = event.target.value;
    setSelectedTable(table);
    setData(initialData[table]);
    setTableHeaders(headers[table]);

    setWorkbook(null);
    setData(initialData[table]);
    setShowDatabaseData(true); 
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);
        setWorkbook(workbook);
  
        const worksheet = workbook.worksheets[0];
        const columnIndexes = {};
  
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          if (headers[selectedTable].includes(cell.value)) {
            columnIndexes[cell.value] = colNumber;
          }
        });
  
        const rows = [];
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData = headers[selectedTable].map(header => row.getCell(columnIndexes[header])?.value || '');
            rows.push(rowData);
          }
        });
  
        setExcelData(rows);  // Guarda los datos en el estado excelData
        setData(rows);  // También actualiza el estado data para la vista previa
        setShowDatabaseData(false);
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    }
  };




  const validateAndInsertData = async () => {
    setIsProcessing(true);
  
    // Cargar los datos existentes de la base de datos para comparación
    let existingRecords = [];
    let existingMaterials = [];
    let existingSuppliers = [];
  
    try {
      if (selectedTable === 'records') {
        existingRecords = await getRecords(1, 1000);
      } else if (selectedTable === 'materials') {
        existingMaterials = await getMaterials(1, 4000);
      } else if (selectedTable === 'suppliers') {
        existingSuppliers = await getSuppliers(1, 100);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  
    // Procesar los datos del archivo Excel
    const invalidMaterialEntries = [];
    const invalidSupplierEntries = [];
  
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
  
      if (selectedTable === 'records') {
        const [
          purchase_order,
          position,
          material_code,
          description,
          quantity,
          measurement_unit,
          unit_price,
          net_price,
          supplier_name,
          currency
        ] = row;
  
        // Verificar si el registro ya existe
        const existingRecord = existingRecords.find(record => record.purchase_order === purchase_order && record.position === position && record.material_code === material_code);
        let materialExists = false;
        let supplierExists = false;
        let supplierId = 0;
  
        // Verificar si el material y proveedor existen
        try {
          const material = await getMaterial({ material_code });
          materialExists = !!material;
  
          const suppliers = await getSuppliers(1, 100);
          if (suppliers && Array.isArray(suppliers)) {
            const supplier = suppliers.find(supplier => supplier.name === supplier_name);
            if (supplier) {
              supplierExists = true;
              supplierId = supplier.id;
            }
          }
        } catch (error) {
          console.error('Error validating data:', error);
        }
  
        if (!materialExists) {
          invalidMaterialEntries.push(i + 1);
        }
        if (!supplierExists) {
          const userResponse = window.confirm(`El proveedor ${supplier_name} no existe. ¿Deseas crear uno nuevo?`);
          if (userResponse) {
            const domain = prompt(`Introduce el dominio para el proveedor ${supplier_name}:`);
            if (domain) {
              // Aquí puedes implementar la función para verificar si el dominio ya existe
              const domainExists = await getSupplier("", domain);
              if (domainExists.domain !== undefined) {
                alert(`El dominio ${domain} ya está en uso. Introduce un dominio diferente.`);
                i--; // Vuelve a intentar la inserción de este registro
                continue;
              } else {
                const newSupplier = await insertSupplier({ domain: domain, name: supplier_name });
                if (newSupplier) {
                  supplierExists = true;
                  supplierId = newSupplier.id;
                } else {
                  alert('Error al crear el nuevo proveedor.');
                  i--; // Vuelve a intentar la inserción de este registro
                  continue;
                }
              }
            } else {
              alert('El dominio es obligatorio para crear un proveedor.');
              i--; // Vuelve a intentar la inserción de este registro
              continue;
            }
          } else {
            invalidSupplierEntries.push(i + 1);
            continue; // Pasa al siguiente registro sin intentar la inserción
          }
        }
  
        if (materialExists && supplierExists) {
          const args = {
            item: position,
            quantity: Number(quantity),
            material_code,
            purchase_order,
            measurement_unit,
            unit_price: parseFloat(parseFloat(unit_price).toFixed(2) * 100).toFixed(0),
            currency: currency,
            created_at: new Date().toISOString(),
            supplier_id: supplierId,
            description: description,
            net_price: parseFloat(net_price * 100).toFixed(0),
          };

            // Insertar nuevo registro
            try {
              const result = await insertRecord(args);
              console.log('Record inserted successfully:', result);
            } catch (error) {
              // Asegúrate de mostrar el mensaje del error
              console.error('Error processing data:', error.message);
            
              // Muestra detalles del error si están disponibles
              if (error.details) {
                console.error('Error details:', error.details);
              }
            
              // Muestra el stack trace del error para depuración adicional
              console.error('Error stack trace:', error.stack);
            }
          
        }
      } else if (selectedTable === 'materials') {
        const [code, subheading, type, measurement_unit] = row;
  
        const existingMaterial = existingMaterials.find(material => material.code === code);
        const args = { code, subheading };
        if(type === "national" || type === "foreign"){
          args.type = type
        }else if(type === "NACIONAL"){
          args.type = "national"
        }else if(type === "EXTRANJERO"){
          args.type = "foreign"
        }
        if (measurement_unit !== "" ) args.measurement_unit = measurement_unit;
        const revisar = await getMaterial(code)
        if (revisar.code == code) {
          const safeTrim = (value) => typeof value === 'string' ? value.trim() : '';

          const revisarCode = safeTrim(revisar.code);
          const revisarSubheading = safeTrim(revisar.subheading);
          const revisarType = safeTrim(revisar.type);
          const revisarMeasurementUnit = safeTrim(revisar.measurement_unit);
          
          const codeTrimmed = safeTrim(code);
          const subheadingTrimmed = safeTrim(subheading);
          const typeTrimmed = safeTrim(type);
          const measurementUnitTrimmed = safeTrim(measurement_unit);
          
          
          if(revisarType !== typeTrimmed || revisarMeasurementUnit !== measurementUnitTrimmed){
            try {
              const update = await updateMaterial(code, args);
              if (update instanceof Error) {
                console.error('Error updating material:', update);
              } else {
                console.log('Material updated successfully:', update);
              }
            } catch (error) {
              console.error('Error updating material:', error);
            }
          }else{
            console.log("todo esta bien por aqui")
          }
        } else {
          // Insertar nuevo material
          
          try {
            const result = await insertMaterial(args);
            if (result instanceof Error) {
              console.error('Error inserting material:', result);
            } else {
              console.log('Material inserted successfully:', result);
            }
          } catch (error) {
            console.error('Error inserting material:', error);
          }
        }
      } else if (selectedTable === 'suppliers') {
        const [domain, name] = row;
        const existingSupplier = existingSuppliers.find(supplier => supplier.domain === domain);
  
        const args = { domain, name };
  
        if (existingSupplier) {
          // Aquí puedes implementar la lógica para actualizar el proveedor existente si es necesario
          console.log('Updating supplier:', args);
        } else {
          // Insertar nuevo proveedor
          try {
            const result = await insertSupplier(args);
            if (result instanceof Error) {
              console.error('Error inserting supplier:', result);
            } else {
              console.log('Supplier inserted successfully:', result);
            }
          } catch (error) {
            console.error('Error inserting supplier:', error);
          }
        }
      }
    }
  
    if (invalidMaterialEntries.length > 0 || invalidSupplierEntries.length > 0) {
      const groupConsecutiveNumbers = (arr) => {
        const grouped = [];
        let temp = [arr[0]];
  
        for (let i = 1; i < arr.length; i++) {
          if (arr[i] === arr[i - 1] + 1) {
            temp.push(arr[i]);
          } else {
            grouped.push(temp);
            temp = [arr[i]];
          }
        }
        grouped.push(temp);
  
        return grouped.map(group => (group.length > 1 ? `${group[0]}-${group[group.length - 1]}` : `${group[0]}`));
      };
  
      const materialErrors = invalidMaterialEntries.length > 0 ? `Material code not found at rows ${groupConsecutiveNumbers(invalidMaterialEntries).join(', ')}` : '';
      const supplierErrors = invalidSupplierEntries.length > 0 ? `Supplier not found at rows ${groupConsecutiveNumbers(invalidSupplierEntries).join(', ')}` : '';
      const errorMessage = [materialErrors, supplierErrors].filter(msg => msg).join('\n');
  
      toast({
        title: 'Validation Errors',
        description: errorMessage,
        status: 'error',
        position: 'top',
        isClosable: true,
        duration: 10000,
      });
    }
  
    setIsProcessing(false);
    setProgress(100);
  };

const getsuplier = async (record) => {
  const supplier = await getSupplier(record)
  const hola = null;
  setData(supplier.map(supplier => [
    {hola: supplier.supplier_id}
  ]));

  const [data1, setData1] = useState(Array(30).fill().map(() => Array(4).fill('')));
  return hola;

}



  const fetchData = async () => {
    try {
      if (selectedTable === 'records') {
        const records = await getRecords(1, 1000);
        
        if (records) {
          // Obtén los IDs de proveedores únicos de los registros
          const supplierIds = [...new Set(records.map(record => record.supplier_id))];
  
          // Recupera los nombres de los proveedores en paralelo
          const suppliers = await Promise.all(supplierIds.map(id => getSupplier(id)));
  
          // Crea un mapa para acceder fácilmente a los nombres de proveedores por su ID
          const supplierMap = suppliers.reduce((acc, supplier) => {
            acc[supplier.id] = supplier.name;
            return acc;
          }, {});
  
          // Mapea los registros para incluir el nombre del proveedor
          const formattedRecords = records.map(record => [
            record.purchase_order,
            record.item,
            record.material_code,
            record.description,
            record.quantity,
            record.measurement_unit,
            record.unit_price,
            record.net_price,
            supplierMap[record.supplier_id] || '', // Usa el nombre del proveedor o una cadena vacía si no se encuentra
            record.currency
          ]);
  
          setData(formattedRecords);
        }
      } else if (selectedTable === 'materials') {
        const materials = await getMaterials(1,4000);
        
        if (materials) {
          setData(materials.map(material => [
            material.code,
            material.subheading,
            material.type,
            material.measurement_unit
          ]));
        }
      } else if (selectedTable === 'suppliers') {
        const suppliers = await getSuppliers(1, 100, "");
        if (suppliers) {
          setData(suppliers.map(suppliers => [
            suppliers.domain,
            suppliers.name
          ]));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  useEffect(() => {
    fetchData();
  }, [selectedTable]);

  const handleSwitchChange = (event) => {
    const checked = event.target.checked;
    setShowDatabaseData(!checked);
    if (!checked && workbook) {
      fetchData(); 
    } else if (checked) {
      setData(excelData);  // Usa los datos del archivo Excel almacenado
    }
  };
  
  return (
    <>
      <Box >
        <HStack whiteSpace="100%"  >
          <Select width="20%" onChange={handleTableChange} defaultValue="records">
            <option onClick={() => setButtons(true)} value="records">Records</option>
            <option onClick={() => setButtons(false)}  value="materials">Materials</option>
            <option  onClick={() => setButtons(false)} value="suppliers">Suppliers</option>
          </Select>
          <VStack width="10%"></VStack>
          {Buttons && <Input width="30%" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />}
          <Button

            colorScheme='teal' 
            backgroundColor='#F1D803'
            onClick={validateAndInsertData}
            isLoading={isProcessing}
          >
            <Icon as={FaCloudArrowUp} w={5} h={5} color="black" />
          </Button>
          <VStack width="35%"></VStack>
          {Buttons && <Text>Preview</Text>}
          <Switch
            isChecked={!showDatabaseData}
            onChange={handleSwitchChange}
            isDisabled={!workbook} 
          >
          </Switch>
        </HStack>
        {isProcessing && <Progress  colorScheme="teal" value={progress} />}
      </Box>
      <Box width="100%" height="400" overflow="auto">
        <HotTable
          data={data}
          colHeaders={tableHeaders}
          rowHeaders={true}
          width="100%"
          height="400"
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
          contextMenu={{
            items: {
              'row_above': { name: 'Insert row above' },
              'row_below': { name: 'Insert row below' },
              'remove_row': { name: 'Remove row' },
              'undo': { name: 'Undo' },
              'redo': { name: 'Redo' },
              'separator': Handsontable.plugins.ContextMenu.SEPARATOR,
              'clear_custom': {
                name: 'Clear all cells',
                callback: function () {
                  this.clear();
                }
              }
            }
          }}
          columns={
            selectedTable === 'materials'
              ? [
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'dropdown', source: ['national', 'foreign'] }, 
                  { type: 'text' } 
                ]
              : selectedTable === 'suppliers'
              ? [
                  { type: 'text' },
                  { type: 'text' } 
                ]
              : selectedTable === 'records'
              ? [
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'text' },
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'text' } 
                ]
              : undefined
          }
        />
      </Box>
    </>
  );
};

