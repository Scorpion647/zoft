import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Alert,Switch,Tooltip, Select, ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure } from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, CheckCircleIcon, DownloadIcon, AtSignIcon, AttachmentIcon, CalendarIcon, CheckIcon, CloseIcon, AddIcon, ArrowBackIcon } from "@chakra-ui/icons";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { getRecords, getMaterial, getMaterials, getRecordsInfo, getSupplier, insertRecordInfo, getRecord, updateMaterial, updateRecord } from '@/app/_lib/database/service';
import { TbRuler2Off } from "react-icons/tb";
import { GiButterflyKnife } from "react-icons/gi";
import { getRole } from "../_lib/supabase/server";



function formatMoney(amount) {
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
  }

export const Associate_invoice = ({ setisTable, isTable, sharedState, updateSharedState }) =>{






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

        let cleanedValue = value.replace('$', '');
    

        cleanedValue = cleanedValue.replace(/\./g, '');
    

        cleanedValue = cleanedValue.replace(',', '.');
    
        return cleanedValue;
    }
    
    
    
    
      
    
    
    
    
    
    
    
      
    
      
    
    
    
    
    
    
    
    
    
    
    
      
    
    
    
    
    
      
    
    
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
       if (!value) {
        return '';
    }
    let formattedValue = value.replace(/[\$\s]/g, '');
    
    formattedValue = formattedValue.replace(/\./g, '').replace(/,/g, '.');
    
    const decimalMatch = formattedValue.match(/^(\d+)\.(\d{2})$/);
    
    if (decimalMatch) {
        if (decimalMatch[2] === '00') {
            return decimalMatch[1];
        }
        return formattedValue;
    }
    
    const splitValue = formattedValue.split('.');
    let intValue = splitValue[0];
    let decimalValue = splitValue[1] || '';
    
    if (decimalValue.length > 2) {
        decimalValue = decimalValue.slice(0, 2);
    } else if (decimalValue.length < 2) {
        decimalValue = decimalValue.padEnd(2, '0');
    }
    
    formattedValue = `${intValue}.${decimalValue}`;
    
    if (decimalValue === '00') {
        return intValue;
    }
    
    return formattedValue;
    }
    const debounceTimeoutRef = useRef(null);
    const debounceTimeoutRef1 = useRef(null);

    useEffect(() => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
  
      debounceTimeoutRef.current = setTimeout(() => {
        if (orderNumber) {
          clearRowsWithValuesInColumn0();
        }
      }, 700); 
  
      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }, [orderNumber, sharedState.TRM]); 





    useEffect(() => {
      if (debounceTimeoutRef1.current) {
        clearTimeout(debounceTimeoutRef1.current);
      }
  
      debounceTimeoutRef1.current = setTimeout(() => {
        if (orderNumber) {
       
          if (orderNumber.trim() !== '') {
            setIsLoading(true);
        
            getRecords(1, 40000) 
              .then((data) => {
                if (Array.isArray(data)) {
                  const matchingRecords = data
                    .map(record => record.purchase_order)
                    .filter((value, index, self) => 
                      self.indexOf(value) === index && value.includes(orderNumber) 
                    );
        
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
        }
      }, 500);
      return () => {
        if (debounceTimeoutRef1.current) {
          clearTimeout(debounceTimeoutRef1.current);
        }
      };
    }, [orderNumber]); 

    

    const clearRowsWithValuesInColumn0 = async () => {
      const hot = hotTableRef.current.hotInstance;
      const data = hot.getData();
  
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
          const row = data[rowIndex];
          const pos = row[0];
  
          try {
              if (!orderNumber || pos == null) {
                  console.warn('Parámetros inválidos:', { orderNumber, pos });
                  continue;
              }
  
              const records = await getRecord(orderNumber, pos);
              const revi = await getRecord(orderNumber,1)
              
              
  
              if (records && !('message' in records)) {
                  const hola = Number(records.item);
                  const hola1 = Number(revi.item);
                  console.log("este es el item:",hola1)
                  if (row[0]) {
                      if(hola === Number(row[0])){
                        const { material_code, unit_price, quantity } = records;
                      if (quantity > 0) {
                          const materialDetails = await getMaterial(material_code);
                          const subheading = materialDetails?.subheading || '';
  
                          hot.setDataAtRowProp(rowIndex, 1, material_code);
  
                          if (subheading !== "" && subheading !== undefined && subheading !== null && subheading !== NaN && subheading !== 0 && subheading !== " ") {
                              hot.setDataAtRowProp(rowIndex, 5, "**********");
                          } else {
                              hot.setDataAtRowProp(rowIndex, 5, subheading);
                          }
                          if(sharedState.TRM){
                            hot.setDataAtCell(rowIndex, 3, String(unit_price));
                          }else {
                            hot.setDataAtCell(rowIndex, 3, "");
                            hot.setDataAtCell(rowIndex, 4, "");
                          }
                          
                      }
                      } else if(hola1 === 1){
                          hot.setDataAtCell(rowIndex, 0, ""); 
                      }
                  } 
              } else {
                  console.log('Error en records:');
              }
          } catch (error) {
              console.log('Error en el procesamiento de fila:');
          }
      }
  };
  
  













    
  
  
  












  

















  




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
        const cellValue = data[coords.row]?.[coords.col]?.toString().trim();
        const pos = data[coords.row]?.[0]?.toString().trim();
        const quanti = parseInt(data[coords.row]?.[2]?.toString().trim(), 10);
    
        const records = await getRecord(orderNumber,pos);

    
  
            const matchedRecord = records
    
            if ((records.item !== 0 && records.item !== "" && records.item !== null && records.item !== undefined && records.item !== NaN) && (pos !== 0 && pos !== "" && pos !== undefined && pos !== NaN && pos !== null)) {
                const { material_code, currency, description, supplier_id, quantity } = matchedRecord;
                const unit_price = convertCommaToDot(data[coords.row]?.[3]?.toString().trim());
                const supplier = await getSupplier(supplier_id);

                updateSharedState('descripcion', description);
                updateSharedState('proveedor', supplier.name);
                updateSharedState('cantidadoc', quantity);
                updateSharedState('preciouni', unit_price);
                updateSharedState('moneda', currency);
    
                const factorPrice = sharedState.TRM
                    ? unit_price * sharedState.valorTRM
                    : unit_price;
    
                const totalPrice = factorPrice * quanti;
    
                updateSharedState('factunit', factorPrice);
                updateSharedState('facttotal', totalPrice || 0);
    
                const columnSum = sharedState.columnSum || 1; 
                const percentage = ((data[coords.row]?.[2] || 0) / columnSum) * 100;
    
                updateSharedState('cantidadespor', percentage.toFixed(2));
    
                const pesoTotal = sharedState.pesototal || 0;
                const pesoPor = (percentage * pesoTotal / 100).toFixed(2);
                updateSharedState('pesopor', isNaN(pesoPor) ? 0 : pesoPor);
    
                const factor = (percentage * pesoTotal / 100 / (data[coords.row]?.[2] || 1)).toFixed(8);
                updateSharedState('factor', factor);
    
                const bulto = (percentage * (sharedState.bultos || 0) / 100).toFixed(3);
                updateSharedState('bulto', bulto);
            } else {
                updateSharedState('descripcion', "NaN");
                updateSharedState('cantidadoc', 0);
                updateSharedState('facttotal', 0);
            }
    
            const totalSum = data.reduce((sum, row) => {
                const unip = parseFloat(row[3]) || 0;
                const can = parseFloat(row[2]) || 0;
                return unip > 0 && can > 0 ? sum + (unip * can) : sum;
            }, 0);
    
            updateSharedState('totalfactura', formatMoney(totalSum.toFixed(2)));
    
            updateSharedState('SelectedCellValue', cellValue);
            setLastClickTime(currentTime);
        
    };
    





    
      

    const handleSubmit = async () => {

      const userConfirmed = window.confirm('¿Estás seguro de que deseas realizar la siguiente asociacion de factura?');
  
      if (!userConfirmed) {

          return;
      }
  
      const hotInstance = hotTableRef.current?.hotInstance;
      if (!hotInstance) {
          console.error('Handsontable instance has been destroyed or is not available.');
          return;
      }
  
      const tableData = hotInstance.getData();
      const records = [];
      const update = [];
      const seenPositions = new Set();
      const duplicatePositions = new Map();
      const incompleteRows = [];
  
      let hasCompleteRow = false;
  
      for (const [index, row] of tableData.entries()) {
          const isEmptyRow = row.every(cell => cell === null || cell === '' || cell === undefined);
  
          if (isEmptyRow) continue;
  
          const [record_position, material_code, billed_quantity, bill_number,, subheading] = row;
  
          if ((record_position && material_code && bill_number && billed_quantity && subheading) !== undefined && (record_position && material_code && bill_number && billed_quantity && subheading) !== null) {
              hasCompleteRow = true;
  
              const pos = hotInstance.getDataAtCell(index, 0);
              const matchedRecord = await getRecord(orderNumber, pos);
  
              if (!matchedRecord) {
                  console.error(`No record found for position ${pos}`);
                  continue;
              }
  
              const { id, unit_price, material_code, quantity } = matchedRecord;
              const material = await getMaterial(material_code);
  
              let factunitprice = 0;
              let totalprice = 0;
              totalprice = ((parseFloat(hotInstance.getDataAtCell(index, 3)).toFixed(2)) * parseFloat(hotInstance.getDataAtCell(index, 2))).toFixed(2);
              factunitprice = parseFloat(hotInstance.getDataAtCell(index, 3));
  
              let Trm = sharedState.TRMNUM;
              const gross = ((((((hotInstance.getDataAtCell(index, 2)) / sharedState.columnSum) * 100)) * sharedState.pesototal) / 100).toFixed(9);
              const packag = (((((hotInstance.getDataAtCell(index, 2) / sharedState.columnSum) * 100)) * (sharedState.bultos)) / 100).toFixed(9);
              let conver = sharedState.TRM ? 1 : 0;
  
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
                      gross_weight: gross,
                      packages: packag,
                      record_id: id,
                      trm: Trm,
                      conversion: conver,
                  };
  
                  const purchase_order = orderNumber;
                  const item = pos;
                  const new_data = {
                      quantity: quantity - billed_quantity,
                  };
  
                  console.log("Prepared update record:", { purchase_order, item, new_data });
  
                  if (purchase_order && item && new_data) {
                      update.push({ purchase_order, item, new_data });
                  } else {
                      console.error("Incomplete data for update:", { purchase_order, item, new_data });
                  }
  
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
              console.log("Updating record:", update);
  
              const { purchase_order, item, new_data } = update.shift();
  
              console.log("Before updateRecord - purchase_order:", purchase_order);
              console.log("Before updateRecord - item:", item);
              console.log("Before updateRecord - new_data:", new_data);
  
              const updat = await updateRecord(purchase_order, item, new_data);
  
              if (updat instanceof Error) {
                  alert(`Error al actualizar el registro para la posición ${record.record_position}: ${updat.message}`);
                  success = false;
              } else {
                  console.log(`Registro para la posición ${record.record_position} almacenado y actualizado correctamente.`);
              }
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

              <HStack position="relative" width="100%" height="20%" >
                
                <VStack width="25%">
                <HStack width="100%" height="20px" textAlign="start" align="start" justify="start">
                <Button  onClick={() => setisTable(false)} width="30%" height="100%"  colorScheme='teal' backgroundColor='#F1D803'>
                        <ArrowBackIcon w={3} h={3} color='black' />
                      </Button>
            
                  </HStack>
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
              <HStack height="7%" spacing={3}>
                <HStack padding="1"  spacing={3} width="60%"><Text className=" font-bold  "  fontSize="90%">Proveedor</Text><Text fontSize="90%">{sharedState.proveedor}</Text>
            </HStack>
                
                <HStack width="40%" align="end" justify="end">
                <Text  fontSize="90%" className=" font-bold">Valor Total de la Factura</Text>
                <Text  fontSize="90%">{formatMoney(parseFloat(sharedState.totalfactura))}</Text>
                </HStack>
                </HStack>
              <Box height="68%" width="100%" overflow="auto" >
                <HotTable
                  ref={hotTableRef}
                  className="relative z-0"
                  data={data}
                  colWidths={[50, 150, 50, 110, 110 , 100]}
                  rowHeaders={false}     
                  licenseKey="non-commercial-and-evaluation"
                  columns={columns}
                  stretchH='all'
                  dropdownMenu={true}
                  copyPaste={true}
                  manualColumnResize={true}
                  manualRowResize={true}
                  hiddenColumns={{ indicators: true }}
                  afterOnCellMouseDown={handleCellDoubleClick}
                  afterRenderer={(TD, row, col, prop, value, cellProperties) => {

                    
                  }}
                  beforeChange={(changes, source) => {
                    const hot = hotTableRef.current.hotInstance;
                    
                    if (changes) {
                        hot.batch(() => {
                            for (const change of changes) {
                                const [row, col, oldValue, newValue] = change;
                
                                calculateColumnSum();
                                
                                if (col === 3) {
                                    const formattedValue = handleChange(newValue);
                                    if (formattedValue !== newValue) {
                                        if (Array.isArray(change) && change.length > 3) {
                                            change[3] = formattedValue;
                                        } else {
                                            console.error("Formato de `change` inesperado o inválido", change);
                                        }
                                    }
                                }
                
                                if (col === 0) {
                                    if (newValue === undefined || newValue === "" || newValue === NaN || newValue === null) {
                                        hot.setDataAtRowProp(row, 1, "");
                                        hot.setDataAtRowProp(row, 2, "");
                                        hot.setDataAtRowProp(row, 3, "");
                                        hot.setDataAtRowProp(row, 4, "");
                                        hot.setDataAtRowProp(row, 5, "");
                                    }
                                }
                            }
                        });
                    }
                
                    return true;
                }}
                
                
                  cells={(row, col, prop) => {
                    const cellProperties = {};
                    const editableStyle = { backgroundColor: '#FFFF00' }; 
                    const readonlyStyle = { backgroundColor: '#f5c6c6' }; 
                    const reset = { backgroundColor: '' }; 


     
                    if (col === 5) { 


                      if (data[row][0] !== "" && (data[row][1] !== undefined && data[row][1] !== "" && data[row][1] !== NaN) && data[row][5].length !== 10) {
                        cellProperties.readOnly = false
                        
                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {

                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          td.style.backgroundColor = readonlyStyle.backgroundColor;
                          td.title = 'Subpartida no existe, por favor digite una de 10 digito'; 
                        };
                      } else {
                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          td.style.backgroundColor = reset.backgroundColor;
                          td.title = ''; 
                        };
                        
                        cellProperties.readOnly = true


                      }
                      
                      if (data[row][0] !== "" && (data[row][1] !== undefined || data[row][1] !== "" || data[row][1] !== NaN) && data[row][5].length !== 10 && data[row][5].length !== 0) {

                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          td.style.backgroundColor = editableStyle.backgroundColor;
                        };
                      }
                      
                    }
                    if (col === 0) {
                      if (data[row][0] !== "" && (data[row][1] === undefined || data[row][1] === NaN || data[row][1] === "" || data[row][1] === null) && data[row][0] !== undefined && data[row][0] !== NaN && data[row][0] !== null) {
                        cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                          Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                          td.style.backgroundColor = readonlyStyle.backgroundColor;
                          td.title = 'Posicion no registrada'; 
                        };
                      }
                    }
                    if(col === 2 || (col === 3 && sharedState.TRM === false)){
                      if(data[row][1] !== "" && data[row][1] !== NaN && data[row][1] !== undefined && data[row][1] !== null){
                        cellProperties.readOnly = false

                      }else{
                        cellProperties.readOnly = true
                      }
                    }
                    if(col === 3 && sharedState.TRM === true){
                      cellProperties.readOnly = true
                    }

                    return cellProperties;
                  }}
                  afterChange={async (changes, source) => {
                    
              

                    if (source === 'edit' || source === 'CopyPaste.paste') {
                        const hot = hotTableRef.current.hotInstance;
                
                        const changesByRow = new Map();
                
                        for (const change of changes) {
                            const [row, col, oldValue, newValue] = change;
                            const cellValue = newValue?.toString().trim();
                
                            if (col === 0 && position != null && orderNumber.trim() !== '') {
                                changesByRow.set(row, cellValue);
                            }
                
                            if ((col === 2 || col === 3) &&
                                (data[row][0] !== 0 && data[row][0] !== "" && data[row][0] !== NaN && data[row][0] !== null) &&
                                (data[row][3] !== 0 && data[row][3] !== "" && data[row][3] !== NaN && data[row][3] !== undefined && data[row][3] !== null)
                            ) {
                                if (!isNaN(data[row][2]) && !isNaN(data[row][3])) {
                                    const result = data[row][2] * data[row][3];
                                    hot.setDataAtRowProp(row, 4, formatMoney(parseFloat(result).toFixed(2)));
                                } else {
                                    hot.setDataAtRowProp(row, 4, '');
                                }
                            }
                            
                    
                        }
                
                        const promises = [];
                
                        for (const [row, cellValue] of changesByRow.entries()) {
                            promises.push((async () => {
                                try {
                                    const pos = data[row][0];
                                    const records = await getRecord(orderNumber, pos);
                
                                    if (Number(records.item) === Number(pos)) {
                                        const { material_code, unit_price, quantity } = records;
                                        if (quantity > 0) {
                                            const materialDetails = await getMaterial(material_code);
                                            const subheading = materialDetails?.subheading || '';
                
                                            hot.setCellMeta(row, 5, 'readOnly', !subheading);
                                            hot.setDataAtRowProp(row, 1, material_code);
                                            const hola = await getRole();
                                            console.log(hola)
                                            if (subheading !== "" && subheading !== undefined && subheading !== null && subheading !== NaN && subheading !== 0 && subheading !== " ") {
                                                hot.setDataAtRowProp(row, 5, "**********");
                                            } else {
                                                hot.setDataAtRowProp(row, 5, subheading);
                                            }
                                            if(sharedState.TRM === true){
                                              hot.setDataAtCell(row, 3, String(unit_price));
                                            }else {
                                              hot.setDataAtCell(row, 3, "");
                                              hot.setDataAtCell(row, 4, "");
                                              
                                            }

                
                                            setfactunitprice(unit_price);
                                            setfacttotalvalue(cellValue * unit_price);
                                        }
                                    } else {
                                        console.warn(`No matching record found for row ${row}`);
                                    }
                                } catch (error) {
                                    console.error(`Error processing records for row ${row}:`, error);
                                }
                            })());
                        }
                
                        await Promise.all(promises);
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
              <Button  mt={1} height="5%" onClick={handleSubmit}>Asociar</Button>
            </div>
    );
}