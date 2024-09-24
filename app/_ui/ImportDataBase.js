'use client'
import ExcelJS from 'exceljs';
import { useState, useCallback, useEffect } from "react";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { GridItem,Grid,Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,Tooltip,Box, Input, Flex, HStack, Button, Icon, Select, useToast, Switch, VStack, Text, Alert, Progress, Spinner } from '@chakra-ui/react';
import { FaCloudArrowUp } from "react-icons/fa6";
import {  insertSupplier, insertRecord, getMaterial, getRecords, getMaterials, getSuppliers, getSupplier, generateUniqueId, checkSupplierIdExists, updateMaterial, getRecord, updateRecord } from '@/app/_lib/database/service'; 
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { insertMaterial } from '../_lib/database/materials';


const initialData = {
  Materiales: Array(20).fill().map(() => ['', '', '', '']),
  Proveedores: Array(20).fill().map(() => ['', '', '']),
  Registros: Array(20).fill().map(() => ['', '', '', '', '', '', '', '', '', '']),
};

const headers = {
  Materiales: ["Codigo de Material", "Subpartida", "Tipo de Material", "Unidad de Medidad"],
  Proveedores: ["Dominio", "Nombre"],
  Registros: ["Documento compras", "Posición", "Material", "Texto breve", "Cantidad de pedido", "Unidad medida pedido", "Precio neto", "Valor neto de pedido", "Nombre del proveedor", "Moneda"],
};

export const ImportDataBase = () => {

  const [data1, setData1] = useState(Array(40).fill().map(() => Array(4).fill('')));
  const [isLoading, setisloading] = useState(false);
  const [data, setData] = useState(initialData.records);
  const [excelData, setExcelData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState(headers.Registros);
  const [selectedTable, setSelectedTable] = useState('Registros');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workbook, setWorkbook] = useState(null);  
  const [showDatabaseData, setShowDatabaseData] = useState(true);
  const toast = useToast();
  const [Buttons, setButtons] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false); 
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({}); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateFields = () => {
    let requiredFields = [];


    if (selectedTable === "Registros") {
      requiredFields = [
        "input1", "input2", "input3", "input4", "input5", "input6", "input7", "input8", "select1"
      ];
    } else if (selectedTable === "Materiales") {
      requiredFields = ["input1", "input2", "select2", "input3"];
    } else if (selectedTable === "Proveedores") {
      requiredFields = ["inputObligatorio"];
    }


    return requiredFields.every(field => formData[field] && formData[field].trim() !== "");
  };

  const handleSubmit = () => {
    if (!validateFields()) {
      toast({
        title: "Error",
        description: "Por favor llena todos los campos obligatorios antes de enviar.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsConfirming(true); 
  };

  const confirmSubmit = async () => {
    
    let dataToSubmit = {};

    if (selectedTable === "Registros") {
      dataToSubmit = {
        purchase_order: formData.input1, // Orden de Compra
        item: formData.input2,           // Item
        material_code: formData.input3,   // Codigo de Material
        description: formData.input4,      // Texto Breve
        quantity: formData.input5,   // Cantidad de Pedido
        measurement_unit: formData.input6, // Unidad de Medida
        unit_price: formData.input7,        // Precio Neto
        net_price: formData.input8,   // Valor Neto de pedido
        currency: formData.select1,       // Moneda
      };


      await handleDatabaseInsert(insertRecord, dataToSubmit, "Registros");

    } else if (selectedTable === "Materiales") {
      dataToSubmit = {
        material_code: formData.input1,       // Codigo de Material
        subheading: formData.input2,         // Subpartida
        type: formData.select2,      // Tipo de Material
        measurement_unit: formData.input3,    // Unidad de Medida
      };


      await handleDatabaseInsert(insertMaterial, dataToSubmit, "Materiales");

    } else if (selectedTable === "Proveedores") {
      dataToSubmit = {
        name: formData.inputObligatorio,  // Nombre de Proveedor
        domain: formData.inputOpcional || "",      // Dominio (opcional)
      };


      await handleDatabaseInsert(insertSupplier, dataToSubmit, "Proveedores");
    }

    setIsConfirming(false); 
    onClose(); 
  };

  const handleDatabaseInsert = async (insertFunction, data, modalName) => {
    try {
      await insertFunction(data); 
      toast({
        title: "Formulario enviado",
        description: `El formulario del ${modalName} se ha enviado correctamente.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar los datos. Inténtalo de nuevo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderModalContent = () => {
    switch (selectedTable) {
      case "Registros":
        return (
          <>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Orden de Compra</FormLabel>
                  <Input bgColor="white" name="input1" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Item</FormLabel>
                  <Input bgColor="white" name="input2" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Codigo de Material</FormLabel>
                  <Input bgColor="white" name="input3" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Texto Breve</FormLabel>
                  <Input bgColor="white" name="input4" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Cantidad de Pedido</FormLabel>
                  <Input bgColor="white" name="input5" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Unidad de Medida</FormLabel>
                  <Input bgColor="white" name="input6" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Precio Neto</FormLabel>
                  <Input bgColor="white" name="input7" onChange={handleChange}  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Valor Neto de pedido</FormLabel>
                  <Input bgColor="white" name="input8" onChange={handleChange}  />
                </FormControl>
              </GridItem>
            </Grid>
            <FormControl isRequired mt={4}>
              <FormLabel>Moneda</FormLabel>
              <Select bgColor="white" name="select1" placeholder='Selecciones una opcion' onChange={handleChange} >
                <option value="COP">COP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </Select>
            </FormControl>
          </>
        );

      case "Materiales":
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Codigo de Material</FormLabel>
              <Input bgColor="white" name="input1" onChange={handleChange}  />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Subpartida</FormLabel>
              <Input bgColor="white" name="input2" onChange={handleChange}  />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Tipo de Material</FormLabel>
              <Select bgColor="white" name="select2" onChange={handleChange} placeholder="Selecciona una opción">
                <option value="national">NACIONAL</option>
                <option value="foreign">EXTRANJERO</option>
                <option value="nationaliced">NACIONALIZADO</option>
                <option value="other">OTRO</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Unidad de Medidad</FormLabel>
              <Input bgColor="white" name="input3" onChange={handleChange}  />
            </FormControl>
          </>
        );

      case "Proveedores":
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Nombre de Proveedor</FormLabel>
              <Input bgColor="white" name="inputObligatorio" onChange={handleChange}  />
            </FormControl>
            <FormControl>
              <FormLabel>Dominio (opcional)</FormLabel>
              <Input bgColor="white" name="inputOpcional" onChange={handleChange}  />
            </FormControl>
          </>
        );

      default:
        return null;
    }
  };

  

  const handleTableChange = useCallback((event) => {
    setFile(null); 
    const table = event.target.value;
    setSelectedTable(table);
    setData(initialData[table]);
    setTableHeaders(headers[table]);

    setWorkbook(null);
    setData(initialData[table]);
    setShowDatabaseData(true); 
  }, []);




  const handleDownload = () => {

    let fileUrl = "";
    let fileName = "";

    if(selectedTable === "Registros"){
      fileUrl = "https://dl.dropboxusercontent.com/scl/fi/w5c6av2x637mgo2uoaqg8/Plantilla-Records.XLSX?rlkey=v5v4vdfdclppqh7pv1bati8fj&st=8d4svjqp&dl=0"; // Cambia por la ruta de tu archivo
      fileName = "Plantilla Records.xlsx"; 
    }else if(selectedTable === "Proveedores"){
      fileUrl = "https://dl.dropboxusercontent.com/scl/fi/zlzt3l4jy43c28rqiqpkd/Plantilla-Proveedores.XLSX?rlkey=m6nty56oebtt5w8ps84gdyis0&st=bhnikt5v&dl=0"; // Cambia por la ruta de tu archivo
      fileName = "Plantilla Proveedores.xlsx"; 
      
    }else if(selectedTable === "Materiales"){
      fileUrl = "https://dl.dropboxusercontent.com/scl/fi/bfsa5jc7xtz6r3jclkqrv/Plantilla-Material.XLSX?rlkey=2d81cpqez3bszqxjubatk5q71&st=h2w75xnf&dl=0"; // Cambia por la ruta de tu archivo
      fileName = "Plantilla Materiales.xlsx"; 
    }
 

   
    fetch(fileUrl)
      .then((response) => response.blob()) 
      .then((blob) => {
        saveAs(blob, fileName);
      })
      .catch((error) => console.error("Error al descargar el archivo:", error));
  };

  const [file, setFile] = useState(null);


  const handleFileUpload = async (event) => {
    setFile(event.target.files[0] || null); 
    let file = event.target.files[0];
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
    const totalTasks = data.length; 
  let completedTasks = 0; 
  
    let existingRecords = [];
    let existingMaterials = [];
    let existingSuppliers = [];
  
    try {
      if (selectedTable === 'Registros') {
        existingRecords = await getRecords(1, 30000);
      } else if (selectedTable === 'Materiales') {
        existingMaterials = await getMaterials(1, 40000);
      } else if (selectedTable === 'Proveedores') {
        existingSuppliers = await getSuppliers(1, 1000);
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }
  
    const invalidMaterialEntries = [];
    const invalidSupplierEntries = [];
  
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
  
      if (selectedTable === 'Registros') {
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
  
        const existingRecord = existingRecords.find(record => record.purchase_order === purchase_order && record.item === position);
        let supplierExists = false;
        let supplierId = 0;
  
        
        if (!supplierExists) {

              const domainExists = await getSupplier("","",supplier_name);
              if (domainExists.name === supplier_name) {
              supplierExists = true;

              } else {
                const newSupplier = await insertSupplier({ name: supplier_name });
                  supplierExists = true;


          }
          const verifi = await getSupplier("","",supplier_name);
                  supplierId = verifi.supplier_id; 
        }
        const exist = await getRecord(purchase_order,position)

        if (supplierExists && (exist.item === undefined || exist.item === NaN || exist.item !== Number || exist.item === "" || exist.item === null)) {
          const args = {
            item: parseInt(position),
            quantity: parseInt((String(quantity)).replace(/[.,]/g, '')),
            material_code: String(material_code),
            purchase_order: String(purchase_order),
            measurement_unit: measurement_unit,
            unit_price: parseFloat((String((parseFloat(unit_price).toFixed(2) * 100).toFixed(0))).replace(/[.,]/g, '')),
            currency: currency,
            created_at: new Date().toISOString(),
            supplier_id: supplierId,
            description: description,
            net_price: parseFloat((String(parseFloat(net_price * 100).toFixed(0))).replace(/[.,]/g, '')),
          };
          
            const validar = await getRecord(Number(purchase_order),parseInt(position))
            /*if(validar){
              if(validar.currency !== currency ||validar.supplier_id !== supplierId || String(validar) !== String(description) || parseInt(validar.quantity) !== parseInt((String(quantity)).replace(/[.,]/g, '')) || String(validar.material_code) !== String(material_code) || validar.measurement_unit !== measurement_unit || parseFloat(validar.unit_price) !== parseFloat((String((parseFloat(unit_price).toFixed(2) * 100).toFixed(0))).replace(/[.,]/g, '')) || parseFloat(validar.net_price) !== parseFloat((String(parseFloat(net_price * 100).toFixed(0))).replace(/[.,]/g, '')))
                {
                  const update = await updateRecord(Number(purchase_order),parseInt(position),args)
                  completedTasks += 1;
                  const progress = (completedTasks / totalTasks) * 100;
                  setProgress(progress);
                  continue
                }else{
                  completedTasks += 1;
                  const progress = (completedTasks / totalTasks) * 100;
                  setProgress(progress);
                  continue
                }
            }*/
              try {
              console.log(args.unit_price)
              if(args.unit_price === NaN || Number(args.unit_price) === Number(0) || args.unit_price === undefined || args.unit_price === null || args.unit_price === "" || String(args.unit_price) === "null"){
                console.log("aqui justo fallamos")
                completedTasks += 1;
              const progress = (completedTasks / totalTasks) * 100;
              setProgress(progress);
                continue;
              }
              const result = await insertRecord(args);
              console.log('Record inserted successfully:');
            } catch (error) {
              console.error('Error processing data:', error.message);
            
              if (error.details) {
                console.error('Error details:', error.details);
              }
            
              console.error('Error stack trace:', error.stack);
            }
          
        }
      } else if (selectedTable === 'Materiales') {
        const [material_code, subheading, type, measurement_unit] = row;
  
        const existingMaterial = existingMaterials.find(material => material.material_code === material_code);
        const args = { material_code, subheading };
        if(type === "national" || type === "foreign" || type === "nationalized" || type === "other"){
          args.type = type
        }else if(type === "NACIONAL"){
          args.type = "national"
        }else if(type === "EXTRANJERO"){
          args.type = "foreign"
        }else if(type === "NACIONALIZADO"){
          args.type = "nationalized"
        }else if(type === "OTRO"){
          args.type = "other"
        }
        if (measurement_unit !== "" ) args.measurement_unit = measurement_unit;
        const revisar = await getMaterial(material_code)
        if (revisar.material_code == material_code) { 
          const safeTrim = (value) => typeof value === 'string' ? value.trim() : '';

          const revisarCode = safeTrim(revisar.material_code);
          const revisarSubheading = safeTrim(revisar.subheading);
          const revisarType = safeTrim(revisar.type);
          const revisarMeasurementUnit = safeTrim(revisar.measurement_unit);
          
          const codeTrimmed = safeTrim(material_code);
          const subheadingTrimmed = safeTrim(subheading);
          const typeTrimmed = safeTrim(type);
          const measurementUnitTrimmed = safeTrim(measurement_unit);
          
          
          if(revisarType !== typeTrimmed || revisarMeasurementUnit !== measurementUnitTrimmed){
            try {
              const update = await updateMaterial(material_code, args);
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
      } else if (selectedTable === 'Proveedores') {
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
      completedTasks += 1;
      const progress = (completedTasks / totalTasks) * 100;
      setProgress(progress);

      
      
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
      if (selectedTable === 'Registros') {
        const records = await getRecords(1, 200);
        
        if (records) {
          const supplierIds = [...new Set(records.map(record => record.supplier_id))];

  
          const suppliers = await Promise.all(supplierIds.map(id => getSupplier(id)));

  
          const supplierMap = suppliers.reduce((acc, supplier) => {
            acc[supplier.supplier_id] = supplier.name;
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
      } else if (selectedTable === 'Materiales') {
        const materials = await getMaterials(1,100);
        
        if (materials) {
          setData(materials.map(material => [
            material.material_code,
            material.subheading,
            material.type,
            material.measurement_unit
          ]));
        }
      } else if (selectedTable === 'Proveedores') {
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
    setEnabled(checked)
    if (!checked && workbook) {
      fetchData(); 
    } else if (checked) {
      setData(excelData);  
    }
  };
  const [Enabled,setEnabled] = useState(true)
  useEffect(() => {
    setEnabled(!Enabled)
  },[file])
  return (
    <>
      <Box >
        <HStack whiteSpace="100%"  >
          <Select width="30%" onChange={handleTableChange} defaultValue="Registros">
            <option onClick={() => setButtons(true)} value="Registros">Registros</option>
            <option onClick={() => setButtons(false)}  value="Materiales">Materiales</option>
            <option  onClick={() => setButtons(false)} value="Proveedores">Proveedores</option>
          </Select>
          <VStack width="30%"></VStack>
          {Buttons && <Input width="50%" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />}
          <Tooltip label="Subir archivo" fontSize="md">
          <Button
            isDisabled={!Enabled}
            colorScheme='teal' 
            backgroundColor='#F1D803'
            onClick={validateAndInsertData}
            isLoading={isProcessing}
          >
            <Icon as={FaCloudArrowUp} w={5} h={5} color="black" />
          </Button>
          </Tooltip>
          <Tooltip label="Descargar plantilla" fontSize="md">
          <Button

            colorScheme='teal' 
            backgroundColor='#F1D803'
            onClick={handleDownload}

          >
            <Icon as={EditIcon} w={5} h={5} color="black" />
          </Button>
          </Tooltip>
          <Tooltip label="Agregar "  fontSize="md">
          <Button

            colorScheme='teal' 
            backgroundColor='#F1D803'
            onClick={onOpen}

          >
            <Icon as={AddIcon} w={5} h={5} color="black" />
          </Button>
          </Tooltip>
          <VStack width="35%"></VStack>
          {Buttons && <Text>Preview</Text>}
          <Switch
            isChecked={!showDatabaseData}
            onChange={handleSwitchChange}
            isDisabled={!workbook} 
          >
          </Switch>
        </HStack>
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bgColor="gray.200">
          <ModalHeader>{selectedTable}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {renderModalContent()}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Enviar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isConfirming} onClose={() => setIsConfirming(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar envío de Modal {selectedTable}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            ¿Estás seguro de que deseas enviar este formulario?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={confirmSubmit}>
              Confirmar
            </Button>
            <Button onClick={() => setIsConfirming(false)}>Cancelar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
          readOnly={true}
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
            selectedTable === 'Materiales'
              ? [
                  { type: 'text' }, 
                  { type: 'text' }, 
                  { type: 'dropdown', source: ['national', 'foreign'] }, 
                  { type: 'text' } 
                ]
              : selectedTable === 'Proveedores'
              ? [
                  { type: 'text' },
                  { type: 'text' } 
                ]
              : selectedTable === 'Registros'
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

