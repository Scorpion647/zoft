import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { getRecords, getRecordsInfo, updateRecordInfo, getRecordInfo, getMaterial, getSupplier, updateMaterial } from '@/app/_lib/database/service';
import { useDisclosure,VStack, Select, Box, HStack, Spinner, Text, Button,  Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalBody } from '@chakra-ui/react';
import {handleExport} from '@/app/_ui/ExportButton'


function formatMoney(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}



// Función `Material` optimizada
const Material = async (code, number) => {
  const material = await getMaterial(code);
  return number === 0 ? material.subheading : number === 1 ? material.measurement_unit : material.type;
};

// Función `Typematerial` optimizada
const Typematerial = (type) => {
  switch (type) {
    case 'national': return 'NACIONAL';
    case 'foreign': return 'EXTRANJERO';
    case 'nationalized': return 'NACIONALIZADO';
    case 'other': return 'OTRO';
    default: return 'INVALIDO';
  }}

const ReturnTable = ({ suppliers }) => {
  const hotTableRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [billNumberFilter, setBillNumberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isRecordComplete = (record) => {
    return record.record_id !== null &&
           record.bill_number &&
           record.trm !== null &&
           record.billed_quantity !== null &&
           record.billed_unit_price !== null &&
           record.billed_total_price !== null &&
           record.gross_weight !== null &&
           record.packages !== null &&
           record.status;
  };


  const handleExportar = async () => {
    if (hotTableRef.current) {
        const hotTableInstance = hotTableRef.current.hotInstance;
        const visibleData = hotTableInstance.getData(); 

        await onButtonClick(visibleData);
    }


};




const [totalpeso,setTotalpeso] = useState(0)

  const [filterValue, setFilterValue] = useState(''); // Estado del valor del filtro
  const [uniqueValues, setUniqueValues] = useState([]); // Valores únicos para el select
  const columnToFilter = 8; // Índice de la columna que queremos filtrar (columna 8)

  useEffect(() => {
    const unique = [...new Set(tableData.map(row => row[columnToFilter]))];
    setUniqueValues(unique);
  }, [totalpeso,filteredData]);





  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilterValue(value);

    if (value === '') {
      setFilteredData(tableData); // Mostrar todos los datos si no hay filtro
    } else {
      const newData = tableData.filter(row => row[columnToFilter] === value); // Filtrar datos
      setFilteredData(newData);
    }
  };









  const getMergeCells = () => {
    if(hotTableRef.current !== null && hotTableRef.current.hotInstance !== undefined){
      const hotInstance = hotTableRef.current.hotInstance;
    const data = hotInstance.getData();  // Suponiendo que 'tableData' contiene los datos de tu tabla
    const mergeCells = [];
    let startRow = null;
    let lastValue8 = null;
    let lastValue20 = null;
  
    for (let row = 0; row < data.length; row++) {
      const value8 = data[row][8];
      const value20 = data[row][20];
  
      // Comprobar si estamos en una nueva serie de filas que deben combinarse
      if (value8 === lastValue8 && value20 === lastValue20) {
        if (startRow === null) {
          startRow = row - 1; // Empezar a combinar desde la fila anterior
        }
      } else {
        // Si terminamos un grupo, añadirlo a mergeCells
        if (startRow !== null) {
          mergeCells.push({ row: startRow, col: 20, rowspan: row - startRow, colspan: 1 });
  
          // Rellenar los valores para todas las celdas en este grupo
          for (let i = startRow + 1; i < row; i++) {
            data[i][20] = data[startRow][20];  // Copiar el valor de la celda combinada a todas las filas
          }
  
          startRow = null; // Reiniciar para el siguiente grupo
        }
      }
  
      lastValue8 = value8;
      lastValue20 = value20;
    }
  
    // Añadir el último grupo si hay uno abierto al final de la tabla
    if (startRow !== null) {
      mergeCells.push({ row: startRow, col: 20, rowspan: data.length - startRow, colspan: 1 });
  
      // Rellenar los valores para todas las celdas en este último grupo
      for (let i = startRow + 1; i < data.length; i++) {
        data[i][20] = data[startRow][20];  // Copiar el valor de la celda combinada a todas las filas
      }
    }
  
    return mergeCells;
    }
  };
  
  

  const fetchData = async () => {
    setIsLoading(true);
  
    try {
      const matchingRecords = await getRecords(1, 100, suppliers);
      if (!Array.isArray(matchingRecords)) throw new Error('Error fetching records');
  
      const recordIds = matchingRecords.map(record => record.id);
      const recordDetails = await Promise.all(recordIds.map(id => getRecordInfo(id))).then(res => res.flat());
      
      // Eliminar duplicados por `record_id` utilizando un mapa
      const uniqueRecordDetails = Array.from(new Map(recordDetails.map(record => [record.record_id, record])).values());
      
      // Filtrar registros completos y ordenar
      const completeData = uniqueRecordDetails.filter(isRecordComplete).sort((a, b) => a.bill_number.localeCompare(b.bill_number));
  
      // Cache para almacenar resultados de material y evitar solicitudes redundantes
      
  
      // Obtener materiales y proveedores en paralelo
      const materialsPromises = completeData.map(async (record) => {
        const relatedRecord = matchingRecords.find((r) => r.id === record.record_id);
        const supplier = await getSupplier(relatedRecord.supplier_id);
  
        // Obtener información del material y verificar material nacional
        const materialInfo = await Promise.all([0, 1, 2].map((num) => Material(relatedRecord.material_code, num)));
        let [subheading, unitt, tipo] = materialInfo;
        let code = relatedRecord.material_code;
  
        const materialNational = await getMaterial(`${relatedRecord.material_code}-N`);
        if (materialNational?.code) {
          code = materialNational.code;
          subheading = materialNational.subheading || subheading;
          unitt = materialNational.measurement_unit || unitt;
          tipo = materialNational.type || tipo;
  
          // Actualizar el tipo de material si es necesario
          if (!materialNational.type) await updateMaterial(materialNational.code, { type: "national" });
        }
        let status = "hola"
        if(record.status === "pending"){
          status = "Pendiente"
        }else if(record.status === "approved"){
          status = "Aprobado"
        }else if(record.status === "rejected"){
          status = "Rechazado"
        }
        // Calcular la conversión
        const conversion = (unitt === 'KG' || unitt === 'KGM') ? parseFloat((record.gross_weight / record.billed_quantity).toFixed(8)) : (['U', 'L'].includes(unitt) ? 1 : 0);
  
        return [
          relatedRecord.purchase_order || '',
          relatedRecord.item || '',
          code || '',
          relatedRecord.description || '',
          record.billed_quantity || 0,
          relatedRecord.measurement_unit || '',
          supplier.name || '',
          parseFloat(((record.billed_unit_price / 100) / record.trm).toFixed(8)) || 0,
          record.bill_number || '',
          subheading || '',
          unitt || '',
          record.trm || 0,
          formatMoney(parseFloat((record.billed_unit_price / 100) / record.trm) * record.billed_quantity) || '',
          formatMoney(record.billed_unit_price / 100) || '',
          formatMoney((record.billed_unit_price / 100) * record.billed_quantity) || '',
          Typematerial(tipo) || '',
          record.gross_weight || 0,
          record.gross_weight || 0,
          record.packages || 0,
          conversion || 0,
          status || ''
        ];
      });
  
      const formattedData = await Promise.all(materialsPromises);
      console.log("Formatted Data:", formattedData);
      setTableData(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setHotInstances(true);
      setIsLoading(false);
      handleAfterChange();
    }
  };
  


  const [isAnyCellSelected, setIsAnyCellSelected] = useState(false);



  function handleChange(value) {
    if (!value) {
     return '';
 }
 let formattedValue = value.replace(/[\$\s]/g, '');
 
 formattedValue = formattedValue.replace(/\,/g, '').replace(/,/g, '.');
 
 const decimalMatch = formattedValue.match(/^(\d+)\.(\d{2})$/);
 
 if (decimalMatch) {
     if (decimalMatch[2] === '00') {
         return decimalMatch[1];
     }
     return formattedValue;
 }
 
 const splitValue = formattedValue.split(',');
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
  

 const onButtonClick = async (visibledata) => {
      
    
    
  setIsLoading1(true);
    setError(null);
    onOpen();

    try {
        await handleExport(visibledata);
    } catch (err) {
        setError('Error al generar el archivo CSV.');
    } finally {
        setIsLoading1(false);
        onClose();
    }
};





  const [hotInstances, setHotInstances] = useState(null);
  const [totalCop,setTotalCop] = useState(0)
  const [totalbultos,setTotalbultos] = useState(0)
  
  const handleAfterChange = () => {
    if (hotTableRef.current) {
      const hotInstance = hotTableRef.current.hotInstance;
    const data = hotInstance.getData();
  
    // Función genérica para calcular la suma de una columna
    const calculateColumnSum = (columnIndex) => {
      return data.reduce((acc, row) => acc + (parseFloat(row[columnIndex]) || 0), 0);
    };
  
    // Cálculo de los totales
    const totalSum = calculateColumnSum(14);
    const totalSum1 = calculateColumnSum(16);
    const totalSum2 = calculateColumnSum(18);
  
    // Actualización de los estados
    setTotalpeso(totalSum1);
    setTotalbultos(totalSum2);
    setTotalCop(totalSum);

    } else {
      console.error('HotTable instance is not available.');
    }
  };





    const { isOpen, onOpen, onClose } = useDisclosure();
    const [error, setError] = useState(null);



  useEffect(() => {
    fetchData();
  }, [suppliers]);

  useEffect(() => {
    console.log("Table Data:", tableData);
  
    const newFilteredData = tableData.map(({ original, display }) => display)
      .filter(row => {
        console.log("Row Before Filter:", row); // Verifica cada fila antes del filtrado
        return (
          row &&
          row.length > 8 && // Asegúrate de que cada fila tenga al menos 8 elementos
          (billNumberFilter === 'all' || row[0] === billNumberFilter) &&
          (statusFilter === 'all' || row[20] === statusFilter)
        );
      });
  
    console.log("Filtered Data:", newFilteredData); // Verifica el resultado del filtrado
  
    setFilteredData(newFilteredData);
  }, [billNumberFilter, statusFilter]);
  

  const uniqueBillNumbers = useMemo(() => {
    // Filtrar los elementos que tienen display y display[0]
    const billNumbers = tableData
      .filter(({ display }) => Array.isArray(display) && display[0] !== undefined)
      .map(({ display }) => display[0]);
    return [...new Set(billNumbers)];
  }, [tableData]);
  
  const uniqueStatuses = useMemo(() => {
    // Filtrar los elementos que tienen display y display[7]
    const statuses = tableData
      .filter(({ display }) => Array.isArray(display) && display[20] !== undefined)
      .map(({ display }) => display[7]);
    return [...new Set(statuses)];
  }, [tableData]);
  

  const handleUpdate = async () => {
    try {
      const hotInstance = hotTableRef.current.hotInstance;
      const updatedData = hotInstance.getData();
  
      // Mapea los datos de la tabla actualizados y los datos originales
      const updates = tableData.map((entry, index) => {
        // Verifica si la fila existe y si tiene suficientes columnas
        const row = updatedData[index];
        if (row && row.length > 20) {
          const updatedStatus = row[20];
  
          // Verifica si el estado ha cambiado
          if (entry.original && entry.original.status !== updatedStatus) {
            // Preparar el update solo si el estado ha cambiado
            return {
              recordId: entry.original.record_id,
              newStatus: updatedStatus
            };
          }
        }
        return null; // Ignora las filas que no han cambiado
      }).filter(update => update !== null); // Filtra las actualizaciones válidas
  
      // Realiza las actualizaciones en paralelo
      const updatePromises = updates.map(async ({ recordId, newStatus }) => {
        console.log(`Updating record ${recordId} with status ${newStatus}`);
        return await updateRecordInfo(recordId, { status: newStatus });
      });
  
      await Promise.all(updatePromises);
      alert('Registros actualizados exitosamente');
      fetchData(); // Refresca los datos después de la actualización
    } catch (error) {
      console.error('Error actualizando registros:', error);
      alert('Hubo un problema al actualizar los registros.');
    }
  };
  const [mergeCellsConfig, setMergeCellsConfig] = useState([]); // Estado para almacenar la configuración de mergeCells
  
    // useEffect que se ejecuta solo una vez en el montaje del componente
    useEffect(() => {
      const initialMergeCells = getMergeCells(); // Calcula mergeCells solo una vez
      setMergeCellsConfig(initialMergeCells); // Establece la configuración de mergeCells en el estado
    }, [isLoading]); // Array vacío como segundo argumento asegura que solo se ejecute una vez
  
  

  const changeSelectedStatus = (status) => {
    const hotInstance = hotTableRef.current.hotInstance;
    const selected = hotInstance.getSelected();
  
    if (selected) {
      hotInstance.batch(() => {
        selected.forEach(([row1, col1, row2, col2]) => {
          if (col1 <= 7 && 7 <= col2) {
            const startRow = Math.max(row1, 0);
            const endRow = Math.min(row2, hotInstance.countRows() - 1);
  
            for (let row = startRow; row <= endRow; row++) {
              const currentStatus = hotInstance.getDataAtCell(row, 7);
              if (currentStatus !== status) {
                hotInstance.setDataAtCell(row, 7, status);
              }
            }
          }
        });
      });
    }
  };
  

  return (
    <div className='items-center justify-self-center h-[400px] w-full'>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="450">
          <Spinner size="xl" />
          <Text ml={4}>Cargando registros...</Text>
        </Box>  
      )}
      {!isLoading && (
        <>
          <HStack mb={3}>
          <Select value={filterValue} onChange={handleFilterChange}>
        <option value="">Todos</option>
        {uniqueValues.map((value, index) => (
          <option key={index} value={value}>
            {value}
          </option>
        ))}
      </Select>
            <Button
              width="40%"
              onClick={handleExportar}
              bgColor="#F1D803"
              variant="solid"
              colorScheme='teal'
              textColor="black" 
            >
              Export
            </Button>
            
          </HStack>
          <HStack align="center" justify="center"> 
          <HStack align="center" justify="center" width="25%">
          <Text fontSize="80%">Peso Total: </Text>
          <Text fontSize="80%">{parseFloat((totalpeso).toFixed(2))}</Text>
          </HStack>
          <HStack align="center" justify="center" width="25%">
          <Text fontSize="80%">Bultos Totales: </Text>
          <Text fontSize="80%">{parseFloat((totalbultos).toFixed(0))}</Text>
          </HStack>
          <HStack align="center" justify="center" width="50%">
          <Text fontSize="80%">{formatMoney(totalCop)}</Text>
          </HStack>
          </HStack>
          <VStack alignItems="center" align="center" justify="center" className='bg-gray-300'>


          <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Exportando CSV</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {isLoading1 ? 'Generando archivo...' : 'Archivo generado exitosamente.'}
                        {error && <p className="text-red-500">{error}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <HotTable
              ref={hotTableRef}
              data={filteredData}
              className="relative z-0"
              columns={[
                { data: 0, readOnly: true, title: 'OC' },
                { data: 1, readOnly: true, title: 'ITEMS' },
                { data: 2, readOnly: true, title: 'CODIGO' },
                { data: 3, readOnly: true, title: 'DESCRIPCION' },
                { data: 4, readOnly: true, title: 'CANT' },
                { data: 5, readOnly: true, title: 'UND' },
                { data: 6, readOnly: true, title: 'PROVEEDOR' },
                { data: 7, readOnly: true, title: 'FOB UNIT' },
                { data: 8, readOnly: true, title: 'FACTURA' },
                { data: 9, readOnly: true, title: 'PA' },
                { data: 10, readOnly: true, title: 'UC' },
                { data: 11, readOnly: true, title: 'TRM' },
                { data: 12, readOnly: true, title: 'FOB' },
                { data: 13, readOnly: true, title: 'COP UNIT' },
                { data: 14, readOnly: true, title: 'COP TOTAL' },
                { data: 15, readOnly: true, title: 'TIPO' },
                { data: 16, readOnly: true, title: 'PB' },
                { data: 17, readOnly: true, title: 'PN' },
                { data: 18, readOnly: true, title: 'Bultos' },
                { data: 19, readOnly: true, title: 'Conversion' },
                { data: 20, width: 100, type: 'dropdown', title: 'Estado', source: ['Pendiente', 'Aprobado', 'Rechazado'] }
              ]}
              rowHeaders={true}
              mergeCells={mergeCellsConfig}
              width="100%"
              height="390"
              stretchH="all"
              licenseKey="non-commercial-and-evaluation"
              afterDeselect={() => {
                const hotInstance = hotTableRef.current.hotInstance;
                const data = hotInstance.getData();
                const columnIndex14 = 14;
                const columnIndex16 = 16;
                const columnIndex18 = 18;
              
                let totalSum = 0;
                let totalSum1 = 0;
                let totalSum2 = 0;
              
                data.forEach(row => {
                  totalSum += parseFloat(handleChange(row[columnIndex14])) || 0;
                  totalSum1 += parseFloat(row[columnIndex16]) || 0;
                  totalSum2 += parseFloat(row[columnIndex18]) || 0;
                });
              
                setTotalpeso(parseFloat((totalSum1).toFixed(2)));
                setTotalbultos(parseFloat((totalSum2).toFixed(0)));
                setTotalCop(totalSum);
              }}
              afterOnCellMouseDown={(event, coords) => {
                const { row, col } = coords;
              
                if (col !== 20) { // Solo ejecuta la lógica si la celda pertenece a la columna A
                  const hotInstance = hotTableRef.current.hotInstance;
                  const valueInColumnA = hotInstance.getDataAtCell(row, 8); // Valor en columna A de la fila seleccionada
              
                  let sum1 = 0;
                  let sum2 = 0;
                  let sum3 = 0;

                  
               
                    const totalSum1 = tableData.reduce((sum, row) => {
                      if(row[8] === valueInColumnA){
                        const unip = parseFloat(row[16]) || 0;
                        const unip2 = parseFloat(row[18]) || 0;
                        const unip3 = parseFloat(handleChange(row[14])) || 0;
                       sum1 = sum1 + unip;
                       sum2 = sum2 + unip2;
                       sum3 = sum3 + unip3;
                      }
                  }, 0);
                 
                setTotalpeso(parseFloat((sum1).toFixed(2)));
                setTotalbultos(parseFloat((sum2).toFixed(0)));
                setTotalCop(sum3);
                  
                      
                    
                  
              

                }
              }}
              
              

              cells={(row, col, prop) => {
                const cellProperties = {};
                const editableStyle = { backgroundColor: '#EFFF82' };
                const readonlyStyle = { backgroundColor: '#f5c6c6' };
                const reset = { backgroundColor: '' };



    // Aplicar estilos en línea para centrar el texto
                // Aplicar estilos en línea para centrar el texto
     // Aplicar estilos en línea para centrar el texto


     cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
      Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
      td.style.textAlign = 'center';
      td.style.verticalAlign = 'middle';
      td.style.justifyContent = 'center';
      td.style.alignItems = 'center';
      td.style.height = '100%';

      // Determinar el valor en la columna 'STATUS' (columna 20)
      // Identificar el grupo de filas con el mismo valor en la columna STATUS

      const statusValue = hotInstance.getDataAtCell(row, 8);
      
      const rows = hotInstance.getData();
      const groupRows = [];

      // Encontrar todas las filas con el mismo valor en la columna STATUS
      for (let i = 0; i < rows.length; i++) {
        if (hotInstance.getDataAtCell(i, 8) === statusValue) {
          groupRows.push(i);
        }
      }

      // Verificar la posición de la fila en el grupo
      const isFirstRow = row === groupRows[0];
      const isLastRow = row === groupRows[groupRows.length - 1];

      // Aplicar los estilos de borde según la posición en el grupo
      td.style.borderLeft = '1px solid rgba(0, 0, 0, 0.5)';
      td.style.borderRight = '1px solid rgba(0, 0, 0, 0.5)';

      if (groupRows.length === 1) {
        // Caso de una sola fila en el grupo
        td.style.borderTop = '1px solid rgba(0, 0, 0, 0.5)';
        td.style.borderBottom = '1px solid rgba(0, 0, 0, 0.5)';
      } else {
        // Caso de más de una fila en el grupo
        if (isFirstRow) {
          td.style.borderTop = '1px solid rgba(0, 0, 0, 0.5)';
          td.style.borderBottom = 'none'; // No borde inferior en la primera fila
        } else if (isLastRow) {
          td.style.borderTop = 'none'; // No borde superior en la última fila
          td.style.borderBottom = '1px solid rgba(0, 0, 0, 0.5)';
        } else {
          td.style.borderTop = 'none'; // No borde superior para filas intermedias
          td.style.borderBottom = 'none'; // No borde inferior para filas intermedias
        }
      }

      // Ajustar estilos según el valor de STATUS
      if (col === 20) {
        if (value === "Pendiente") {
          td.style.backgroundColor = editableStyle.backgroundColor;
          td.title = 'Pendiente a revision';
        } else if (value === "Aprobado") {
          td.style.backgroundColor = reset.backgroundColor;
          td.title = '';
        } else if (value === "Rechazado") {
          td.style.backgroundColor = readonlyStyle.backgroundColor;
          td.title = '';
        }
      }
      if(col === 15){
        if(value !== "NACIONAL" && value !== "NACIONALIZADO" && value !== "INVALIDO"){
          td.style.backgroundColor = readonlyStyle.backgroundColor;
          td.title = 'Necesita revision';
        }else if(value === "INVALIDO"){
          td.style.backgroundColor = readonlyStyle.backgroundColor;
          td.title = 'Tipo no definido';
      }
    };
    }

                

                return cellProperties;
              } }
            />
          </VStack>
          
        </>
      )}
    </div>
  );
};

export default ReturnTable;











/*


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { getRecords, getRecordsInfo, getMaterial, getSupplier } from '@/app/_lib/database/service';
import { VStack, Select, Box, HStack, Spinner, Text, Button } from '@chakra-ui/react';

function formatMoney(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseMoney(amount) {
  return parseFloat(amount.replace(/[^0-9.-]+/g, ''));
}

const Material = async (code, number) => {
  const material = await getMaterial(code);
  if (number === 0) return material.subheading;
  if (number === 1) return material.measurement_unit;
  if (number === 2) return material.type;
};

const Typematerial = (type) => {
  if (type === 'national') return 'NACIONAL';
  if (type === 'foreign') return 'EXTRANJERO';
  return 'OTRO';
};

const ReturnTable = ({ suppliers }) => {
  const hotTableRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [billNumberFilter, setBillNumberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isRecordComplete = (record) => {
    return record.record_id !== null &&
           record.bill_number &&
           record.trm !== null &&
           record.billed_quantity !== null &&
           record.billed_unit_price !== null &&
           record.gross_weight !== null &&
           record.packages !== null &&
           record.status;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log(suppliers.code)
    const allRecords = await getRecords(1, 1000);
    
    const allRecordDetails = await getRecordsInfo(1, 1000);

    const supplierCode = suppliers;

    const filteredRecords = allRecords.filter(record =>
      record.purchase_order === supplierCode
    );

    const filteredRecordIds = filteredRecords.map(record => record.id);

    const filteredRelatedData = allRecordDetails.filter(detail =>
      filteredRecordIds.includes(detail.record_id)
    );

    const sortedData = filteredRelatedData.sort((a, b) =>
      a.bill_number.localeCompare(b.bill_number)
    );

    const materialsPromises = sortedData.map(async (record) => {
      const relatedRecord = allRecords.find((r) => r.id === record.record_id);
      const material = await Material(relatedRecord.material_code, 0);
      const unit = await Material(relatedRecord.material_code, 1);
      const type = await Material(relatedRecord.material_code, 2);
      const supplier = await getSupplier(relatedRecord.supplier_id);
      const conversion =
        record.unit === 'U'
          ? 1
          : parseFloat(
              (record.gross_weight / record.billed_quantity).toFixed(8)
            );

              return [
                  relatedRecord.purchase_order,
                  relatedRecord.item,
                  relatedRecord.material_code,
                  relatedRecord.description,
                  record.billed_quantity,
                  relatedRecord.measurement_unit,
                  supplier.name,
                  parseFloat(parseFloat((record.billed_unit_price / 100) / record.trm).toFixed(8)),
                  record.bill_number,
                  material,
                  unit,
                  record.trm,
                  formatMoney(parseFloat((record.billed_unit_price / 100) / record.trm) * record.billed_quantity),
                  formatMoney(record.billed_unit_price / 100),
                  formatMoney((record.billed_unit_price / 100) * record.billed_quantity),
                  Typematerial(type),
                  record.gross_weight,
                  record.gross_weight,
                  record.packages,
                  conversion,
                  record.status
              ];
          });

          const formattedData = await Promise.all(materialsPromises);
          setTableData(formattedData);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [suppliers]);

  useEffect(() => {
    const newFilteredData = tableData.filter(row =>
      (billNumberFilter === 'all' || row[8] === billNumberFilter) &&
      (statusFilter === 'all' || row[20] === statusFilter) 
    );
    setFilteredData(newFilteredData);
  }, [billNumberFilter, statusFilter, tableData]);

  const uniqueBillNumbers = useMemo(() => [...new Set(tableData.map(row => row[8]))], [tableData]);
  const uniqueStatuses = useMemo(() => [...new Set(tableData.map(row => row[20]))], [tableData]);

  const handleUpdate = async () => {
    const hotInstance = hotTableRef.current.hotInstance;
    const updatedData = hotInstance.getData();
    
    const updates = tableData.map((entry, index) => {
      const updatedStatus = updatedData[index][20];
      if (entry[20] !== updatedStatus) {
        return updateRecordInfo(entry[0], { status: updatedStatus });
      }
      return null;
    }).filter(update => update !== null);

    try {
      await Promise.all(updates);
      alert('Registros actualizados exitosamente');
      fetchData(); 
    } catch (error) {
      console.error('Error actualizando registros:', error);
      alert(`Hubo un problema al actualizar los registros: ${error.message}`);
    }
  };

  const changeSelectedStatus = (status) => {
    const hotInstance = hotTableRef.current.hotInstance;
    const selected = hotInstance.getSelected();

    if (selected) {
      hotInstance.batch(() => {
        selected.forEach(([row1, col1, row2, col2]) => {
          if (col1 <= 19 && 19 <= col2) {
            const startRow = Math.max(row1, 0);
            const endRow = Math.min(row2, hotInstance.countRows() - 1);

            const updates = [];
            for (let row = startRow; row <= endRow; row++) {
              const currentStatus = hotInstance.getDataAtCell(row, 19);
              if (currentStatus !== status) {
                updates.push({ row, status });
              }
            }

            updates.forEach(({ row, status }) => {
              hotInstance.setDataAtCell(row, 19, status);
            });
          }
        });
      });
    }
  };

  return (
    <div className='items-center justify-self-center h-[400px] w-full'>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="450">
          <Spinner size="xl" />
          <Text ml={4}>Cargando registros...</Text>
        </Box>
      )}
      {!isLoading && (
        <>
          <HStack mb={3}>
            <Select value={billNumberFilter} onChange={(e) => setBillNumberFilter(e.target.value)}>
              <option value="all">Todas</option>
              {uniqueBillNumbers.map((billNumber, index) => (
                <option key={index} value={billNumber}>{billNumber}</option>
              ))}
            </Select>
            <Button
              width="40%"
              onClick={handleUpdate}
              bgColor="#F1D803"
              variant="solid"
              colorScheme='teal'
              textColor="black" 
            >
              Actualizar
            </Button>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Todos</option>
              {uniqueStatuses.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </Select>
          </HStack>
          <VStack alignItems="center" align="center" justify="center" className='bg-gray-300'>
            <HotTable
              ref={hotTableRef}
              data={filteredData}
              className="relative z-0"
              columns={[
                { data: 0, readOnly: true, title: 'OC' },
                { data: 1, readOnly: true, title: 'ITEMS' },
                { data: 2, readOnly: true, title: 'CODIGO' },
                { data: 3, readOnly: true, title: 'DESCRIPCION' },
                { data: 4, readOnly: true, title: 'CANT' },
                { data: 5, readOnly: true, title: 'UND' },
                { data: 6, readOnly: true, title: 'PROVEEDOR' },
                { data: 7, readOnly: true, title: 'FOB UNIT' },
                { data: 8, readOnly: true, title: 'FACTURA' },
                { data: 9, readOnly: true, title: 'PA' },
                { data: 10, readOnly: true, title: 'UC' },
                { data: 11, readOnly: true, title: 'TRM' },
                { data: 12, readOnly: true, title: 'FOB' },
                { data: 13, readOnly: true, title: 'COP UNIT' },
                { data: 14, readOnly: true, title: 'COP TOTAL' },
                { data: 15, readOnly: true, title: 'TIPO' },
                { data: 16, readOnly: true, title: 'PB' },
                { data: 17, readOnly: true, title: 'PN' },
                { data: 18, readOnly: true, title: 'Bultos' },
                { data: 19, readOnly: true, title: 'Conversion' },
                { data: 20, type: 'dropdown', title: 'STATUS', source: ['pending', 'approved', 'rejected'] }
              ]}
              colHeaders={true}
              rowHeaders={true}
              contextMenu={true}
              manualColumnResize={true}
              afterChange={(changes) => {
                console.log('Changes made:', changes);
              }}
              cells={(row, col, prop) => {
                const cellProperties = {};
                const editableStyle = { backgroundColor: '#EFFF82' };
                const readonlyStyle = { backgroundColor: '#f5c6c6' };
                const reset = { backgroundColor: '' };

                if (filteredData[row] && filteredData[row].length > 7) {
                  if (col === 7) {
                    if (filteredData[row][20] === "pending") {
                      cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                        Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                        td.style.backgroundColor = editableStyle.backgroundColor;
                        td.title = 'Pendiente a revision';
                      };
                    } else if (filteredData[row][20] === "approved") {
                      cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                        Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                        td.style.backgroundColor = reset.backgroundColor;
                        td.title = '';
                      };
                    } else if (filteredData[row][20] === "rejected") {
                      cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                        Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                        td.style.backgroundColor = readonlyStyle.backgroundColor;
                        td.title = '';
                      };
                    }
                  }
                }

                return cellProperties;
              } }
            />
          </VStack>
        </>
      )}
    </div>
  );
};

export default ReturnTable;



*/


















