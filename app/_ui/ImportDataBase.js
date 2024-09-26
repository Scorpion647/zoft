'use client'
import ExcelJS from 'exceljs';
import { useState, useCallback, useEffect, useRef } from "react";
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import {
  List,
  ListItem,
  ListIcon, Menu, MenuButton, MenuList, MenuItem,
  GridItem, Grid, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure, Tooltip, Box, Input, Flex, HStack, Button, Icon, Select, useToast, Switch, VStack, Text, Alert, Progress, Spinner
} from '@chakra-ui/react';
import { FaCloudArrowUp } from "react-icons/fa6";
import { getMaterial, getRecords, getMaterials, getSuppliers, getSupplier, generateUniqueId, checkSupplierIdExists, updateMaterial, getRecord, updateRecord } from '@/app/_lib/database/service';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { insertBills } from '../_lib/database/base_bills';
import { insertMaterial } from '../_lib/database/materials';
import { insertSupplier, selectSingleSupplier, selectSuppliers } from '../_lib/database/suppliers';


// Simulamos una función para obtener datos de una base de datos
async function fetchDataFromDatabase() {
  // Esta sería la llamada a tu API o base de datos real
  const response = await selectSuppliers({ limit: 1000, page: 1 });

  return response.map(item => ({
    id: item.supplier_id,
    name: item.name // Asume que el campo 'name' es uno de los elementos
  }));
}

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

      // Validar que el input del proveedor tenga algún valor
      if (!inputValue.trim() && !selectedId) {
        requiredFields.push("inputProvider"); // Añadir un campo virtual 'provider'
      }
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
      let supplier
      if(selectedId !== 0){
        supplier = selectedId
      }else{
        const insert = await insertSupplier({name: inputValue})
        supplier = insert[0].supplier_id
      }
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
        supplier_id: supplier , // Proveedor: usar uno u otro
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
        domain: formData.inputOpcional || "",      // Dominio 
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

  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // Guardar el id seleccionado
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [dataa, setDataa] = useState([]); // Almacena los datos cargados desde la base de datos
  const dropdownRef = useRef(); // Referencia para el dropdown

  // Cargar datos desde la base de datos
  useEffect(() => {
    async function loadData() {
      const loadedData = await fetchDataFromDatabase(); // Llama a la función que carga los datos
      setDataa(loadedData); // Guardamos solo los 'id' y 'name'
      setFilteredOptions(loadedData); // Inicialmente todas las opciones son visibles
    }
    loadData();
  }, []); // Se ejecuta solo cuando el componente se monta

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value) {
      // Filtrar las opciones por el nombre según el texto escrito
      const filtered = dataa.filter(option =>
        option.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      setDropdownVisible(true);

      // Verificar si hay coincidencias y actualizar selectedId
      if (filtered.length === 0) {
        setSelectedId(0); // No hay coincidencias, establecer selectedId a 0
      } else {
        setSelectedId(null); // Hay coincidencias, no establecer selectedId
      }
    } else {
      setDropdownVisible(false);
      setSelectedId(0); // Si el input está vacío, establecer selectedId a 0
    }
  };

  const handleSelectOption = (option) => {
    setInputValue(option.name); // Muestra el nombre en el input
    setSelectedId(option.id); // Guarda el id del nombre seleccionado
    setDropdownVisible(false); // Oculta el dropdown al seleccionar
  };

  const handleBlur = (e) => {
    // Cerrar el dropdown solo si se hace clic fuera de la lista
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
        setDropdownVisible(false);
      }
    }, 100); // Retraso para asegurar que el clic se procese
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
                  <Input bgColor="white" name="input1" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Item</FormLabel>
                  <Input bgColor="white" name="input2" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Codigo de Material</FormLabel>
                  <Input bgColor="white" name="input3" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Texto Breve</FormLabel>
                  <Input bgColor="white" name="input4" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Cantidad de Pedido</FormLabel>
                  <Input bgColor="white" name="input5" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Unidad de Medida</FormLabel>
                  <Input bgColor="white" name="input6" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Precio Neto</FormLabel>
                  <Input bgColor="white" name="input7" onChange={handleChange} />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel>Valor Neto de pedido</FormLabel>
                  <Input bgColor="white" name="input8" onChange={handleChange} />
                </FormControl>
              </GridItem>
            </Grid>
            <FormControl isRequired mt={4}>
              <FormLabel>Proveedor</FormLabel>
              <Input
                name="inputProvider" // Añadir un nombre al input
                value={inputValue}
                onChange={(e) => {
                  handleInputChange(e); // Actualiza inputValue en el estado
                  setFormData({
                    ...formData,
                    inputProvider: e.target.value, // Actualiza formData con el valor del input
                  });
                }}
                onBlur={handleBlur} // Llama a handleBlur cuando se pierde el foco
                placeholder="Escribe algo..."
                bgColor="white"
              />
              {isDropdownVisible && filteredOptions.length > 0 && (
                <List
                  ref={dropdownRef} // Añadimos la referencia aquí
                  position="absolute"
                  zIndex="1000"
                  bg="white"
                  border="1px solid gray"
                  borderRadius="md"
                  mt="2"
                  width="100%"
                  maxHeight="120px" // Máxima altura para mostrar 3 opciones
                  overflowY="auto" // Habilitar scroll si hay más de 3 opciones
                >
                  {filteredOptions.slice(0, 3).map((option) => ( // Mostrar solo 3
                    <ListItem
                      key={option.id} // Cambia a usar el id como clave única
                      padding="8px"
                      _hover={{ bg: "gray.100", cursor: "pointer" }}
                      onClick={() => handleSelectOption(option)} // Al hacer clic, selecciona la opción
                    >
                      {option.name}
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Muestra el ID seleccionado solo para propósitos de depuración */}
              {selectedId !== null && <Box mt="2">ID seleccionado: {selectedId}</Box>}
            </FormControl>
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
              <Input bgColor="white" name="input1" onChange={handleChange} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Subpartida</FormLabel>
              <Input bgColor="white" name="input2" onChange={handleChange} />
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
              <Input bgColor="white" name="input3" onChange={handleChange} />
            </FormControl>
          </>
        );

      case "Proveedores":
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Nombre de Proveedor</FormLabel>
              <Input bgColor="white" name="inputObligatorio" onChange={handleChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Dominio (opcional)</FormLabel>
              <Input bgColor="white" name="inputOpcional" onChange={handleChange} />
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

    if (selectedTable === "Registros") {
      fileUrl = "https://dl.dropboxusercontent.com/scl/fi/w5c6av2x637mgo2uoaqg8/Plantilla-Records.XLSX?rlkey=v5v4vdfdclppqh7pv1bati8fj&st=8d4svjqp&dl=0";
      fileName = "Plantilla Records.xlsx";
    } else if (selectedTable === "Proveedores") {
      fileUrl = "https://dl.dropboxusercontent.com/scl/fi/zlzt3l4jy43c28rqiqpkd/Plantilla-Proveedores.XLSX?rlkey=m6nty56oebtt5w8ps84gdyis0&st=bhnikt5v&dl=0";

    } else if (selectedTable === "Materiales") {
      fileUrl = "https://dl.dropboxusercontent.com/scl/fi/bfsa5jc7xtz6r3jclkqrv/Plantilla-Material.XLSX?rlkey=2d81cpqez3bszqxjubatk5q71&st=h2w75xnf&dl=0";
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
    setProgress(0)
    let totalTasks = data.length;
    let completedTasks = 0;
    const updateThreshold = Math.ceil(totalTasks / 10);
    let existingRecords = [];
    let existingMaterials = [];
    let existingSuppliers = [];

    try {
      switch (selectedTable) {
        case 'Registros':
          existingRecords = await getRecords(1, 30000);
          break;
        case 'Materiales':
          existingMaterials = await getMaterials(1, 40000);
          break;
        case 'Proveedores':
          existingSuppliers = await getSuppliers(1, 1000);
          break;
      }
    } catch (error) {
      console.error('Error fetching existing data:', error);
    }

    const invalidMaterialEntries = [];
    const invalidSupplierEntries = [];
    const recordsToInsert = [];
    const materialsToInsert = [];
    const suppliersToInsert = [];

    for (const row of data) {
      const args = {};

      if (selectedTable === "Registros") {

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
        let supplierId;

        if (!existingRecord) {
          const domainExists = await getSupplier("", "", supplier_name);
          if (domainExists.name !== supplier_name) {
            const newSupplier = await insertSupplier({ name: supplier_name });
            supplierId = newSupplier.supplier_id;
          } else {
            supplierId = domainExists.supplier_id;
          }

          const unitPriceParsed = parseFloat((parseFloat(unit_price).toFixed(2) * 100).toFixed(0));
          console.log(
            parseInt(position),
            parseInt(String(quantity || 0).replace(/[.,]/g, '')),
            String(material_code),
            String(purchase_order),
            measurement_unit,
            unitPriceParsed,
            currency,
            new Date().toISOString(),
            supplierId,
            description,
            parseFloat((net_price * 100).toFixed(0)),
          )
          if (unitPriceParsed && !isNaN(unitPriceParsed)) {
            recordsToInsert.push({
              item: parseInt(position),
              quantity: parseInt(String(quantity || 1).replace(/[.,]/g, '')),
              material_code: String(material_code),
              purchase_order: String(purchase_order),
              measurement_unit: measurement_unit,
              unit_price: parseInt(unitPriceParsed) || 12345,
              currency: String(currency),
              created_at: new Date().toISOString(),
              supplier_id: parseInt(supplierId) || 340,
              description: String(description),
              net_price: parseInt(parseFloat((net_price * 100).toFixed(0))) || 12345,
            });
          } else {
            invalidMaterialEntries.push(row);
          }
        }
        completedTasks += 1;


        if (completedTasks % updateThreshold === 0 || completedTasks === totalTasks) {
          const progress = (completedTasks / totalTasks) * 100;
          setProgress(progress);
        }
      } else if (selectedTable === "Materiales") {


        const [material_code, subheading, type, measurement_unit] = row;
        const materialArgs = { material_code };

        if (subheading) {
          if (String(subheading).length === 10) {
            materialArgs.subheading = String(subheading);
          } else if (String(subheading).length > 10) {
            materialArgs.subheading = String(subheading).slice(0, 12);
          }
        }

        const typeMapping = {
          "national": "national",
          "foreign": "foreign",
          "nationalized": "nationalized",
          "other": "other",
          "NACIONAL": "national",
          "EXTRANJERO": "foreign",
          "NACIONALIZADO": "nationalized",
          "OTRO": "other",
        };

        if (typeMapping[type]) {
          materialArgs.type = typeMapping[type]
        }

        if (measurement_unit) materialArgs.measurement_unit = measurement_unit;

        const revisar = await getMaterial(material_code);
        if (revisar.material_code === material_code) {
          const updateNeeded = revisar.type !== materialArgs.type || revisar.measurement_unit !== materialArgs.measurement_unit;
          if (updateNeeded) {
            materialsToInsert.push(materialArgs);
          }
        } else {
          materialsToInsert.push(materialArgs);
        }
        completedTasks += 1;


        if (completedTasks % updateThreshold === 0 || completedTasks === totalTasks) {
          const progress = (completedTasks / totalTasks) * 100;
          setProgress(progress);
        }
      } else if (selectedTable === "Proveedores") {

        const [domain, name] = row;
        suppliersToInsert.push({ domain, name });
        completedTasks += 1;


        if (completedTasks % updateThreshold === 0 || completedTasks === totalTasks) {
          const progress = (completedTasks / totalTasks) * 100;
          setProgress(progress);
        }
      }
    }


    await Promise.all([
      insertBills(recordsToInsert),
      insertMaterial(materialsToInsert),
      insertSupplier(suppliersToInsert),
    ]);


    if (invalidMaterialEntries.length > 0) {
      const groupedErrors = groupConsecutiveNumbers(invalidMaterialEntries);
      const errorMessage = `Material code not found at rows ${groupedErrors.join(', ')}`;
      toast({ title: 'Validation Errors', description: errorMessage, status: 'error', position: 'top', isClosable: true, duration: 10000 });
    }

    setIsProcessing(false);
    toast({ title: "Formulario enviado", description: `El formulario del ${selectedTable} se ha enviado correctamente.`, status: "success", duration: 3000, isClosable: true });
  };


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


  const getsuplier = async (record) => {
    const supplier = await getSupplier(record)
    const hola = null;
    setData(supplier.map(supplier => [
      { hola: supplier.supplier_id }
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
        const materials = await getMaterials(1, 100);

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
  const [Enabled, setEnabled] = useState(true)
  useEffect(() => {
    setEnabled(!Enabled)
  }, [file])
  return (
    <>
      <Box >
        <HStack whiteSpace="100%"  >
          <Select width="30%" onChange={handleTableChange} defaultValue="Registros">
            <option onClick={() => setButtons(true)} value="Registros">Registros</option>
            <option onClick={() => setButtons(false)} value="Materiales">Materiales</option>
            <option onClick={() => setButtons(false)} value="Proveedores">Proveedores</option>
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
          <Tooltip label="Agregar " fontSize="md">
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
        {isProcessing && <Progress colorScheme="teal" value={progress} />}
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

