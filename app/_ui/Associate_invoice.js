import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Switch,Tooltip, Select, ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure } from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, CheckCircleIcon, DownloadIcon, AtSignIcon, AttachmentIcon, CalendarIcon, CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { getRecords, getMaterial, getMaterials, getRecordsInfo, getSupplier, insertRecordInfo, getRecord, updateMaterial } from '@/app/_lib/database/service';



function formatMoney(amount) {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
  }

export const Associate_invoice = ({ sharedState, updateSharedState }) =>{







    const [data, setData] = useState(Array(100).fill().map(() => Array(6).fill('')));



    useEffect(() => {
        updateSharedState('proveedor', "")
        updateSharedState('descripcion', "NaN")
        updateSharedState('cantidadoc', 0)
        updateSharedState('pesopor', 0)
        updateSharedState('totalfactura', 0)
        updateSharedState('TRM', false)
    },[])





    

    
    
    
    
      const [hola, sethola] = useState(false);
      const hotTableRef = useRef(null);
      const [factunitprice, setfactunitprice] = useState(0);
      const [facttotalvalue, setfacttotalvalue] = useState(0);
    
      const [orderNumber, setOrderNumber] = useState('');
      const [position, setposition] = useState(0);
      const router = useRouter();
      const [lastClickTime, setLastClickTime] = useState(0);
      const [columnSum2, setColumnSum2] = useState(0);

    
    
      function convertCommaToDot(input) {
        let str = input.toString().trim(); 
        
    
        str = str.replace(/\./g, ','); 
        
        str = str.replace(/,/g, '.');
            return parseFloat(str);
    }
    
      const convertToNumber = (value) => {
        if (typeof value === 'string') {
          value = value.replace(/,/g, '.');
        }
        return parseFloat(value);
      };
    
      function cleanAndFormatNumber (value) {
        // Eliminar el símbolo de dólar
        let cleanedValue = value.replace('$', '');
    
        // Quitar los puntos (por ejemplo, de miles)
        cleanedValue = cleanedValue.replace(/\./g, '');
    
        // Cambiar las comas por puntos
        cleanedValue = cleanedValue.replace(',', '.');
    
        return cleanedValue;
    }
    
    // Ejemplo de uso
    const rawValue = "$1.234,56";
    const formattedValue = cleanAndFormatNumber(rawValue);
    
    console.log(formattedValue); // "1234.56"
    
    
      
    
    
    
    
    
    
    
      
    
      
    
    
    
    
    
    
    
    
    
    
    
      
    
    
    
    
    
      
    
    
      const calculateColumnSum = () => {
        const columnIndexToSum = 2;
        const columnIndexCondition = 0;
        const columnIndexToSum2 = 5;
        const columnIndexCondition2 = 0;
        const sum = data.reduce((total, row) => {
    
          const conditionValue = row[columnIndexCondition];
    
    
          if (conditionValue !== 0 && conditionValue !== null) {
    
            let valueStr = row[columnIndexToSum];
    
            if (typeof valueStr === 'string') {
              valueStr = valueStr.replace(/,/g, '.');
            }
    
            let value = parseFloat(valueStr);
    
            if (!isNaN(value)) {
              value = parseFloat(value.toFixed(4));
            }
    
            return !isNaN(value) ? parseFloat((total + value).toFixed(4)) : total;
          }
    
          return total;
        }, 0);
        const sum2 = data.reduce((total, row) => {
          const conditionValue = row[columnIndexCondition2];
          if (conditionValue !== 0 && conditionValue !== null && conditionValue != "") {
            const value = parseFloat(row[columnIndexToSum2]);
            return !isNaN(value) ? total + value : total;
          }
          return total;
        }, 0);
        updateSharedState('columnSum', sum);
        setColumnSum2(sum2);
      };
    
      useEffect(() => {
        calculateColumnSum();
      }, [data]);
    
    
    
    
      const [suggestions, setSuggestions] = useState([]);
      const [remainingCount, setRemainingCount] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
      const [isHovered, setIsHovered] = useState(false);
      const buttonRef = useRef(null);
    
      
    
    
    
    
    
      const [inputValue, setInputValue] = useState('');
      const [filteredValue, setFilteredValue] = useState('');
      const [selectedStatus, setSelectedStatus] = useState('EN PROCESO');
      const [selectedMonth, setSelectedMonth] = useState('');
      const [isTable, setisTable] = useState(false);
    
    
    
      const handleOrderNumberChange = (e) => {
        setOrderNumber(e.target.value);
      };
      const handlebulto = (e) => {
        updateSharedState('bultos', (e.target.value));
      };
      const handlepesototal = (e) => {
        updateSharedState('pesototal', (e.target.value));
      };
      const handleTRM = (e) => {
        updateSharedState('valorTRM', (e.target.value));
      };
      const handleNoFactura = (e) => {
        updateSharedState('nofactura', (e.target.value));
      };
      const handleSwitchChange = (e) => {
        const currentValue = sharedState.TRM;
        console.log(sharedState.TRM)
        updateSharedState('TRM', !currentValue);
        console.log(sharedState.TRM)
    };
    


      
    
      function handleChange(value) {
       // Paso 1: Si el valor está vacío, devolverlo tal cual
       if (!value) {
        return '';
    }
    
    // Paso 2: Eliminar el símbolo de dólar y los espacios
    let formattedValue = value.replace(/[\$\s]/g, '');
    
    // Paso 3: Reemplazar comas por puntos
    formattedValue = formattedValue.replace(/\./g, '').replace(/,/g, '.');
    
    // Paso 4: Verificar si el valor tiene un solo punto con exactamente dos decimales
    const decimalMatch = formattedValue.match(/^(\d+)\.(\d{2})$/);
    
    if (decimalMatch) {
        // Si los dos decimales son "00", eliminar el punto y los decimales
        if (decimalMatch[2] === '00') {
            return decimalMatch[1];
        }
        // Si ya tiene dos decimales y no hay más cambios, retornarlo como está
        return formattedValue;
    }
    
    // Paso 5: Mover el punto a la posición correcta si hay más de dos dígitos decimales
    const splitValue = formattedValue.split('.');
    let intValue = splitValue[0];
    let decimalValue = splitValue[1] || '';
    
    // Asegurarse de que solo haya dos decimales
    if (decimalValue.length > 2) {
        decimalValue = decimalValue.slice(0, 2);
    } else if (decimalValue.length < 2) {
        decimalValue = decimalValue.padEnd(2, '0');
    }
    
    // Construir el valor formateado
    formattedValue = `${intValue}.${decimalValue}`;
    
    // Paso 6: Si los dos decimales son "00", eliminar el punto y los decimales
    if (decimalValue === '00') {
        return intValue;
    }
    
    return formattedValue;
    }
    


























    useEffect(() => {
        if (orderNumber.trim() !== '') {
          setIsLoading(true);
      
          // Llama a la función de la base de datos
          getRecords(1, 10000) // Ajusta el parámetro para obtener todos los registros posibles
            .then((data) => {
              if (Array.isArray(data)) {
                // Filtra los registros para encontrar coincidencias parciales
                const matchingRecords = data
                  .map(record => record.purchase_order)
                  .filter((value, index, self) => 
                    self.indexOf(value) === index && value.includes(orderNumber) // Verifica si `orderNumber` está incluido en `purchase_order`
                  );
      
                // Si hay más de 4 registros, muestra los primeros 4 y cuenta los restantes
                if (matchingRecords.length > 4) {
                  setSuggestions(matchingRecords.slice(0, 4));
                  setRemainingCount(matchingRecords.length - 4);
                } else {
                  setSuggestions(matchingRecords);
                  setRemainingCount(0);
                }
              } else {
                setSuggestions([]);
                setRemainingCount(0);
              }
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setSuggestions([]);
          setRemainingCount(0);
        }
      }, [orderNumber]);




    const columns = [
        { data: 0, readOnly: false, title: 'Posicion' },
        { data: 1, readOnly: true, title: 'Codigo de Material' },
        { data: 2, readOnly: false, title: 'Cantidad' },
        { data: 3, readOnly: false, title: 'Precio Unitario' },
        { data: 4, readOnly: true, title: 'Valor Neto' },
        { data: 5, readOnly: false, title: 'Subpartida ' },
      ];

    const handleCellDoubleClick = async (event, coords, TD) => {
        const currentTime = new Date().getTime();
        const doubleClickThreshold = 300;
        const cellValue = data[coords.row]?.[coords.col]?.toString().trim();
        const pos = data[coords.row]?.[0]?.toString().trim();
        const quanti = parseInt(data[coords.row]?.[2]?.toString().trim());
    
    
    
        const records = await getRecords(1, 150, orderNumber);
    
    
        
    
        if (Array.isArray(records)) {
          const matchedRecord = records.find(record =>
            record.purchase_order.trim() === orderNumber.trim() &&
            record.item.toString().trim() === pos
          );
    
          if (matchedRecord) {
            const { material_code, currency, description, supplier_id, quantity } = matchedRecord;
            const unit_price = convertCommaToDot(data[coords.row]?.[3]?.toString().trim());
            const supplier = await getSupplier(supplier_id)
            updateSharedState('descripcion', description)
            updateSharedState('proveedor', supplier.name)
            updateSharedState('cantidadoc', quantity)
            updateSharedState('preciouni', (unit_price ))
            updateSharedState('moneda', currency)
            if (sharedState.TRM) {
              if ((((unit_price ) * sharedState.valorTRM) * quanti).toFixed(2) !== NaN && (unit_price ) !== "") {
    
                updateSharedState('factunit', ((unit_price ) * sharedState.valorTRM))
                updateSharedState('facttotal', (((unit_price ) * sharedState.valorTRM) * quanti))
              } else {
    
                updateSharedState('factunit', 0)
                updateSharedState('facttotal', 0)
              }
            } else {
              const uni = (((unit_price / 100)) * quanti).toFixed(2);
              if (((((unit_price )) * quanti).toFixed(2)) !== "NaN" && (unit_price ) !== "" ) {
                updateSharedState('factunit', ((unit_price )))
                updateSharedState('facttotal', (((unit_price )) * quanti))
              } else {
                updateSharedState('factunit', 0)
                updateSharedState('facttotal', 0)
              }
            }
            
    
    
            if ((position != null) && (orderNumber.trim() !== '') && (material_code !== null)) {
              if (coords.col === 0) {
    
                // toggleCondition();
              }
            }
            
       
          } else {
            updateSharedState('descripcion', "NaN")
            updateSharedState('cantidadoc', 0)
            updateSharedState('facttotal', 0)
          }
    
        }
    
        let totalSum = 0;
    
            for (let row = 0; row < data.length; row++) {
              let tot = 0; // Reinicia tot en cada iteración
              const unip = data[row][3];
              const can = data[row][2];
            
              if (unip !== "" && can !== "" && unip !== 0 && can !== 0) {
                if (sharedState.TRM) {
                  tot = (unip * can).toFixed(2);
                } else {
                  tot = (unip * can).toFixed(2);
                }
              }
            
              // Solo sumar a totalSum si tot es un número válido
              if (!isNaN(tot) && tot !== 0) {
                totalSum += parseFloat(tot);
              }
            
    
            }
            
            updateSharedState('totalfactura', totalSum);
    
    
    
    
        updateSharedState('cantidadespor', ((data[coords.row]?.[2]?.toString().trim() / sharedState.columnSum) * 100).toFixed(2));
        if ((((((data[coords.row]?.[3]?.toString().trim() / sharedState.columnSum) * 100).toFixed(2)) * sharedState.pesototal) / 100).toFixed(2) !== "NaN") {
          updateSharedState('pesopor', (((((data[coords.row]?.[2]?.toString().trim() / sharedState.columnSum) * 100).toFixed(2)) * sharedState.pesototal) / 100).toFixed(2));
        } else {
          updateSharedState('pesopor', 0)
        }
        updateSharedState('factor', (((((((data[coords.row]?.[2]?.toString().trim() / sharedState.columnSum) * 100)) * sharedState.pesototal) / 100)) / (data[coords.row]?.[2]?.toString().trim())).toFixed(8))
        updateSharedState('bulto', (((((data[coords.row]?.[2]?.toString().trim() / sharedState.columnSum) * 100).toFixed(2)) * (sharedState.bultos)) / 100).toFixed(3))
    
    
    
        updateSharedState('SelectedCellValue', cellValue);
        setLastClickTime(currentTime);
    
    
      }





    


    const handleSubmit = async () => {
        const hotInstance = hotTableRef.current?.hotInstance;
        if (!hotInstance) {
          console.error('Handsontable instance has been destroyed or is not available.');
          return;
        }
    
        const tableData = hotInstance.getData();
        const records = [];
        const seenPositions = new Set();
        const duplicatePositions = new Map();
        const incompleteRows = [];
    
        let hasCompleteRow = false;
    
        for (const [index, row] of tableData.entries()) {
          const isEmptyRow = row.every(cell => cell === null || cell === '' || cell === undefined);
    
          if (isEmptyRow) continue;
    
          const [record_position, material_code, billed_quantity,bill_number,, subheading] = row;
    
          if ((record_position !== "" && record_position !== NaN && record_position !== undefined && record_position !== null) && 
          (material_code !== "" && material_code !== NaN && material_code !== undefined && material_code !== null) && 
          (bill_number !== "" && bill_number !== NaN && bill_number !== undefined && bill_number !== null)
           && (billed_quantity !== "" && billed_quantity !== NaN && billed_quantity !== undefined && billed_quantity !== null)
            && (subheading !== "" && subheading !== NaN && subheading !== undefined && subheading !== null)  ) {
            hasCompleteRow = true;
    
            const pos = hotInstance.getDataAtCell(index, 0);
            const matchedRecord = await getRecord(orderNumber,pos);
                const { id, unit_price, material_code } = matchedRecord;
                const material = await getMaterial(material_code)
                if(material.subheading === 0 || material.subheading === null || material.subheading === undefined){
                  const update = await updateMaterial(material_code, {subheading: hotInstance.getDataAtCell(index, 4)})
                  if (update) {
                    // Manejo del error
                    console.log("error al actualizar el material")
                  }
                }
                let factunitprice = 0;
                let totalprice = 0;
                  totalprice = (((parseFloat(hotInstance.getDataAtCell(index, 3)).toFixed(2))) * parseFloat(hotInstance.getDataAtCell(index, 2))).toFixed(2);
                  factunitprice = parseFloat(hotInstance.getDataAtCell(index, 3));
                
                let Trm = sharedState.TRMNUM;
                const gross = ((((((hotInstance.getDataAtCell(index, 2)) / sharedState.columnSum) * 100)) * sharedState.pesototal) / 100).toFixed(2);
                const packag = (((((hotInstance.getDataAtCell(index, 2) / sharedState.columnSum) * 100)) * (sharedState.bultos)) / 100).toFixed(3);
                let conver = 0;
                console.log(sharedState.TRM)
                if(!sharedState.TRM){
                  conver = 0;
                  console.log("hay problemas en el paraiso")
                }else{
                  console.log("entramos")
                  conver = 1;
                }
                
                if (seenPositions.has(record_position)) {
                  if (!duplicatePositions.has(record_position)) {
                    duplicatePositions.set(record_position, []);
                  }
                  duplicatePositions.get(record_position).push(index + 1);
                } else {
                  seenPositions.add(record_position);
    
     
                  const record = {
                    bill_number: sharedState.nofactura,
                    billed_quantity,
                    billed_total_price: parseInt(totalprice * 100),
                    billed_unit_price: parseInt(factunitprice * 100),
                    gross_weight: (gross),
                    packages: (packag),
                    record_id: id,
                    trm: Trm,
                    conversion: conver,
                  };
    
                  records.push(record);
                
              
                }
          } else {
            incompleteRows.push(index + 1);
          }
        }
    
        if (incompleteRows.length > 0) {
          alert(`Las siguientes filas están incompletas: ${incompleteRows.join(', ')}`);
          return;
        }
    
        if (!hasCompleteRow) {
          alert('Debe haber al menos una fila completa.');
          return;
        }
    
        if (duplicatePositions.size > 0) {
          const duplicatesMsg = Array.from(duplicatePositions.entries())
            .map(([pos, indices]) => `Posición ${pos}: Fila(s) ${indices.join(', ')}`)
            .join('\n');
          alert(`Hay posiciones duplicadas:\n${duplicatesMsg}`);
          return;
        }
    
        let success = true;
        for (const record of records) {
          const result = await insertRecordInfo(record);
          if (result instanceof Error) {
            console.error(result);
            alert(`Error al almacenar el registro para la posición ${record.record_position}: ${result.message}`);
            success = false;
          } else {
            console.log(`Registro para la posición ${record.record_position} almacenado correctamente.`);
          }
        }
    
        if (success) {
          setisTable(false);
          alert('Registros enviados correctamente.');
        } else {
          alert('Hubo errores al enviar los datos.');
        }
      };






    return(
        <div className={`relative p-4 bg-gradient-to-tr from-gray-200 to-gray-300 border h-full border-gray-300 text-center rounded-3xl shadow-md flex flex-col`}>

              <HStack position="relative" width="100%" height="100px" className=" ">
                <VStack width="25%">
                  <HStack>
                    <Input
                      border='1px'
                      backgroundColor='white'
                      type="text"
                      value={orderNumber}
                      onChange={handleOrderNumberChange}
                      placeholder="Orden de Compra"
                    />
                    <Tooltip
                      label={
                        suggestions.length > 0
                          ? suggestions.join(', ') + (remainingCount > 0 ? ` y ${remainingCount} más` : '')
                          : "No hay coincidencias"
                      }
                      isOpen={isHovered && suggestions.length > 0}
                      placement="bottom"
                      hasArrow
                      bg="gray.300"
                      color="black"
                      isDisabled={isLoading}
                    >
                      <Button ref={buttonRef} isLoading={isLoading} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} colorScheme='teal' backgroundColor='#F1D803'>
                        <SearchIcon w={5} h={5} color='black' />
                      </Button>
                    </Tooltip>
                  </HStack>
                  <HStack textAlign="start" align="start" justify="start">
                  <Text className=" font-bold" fontSize="80%">Facturar en dolares</Text>
                  <Switch
                  size="sm"
                  border="1px"
                  borderColor="gray.300"
                  borderRadius="inherit"
                isChecked={sharedState.TRM}
                onChange={handleSwitchChange}
            />
            
                  </HStack>
                </VStack>
                <HStack width="2.5%">

                </HStack>
                <HStack className=" bg-white rounded-2xl" padding="3"  position="relative" width="45%" spacing={0}>
                  <VStack spacing={0} align="start" justify="start" width="30%" >
                    <Text h="20%" className=" font-semibold" fontSize="70%">Descripcion:</Text>
                    <Text h="20%" className=" font-semibold" fontSize="70%">Cantidad OC:</Text>
                    <Text h="20%" className=" font-semibold" fontSize="70%">Peso:</Text>
                    
                  </VStack>
                  <VStack spacing={0} align="end" justify="end" width="70%"  >
                    <Text h="20%" fontSize="70%">{sharedState.descripcion}</Text>
                    <Text h="20%" fontSize="70%">{sharedState.cantidadoc}</Text>
                    <Text h="20%" fontSize="70%">{sharedState.pesopor}</Text>

                  </VStack>
                </HStack>
                <HStack width="2.5%">

</HStack>
                <VStack className=" bg-white rounded-2xl" padding="3" width="20%" spacing="3px" textAlign='center' justifyContent="center" alignItems='center'>


                  <HStack align="center" justify="center" height="20%" >
                    <VStack width="50%" align="start" justify="start"><Text fontSize="80%" className=" font-semibold">Peso Total</Text></VStack>
                    <VStack width="50%" align="end" justify="end"><Input fontSize="80%" width="100%" height="20%"  onChange={handlepesototal}  backgroundColor='white' border='1px'  /></VStack>
                    
                  </HStack>
                  <HStack align="center" justify="center" height="20%" >
                    <VStack width="50%" align="start" justify="start"><Text fontSize="80%" className=" font-semibold">Bultos</Text></VStack>
                    <VStack  width="50%" align="end" justify="end"><Input fontSize="80%" width="100%" height="20%"  onChange={handlebulto}  backgroundColor='white' border='1px'  /></VStack>
                  </HStack>
                  <HStack align="center" justify="center" height="20%" >
                    <VStack width="50%" align="start" justify="start"><Text fontSize="80%" className=" font-semibold">No. Factura</Text></VStack>
                    <VStack  width="50%" align="end" justify="end"><Input fontSize="80%" width="100%" height="20%"  onChange={handleNoFactura}  backgroundColor='white' border='1px'  /></VStack>
                  </HStack>
                  


                </VStack>
              </HStack>
              <HStack spacing={3}>
                <HStack padding="1"  spacing={3} width="60%"><Text className=" font-bold  "  fontSize="90%">Proveedor</Text><Text fontSize="90%">{sharedState.proveedor}</Text>
            </HStack>
                
                <HStack width="40%" align="end" justify="end">
                <Text  fontSize="90%" className=" font-bold">Valor Total de la Factura</Text>
                <Text  fontSize="90%">{formatMoney(sharedState.totalfactura)}</Text>
                </HStack>
                </HStack>
              <Box>
                <HotTable
                  ref={hotTableRef}
                  className="relative z-0"
                  data={data}
                  colWidths={[50, 150, 50, 110, 110 , 100,]} // Ancho específico para cada columna
                  rowHeaders={true}
                  width="100%"
                  height="300"
                  licenseKey="non-commercial-and-evaluation"
                  columns={columns}
                  stretchH='all'
                  dropdownMenu={true}
                  copyPaste={true}
                  hiddenColumns={{ indicators: true }}
                  afterOnCellMouseDown={handleCellDoubleClick}
                  afterRenderer={(TD, row, col, prop, value, cellProperties) => {

                    if (col === 3) { 
       
                      TD.style.backgroundColor = ''; 
                      TD.title = '';
                  
                  
                      if (value > 10) {
                        value
                        TD.title = 'Este valor es mayor a 10'; 
                        
                      }
                    }
                  }}
                  beforeChange={(changes, source) => {
                    const hot = hotTableRef.current.hotInstance;
                    if (changes) {
                        for (const change of changes) {
                            calculateColumnSum();
                            const [row, col, oldValue, newValue] = change;
                            const hot = hotTableRef.current.hotInstance;
                
                            if (col === 3) {
                                // Aplica la función de formateo al valor ingresado
                                const formattedValue = handleChange(newValue);
                
                                // Verificar si el valor formateado cumple con las condiciones
                                if (formattedValue !== newValue) {
                                    // Verificar si `change` existe y es un array
                                    if (Array.isArray(change) && change.length > 3) {
                                        change[3] = formattedValue;  // Cambia el valor de la celda con el valor formateado
                                    } else {
                                        console.error("Formato de `change` inesperado o inválido", change);
                                    }
                                }
                                
                            }
                            if(col === 2){
                              
                            }
                            
                            
                        }
                    }
                
                    return true;
                }}
                
                
                  cells={(row, col, prop) => {
                    const cellProperties = {};
                    const editableStyle = { backgroundColor: '#FFFF00' }; 
                    const readonlyStyle = { backgroundColor: '#f5c6c6' }; 
                    const reset = { backgroundColor: '' }; 


                    // Establece la celda como editable o no editable según la lógica
                    if (col === 5) { // Supongamos que el subheading está en la columna 4


                      if (data[row][0] !== "" && (data[row][1] !== undefined && data[row][1] !== "" && data[row][1] !== NaN) && data[row][5].length !== 10) {
                        cellProperties.readOnly = false
                        
                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          // Llama al renderer de texto base de Handsontable
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          // Aplica el estilo a la celda
                          td.style.backgroundColor = readonlyStyle.backgroundColor;
                          td.title = 'Subpartida no existe, por favor digite una de 10 digito'; 
                        };
                      } else {
                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          // Llama al renderer de texto base de Handsontable
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          // Aplica el estilo a la celda
                          td.style.backgroundColor = reset.backgroundColor;
                          td.title = ''; 
                        };
                        
                        cellProperties.readOnly = true


                      }
                      
                      if (data[row][0] !== "" && (data[row][1] !== undefined || data[row][1] !== "" || data[row][1] !== NaN) && data[row][5].length !== 10 && data[row][5].length !== 0) {

                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          // Llama al renderer de texto base de Handsontable
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          // Aplica el estilo a la celda
                          td.style.backgroundColor = editableStyle.backgroundColor;
                        };
                      }
                      
                    }
                    if (col === 0) {
                      if (data[row][0] !== "" && data[row][1] === undefined && data[row][0] !== undefined && data[row][0] !== NaN && data[row][0] !== null) {
                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          // Llama al renderer de texto base de Handsontable
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          // Aplica el estilo a la celda
                          td.style.backgroundColor = readonlyStyle.backgroundColor;
                          td.title = 'Posicion no registrada'; 
                        };
                      }
                    }
                    if(col === 2 || col == 3){
                      if(data[row][1] !== "" && data[row][1] !== NaN && data[row][1] !== undefined && data[row][1] !== null){
                        cellProperties.readOnly = false

                      }else{
                        cellProperties.readOnly = true
                      }
                    }

                    return cellProperties;
                  }}
                  afterChange={async (changes, source) => {
                    if (source === 'edit' || source === 'CopyPaste.paste') {
                      const hot = hotTableRef.current.hotInstance;

                      // Mapa para agrupar los cambios por fila
                      const changesByRow = new Map();
                      
                      for (const change of changes) {
                        const [row, col, oldValue, newValue] = change;
                        const cellValue = newValue?.toString().trim();

                        

                        if (col === 0 && position != null && orderNumber.trim() !== '') {
                          changesByRow.set(row, cellValue);
                        }
                        if(col === 2 || col === 3 && (data[row][0] !== 0 && data[row][0] !== "" && data[row][0] !== NaN && data[row][0] !== null && data[row][0] !== undefined) &&  (data[row][3] !== 0 && data[row][3] !== "" && data[row][3] !== NaN && data[row][3] !== undefined && data[row][3] !== null) ){
                          if (!isNaN(data[row][2]) && !isNaN(data[row][3])) { // Verifica que ambos valores sean números
                            const result = data[row][2] * data[row][3]; // Realiza la operación (en este caso, suma)
                            hot.setDataAtRowProp(row, 4, formatMoney(parseFloat(result).toFixed(2))); // Establece el resultado en la Columna 3
                          } else {
                            hot.setDataAtRowProp(row, 4, ''); // Si no son números, limpia el valor
                          }
                        }
                      }
                      

                      // Procesar todos los cambios agrupados por fila
                      for (const [row, cellValue] of changesByRow.entries()) {
                        try {
                          const pos = data[row][0];
                          const records = await getRecord(orderNumber, pos);

                          if (records) {
                            const { material_code, unit_price } = records;
                            const materialDetails = await getMaterial(material_code);
                            const subheading = materialDetails?.subheading || '';

                            // Configura la celda como editable o no editable
                            hot.setCellMeta(row, 5, 'readOnly', !subheading);

                            hot.setDataAtRowProp(row, 1, material_code);
                            
                            if(subheading !== "" && subheading !== undefined && subheading !== null && subheading !== NaN && subheading !== 0 && subheading !== " "){
                              hot.setDataAtRowProp(row, 5, "**********");
                            }else{
                              hot.setDataAtRowProp(row, 5, subheading);
                            }
                            

                            setfactunitprice(unit_price);
                            setfacttotalvalue(cellValue * unit_price);
                          } else {
                            console.warn(`No matching record found for row ${row}`);
                          }
                        } catch (error) {
                          console.error(`Error processing records for row ${row}:`, error);
                        }
                      }

                      

                    }
                  }}




                  contextMenu={{
                    items: {
                      'copy': { name: 'Copiar' },
                      'cut': { name: 'Cortar' },
                      'fill_column': {
                        name: 'Llenar toda la columna desde...',
                        callback: (key, selection) => {
                          const hot = hotTableRef.current.hotInstance;
                          const colIndex = selection[0].start.col;
                          const rowIndex = selection[0].start.row;
                          const value = prompt('Ingrese el valor para llenar la columna:', 'Valor');
                          if (value !== null) {
                            for (let i = rowIndex; i < hot.countRows(); i++) {
                              hot.setDataAtCell(i, colIndex, value);
                            }
                          }
                        }
                      },
                      'clear_column_from_cell': {
                        name: 'Eliminar toda la columna desde...',
                        callback: (key, selection) => {
                          const hot = hotTableRef.current.hotInstance;
                          const colIndex = selection[0].start.col;
                          const rowIndex = selection[0].start.row;
                          for (let i = rowIndex; i < hot.countRows(); i++) {
                            hot.setDataAtCell(i, colIndex, null);
                          }
                        }
                      },
                      'separator': Handsontable.plugins.ContextMenu.SEPARATOR,
                      'undo': { name: 'Deshacer' },
                      'redo': { name: 'Rehacer' }
                    }
                  }}
                />
              </Box>
              <Button mt={1} height="5%" onClick={handleSubmit}>Asociar</Button>
            </div>
    );
}