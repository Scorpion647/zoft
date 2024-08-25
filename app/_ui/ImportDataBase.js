'use client'
import ExcelJS from 'exceljs';
import { useState, useCallback, useEffect } from "react";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { Box, Input, Flex, HStack, Button, Icon, Select, useToast, Switch, VStack, Text, Alert, Progress, Spinner } from '@chakra-ui/react';
import { FaCloudArrowUp } from "react-icons/fa6";
import { insertMaterial, insertSupplier, insertRecord, getMaterial, getRecords, getMaterials, getSuppliers, getSupplier, generateUniqueId, checkSupplierIdExists, updateMaterial } from '@/app/_lib/database/service'; 


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

  const [data1, setData1] = useState(Array(40).fill().map(() => Array(4).fill('')));
  const [isLoading, setisloading] = useState(false);
  const [data, setData] = useState(initialData.records);
  const [excelData, setExcelData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState(headers.records);
  const [selectedTable, setSelectedTable] = useState('records');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workbook, setWorkbook] = useState(null);  
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
  
        setExcelData(rows);  
        setData(rows);  
        setShowDatabaseData(false);
      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    }
  };




  const validateAndInsertData = async () => {
    setIsProcessing(true);
  
    let existingRecords = [];
    let existingMaterials = [];
    let existingSuppliers = [];
  
    try {
      if (selectedTable === 'records') {
        existingRecords = await getRecords(1, 1000);
      } else if (selectedTable === 'materials') {
        existingMaterials = await getMaterials(1, 40000);
      } else if (selectedTable === 'suppliers') {
        existingSuppliers = await getSuppliers(1, 100);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  
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
  
        const existingRecord = existingRecords.find(record => record.purchase_order === purchase_order && record.position === position && record.material_code === material_code);
        let materialExists = false;
        let supplierExists = false;
        let supplierId = 0;
  
  
        if (!materialExists) {
          invalidMaterialEntries.push(i + 1);
        }
        if (!supplierExists) {

              const domainExists = await getSupplier("","",supplier_name);
              if (domainExists.name === supplier_name) {
              supplierExists = true;

              } else {
                const newSupplier = await insertSupplier({ name: supplier_name });
                  supplierExists = true;


          }
          const verifi = await getSupplier("","",supplier_name);
                console.log(verifi.id)
                  supplierId = verifi.id; 
        }
  
        if (supplierExists) {
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

            try {
              const result = await insertRecord(args);
              console.log('Record inserted successfully:', result);
            } catch (error) {
              console.error('Error processing data:', error.message);
            
              if (error.details) {
                console.error('Error details:', error.details);
              }
            
              console.error('Error stack trace:', error.stack);
            }
          
        }
      } else if (selectedTable === 'materials') {
        const [code, subheading, type, measurement_unit] = row;
  
        const existingMaterial = existingMaterials.find(material => material.code === code);
        const args = { code, subheading };
        if(type === "national" || type === "foreign"){
          args.type = type
        }else if(type === "NACIONAL" || type === "NACIONALIZADO"){
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
          console.log('Updating supplier:', args);
        } else {
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
    setisloading(true)
    try {
      if (selectedTable === 'records') {
        const records = await getRecords(1, 1000);
        
        if (records) {
          const supplierIds = [...new Set(records.map(record => record.supplier_id))];
  
          const suppliers = await Promise.all(supplierIds.map(id => getSupplier(id)));
  
          const supplierMap = suppliers.reduce((acc, supplier) => {
            acc[supplier.id] = supplier.name;
            return acc;
          }, {});
  
          const formattedRecords = records.map(record => [
            
            record.purchase_order,
            record.item,
            record.material_code,
            record.description,
            record.quantity,
            record.measurement_unit,
            record.unit_price,
            record.net_price,
            supplierMap[record.supplier_id] || '', 
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
    } finally {
      setisloading(false)
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
      setData(excelData);  
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
      <Box width="100%" height="400" >
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="400">
          <Spinner size="xl" />
          <Text ml={4}>Obteniendo Base de datos...</Text>
          </Box>  
        )}
        {!isLoading && (
          <HotTable
          data={data}
          className="relative z-0"
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
        )}
      </Box>
    </>
  );
};

