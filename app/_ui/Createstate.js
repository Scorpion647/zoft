
'use client';
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Spinner,Switch,Tooltip, Select, ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure } from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, CheckCircleIcon, DownloadIcon, AtSignIcon, AttachmentIcon, CalendarIcon, CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { getRecords, getMaterial, getMaterials, getRecordsInfo, getSupplier, insertRecordInfo, getRecord, updateMaterial } from '@/app/_lib/database/service';
import ReturnTable from '@/app/_ui/components/ReturnTable'
import {Associate_invoice} from '@/app/_ui/Associate_invoice'






function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}



function groupByPurchaseOrder(recordsInfo, records) {
  const groupedData = {};


  const recordIdToOrder = records.reduce((acc, record) => {
    if (record.id && record.purchase_order) {
      acc[record.id] = record.purchase_order;
    } else {
      console.warn(`Record without purchase_order:`, record);
    }
    return acc;
  }, {});


  recordsInfo.forEach(item => {
    const order = recordIdToOrder[item.record_id];
    if (!order) {
      console.warn(`No purchase_order found for record_id: ${item.record_id}`);
      return; 
    }

    if (!groupedData[order]) {
      groupedData[order] = {
        fecha: item.created_at,
        estado: item.status,
        record_ids: [],
      };
    }

    if (new Date(item.modified_at || item.created_at) > new Date(groupedData[order].fecha)) {
      groupedData[order].fecha = item.modified_at || item.created_at;
    }

    if (item.status === "rejected") {
      groupedData[order].estado = "rejected";
    } else if (item.status === "pending" && groupedData[order].estado !== "rejected") {
      groupedData[order].estado = "pending";
    }
    groupedData[order].record_ids.push(item.record_id);
  });


  return Object.entries(groupedData).map(([order, { fecha, estado }]) => ({
    orden: order, 
    fecha: formatDate(fecha),
    estado,
  }));
}







const months = [
  { value: '', label: 'Todos' },
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];



export const CreatelargeAdmin = ({ sharedState, updateSharedState }) => {


  

 




  const [hola, sethola] = useState(false);
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [Addtable, setAddtable] = useState(false);
  const [filteredValue, setFilteredValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('EN PROCESO');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isTable, setisTable] = useState(false);
  const [IsLoading,setIsLoading] = useState(false)





  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (isTable === false) {
      console.log("Cargando datos...");
      setIsLoading(true);
  
      const fetchData = async () => {
        try {
          let allRecords = [];
          let page = 1;
          const limit = 10000;
          let hasMoreRecords = true;
  
          while (hasMoreRecords) {
            console.log(`Fetching records - Page: ${page}, Limit: ${limit}`);
            const records = await getRecords(page, limit);
  
            if (Array.isArray(records) && records.length > 0) {
              console.log(`Records fetched: ${records.length}`);
              allRecords = allRecords.concat(records);
  
              if (records.length < limit) {
                hasMoreRecords = false; 
              } else {
                page += 1;
              }
            } else {
              console.log('No more records to fetch');
              hasMoreRecords = false;
            }
          }
  
          let allRecordsInfo = [];
          const recordIds = allRecords.map(record => record.id);
  
          for (let i = 0; i < recordIds.length; i += limit) {
            const batch = recordIds.slice(i, i + limit);
            console.log(`Fetching records info - Batch: ${i / limit + 1}, Limit: ${limit}`);
            const recordsInfo = await getRecordsInfo(1, limit); 
  
            if (Array.isArray(recordsInfo) && recordsInfo.length > 0) {
              console.log(`Records Info fetched: ${recordsInfo.length}`);
              allRecordsInfo = allRecordsInfo.concat(recordsInfo);
            } else {
              console.log('No more records info to fetch');
              break;
            }
          }
  
          if (allRecordsInfo.length > 0) {
            const groupedData = groupByPurchaseOrder(allRecordsInfo, allRecords);
            console.log('Final Grouped Data:', groupedData);
            setFilteredData(groupedData);
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }
  }, [isTable]);
  
  
  

  useEffect(() => {
    console.log("IsLoading:", IsLoading);
  }, [IsLoading]);

  

  const handleSupplierClickk = (item) => {
    console.log(item.estado)
    if (item.estado === "SUCCESS" || item.estado === "PENDING") {
      console.log(item.estado)
      router.push(`/success-or-pending/${item.orden}`);
    } else if (item.estado === "ERROR") {
      router.push(`/error/${item.orden}`);
      console.log(item.estado)
    }
  };





  const handleFilterClick = () => {
    if (inputValue.trim() !== '') {
      setFilteredValue(inputValue.trim());
    } else {
      setFilteredValue('');
    }
  };

  const [selectedSupplier2, setSelectedSupplier2] = useState("");

  const handleSupplierClick = (supplier) => {

    setSelectedSupplier2(supplier.orden);
  };

  useEffect(() => {
    
  }, [selectedSupplier2]);

  if (!hola && selectedSupplier2) {
    sethola(true)
    
  }



  return (
    <>
    
      {!hola && (
        <>
          {!isTable ? (
            <VStack border="1px" borderColor="gray.300" className=" rounded-2xl" overflow="auto" w="100%" bgColor="white" height="100%" justify='flex-start' alignItems="flex-start">
              <Flex w="100%" className="mt-2 mb-1" justify="space-between" align="center">
                <HStack ml={2}>
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    width='80%'
                    border='1px'
                    backgroundColor='white'
                    placeholder="Orden de compra"
                  />
                  <Button onClick={handleFilterClick} colorScheme='teal' backgroundColor='#F1D803'>
                    <SearchIcon w={5} h={5} color='black' />
                  </Button>
                </HStack>
                <Select
                  border="1px"
                  width="20%"
                  backgroundColor='white'
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </Select>
                <Select
                  border="1px"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  width="20%"
                  backgroundColor='white'
                >
                  <option value="TODOS">Todos</option>
                  <option value="APROBADO">Aprobados</option>
                  <option value="EN PROCESO">En Proceso</option>
                  <option value="RECHAZADO">Rechazados</option>
                </Select>
                <Button mr="2" onClick={() => setisTable(true)} colorScheme='teal' backgroundColor='#F1D803'>
                  <AddIcon w={5} h={5} color='black' />
                </Button>
              </Flex>
              <HStack  borderColor="gray.300"  whiteSpace="nowrap" className="rounded-2xl" justifyContent='center' alignItems="center" bg="gray.200" w="100%" h="10%">
                <HStack bgColor="white" align="center" justify="center" w="100%" h="100%">
                  <HStack overflowX="clip" ml='3%' alignItems="center" justify="start" w="40%">
                    <Text className="font-bold" fontSize='100%'>orden </Text>
                  </HStack>
                  <HStack spacing={8} alignItems="center" justify="center" w="30%">
                    <Text marginRight={2} className="font-bold" fontSize='100%'>Fecha</Text>
                  </HStack>
                  <HStack mr='3%' spacing={4} alignItems="center" justify="center" w="30%">
                    <Text className="font-bold" fontSize='100%'>Estado</Text>
                  </HStack>
                </HStack>
              </HStack>
              <Box bgColor="gray.200" overflowY='auto' w="100%" h="100%">
                {IsLoading && (
                  <Box display="flex" justifyContent="center" alignItems="center" height="350" >
                  <Spinner size="xl" />
                  <Text ml={4}>Cargando datos...</Text>
              </Box>
                )}
                {!IsLoading && (
                  <VStack>
                  {filteredData.map((item) => (
                    <VStack w="100%" key={item.orden}>
                      <Button
                        onClick={() => handleSupplierClick(item)}
                        whiteSpace="nowrap"
                        paddingRight={2}
                        paddingLeft={2}
                        justifyContent="center"
                        alignItems="center"
                        className="rounded-2xl"
                        bg="gray.200"
                        w="100%"
                        h="10"
                      >
                        <HStack marginTop="1%" className="rounded-2xl" bgColor="white" align="center" justify="center" w="100%" h="100%">
                          <HStack ml="3%" alignItems="center" justify="start" w="40%">
                            <Text className="font-bold" fontSize="100%">{item.orden}</Text>
                          </HStack>
                          <HStack spacing={4} alignItems="center" justify="center" w="30%">
                            <Text fontSize="100%">{item.fecha}</Text>
                          </HStack>
                          <HStack mr="3%" spacing={4} alignItems="center" justify="center" w="30%">
                            <Text
                              color={
                                item.estado === "approved" ? "green" :
                                  item.estado === "pending" ? "yellow.500" : "red"
                              }
                              fontSize="100%"
                            >
                              {item.estado === 'pending' && 'PENDIENTE'}
                              {item.estado === 'approved' && 'APROBADO'}
                              {item.estado === 'rejected' && 'RECHAZADO'}
                              {item.estado !== 'pending' && item.estado !== 'approved' && item.estado !== 'rejected' && 'DESCONOCIDO'}
                            </Text>
                          </HStack>
                        </HStack>
                      </Button>
                    </VStack>
                  ))}
                </VStack>
                )}
              </Box>

              
            </VStack>
          ) : (
            
            <Associate_invoice setisTable={setisTable} isTable={isTable}   sharedState={sharedState} updateSharedState={updateSharedState} />
            




          )}
          
        </>
      )}
{hola && (<ReturnTable suppliers={selectedSupplier2} />)}
    </>

  );

}


export const CreateSmallAdmin = () => {

  const [inputValue, setInputValue] = useState('');
  const [filteredValue, setFilteredValue] = useState('');


  const filteredData = create.filter(item =>
    item.orden.startsWith(filteredValue)

  );

  const handleFilterClick = () => {
    if (inputValue.trim() !== '') {
      setFilteredValue(inputValue.trim());
    } else {
      setFilteredValue('');
    }
  };
  const router = useRouter();
  const Rechazo = () => {
    router.push('/Rechazo');
  };




  return (
    <>
      <Flex className="rounded-2xl" w="100%" justify="space-between" align="center">
        <HStack ml={2}>
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} width='60%' fontSize="60%" border='1px' backgroundColor='white' placeholder="Orden de Compra"></Input>
          <Button width={6} onClick={handleFilterClick} colorScheme='teal' backgroundColor='#F1D803'>
            <SearchIcon w={5} h={5} color='black'></SearchIcon>
          </Button>
        </HStack >
        <Button width={6} onClick={() => setAddtable(true)} colorScheme='teal' backgroundColor='#F1D803'>
          <AddIcon w={5} h={5} color='black'></AddIcon>
        </Button>
      </Flex>



      <Box overflow='auto' w='100%' h='400'>
        <HStack whiteSpace="nowrap" justifyContent='center' alignItems="center" bg="gray.200" w="100%" h="5%">
          <HStack bgColor="white" align="center" justify="center" w="100%" h="100%">
            <HStack ml='5%' alignItems="center" justify="start" w="20%">
              <Text className=" font-bold" fontSize='50%'>Orden</Text>
            </HStack>
            <HStack spacing={12} alignItems="center" justify="center" w="40%">
              <Text className=" font-bold" fontSize='50%'>Fecha</Text>
              <Text className=" font-bold" fontSize='50%'>Hora</Text>
            </HStack>
            <HStack mr='3%' spacing={4} alignItems="center" justify="center" w="40%">
              <Text className=" font-bold" fontSize='50%'>Estado</Text>
            </HStack>
          </HStack>
        </HStack>
        <Box bgColor="gray.200" overflowY='auto' w="100%" h="500">
          <VStack overflow='auto'>

            {filteredData.map((item) => (
              <VStack w="100%" key={item.id}>
                {item.estado === "APROBADO" && (
                  <Button whiteSpace="nowrap" paddingRight={2} paddingLeft={2} justifyContent='center' alignItems="center" className="rounded-2xl" bg="gray.200" w="100%" h="50">
                    <HStack className="rounded-2xl" bgColor="white" align="center" justify="center" w="100%" h="100%">
                      <HStack ml="3%" alignItems="center" justify="start" w="20%">
                        <Text className=" font-bold" fontSize='50%'>{item.orden}</Text>
                      </HStack>
                      <HStack spacing={4} alignItems="center" justify="center" w="40%">
                        <Text fontSize='50%' >{item.fecha}</Text>
                        <Text fontSize='50%' >{item.hora}</Text>
                      </HStack>
                      <HStack spacing={4} alignItems="center" justify="center" w="40%">
                        <Text color="green" fontSize='50%'>{item.estado} </Text>
                      </HStack>

                    </HStack>
                  </Button>
                )}
                {item.estado === "EN PROCESO" && (
                  <Button whiteSpace="nowrap" paddingRight={2} paddingLeft={2} justifyContent='center' alignItems="center" className="rounded-2xl" bg="gray.200" w="100%" h="50">
                    <HStack className="rounded-2xl" bgColor="white" align="center" justify="center" w="100%" h="100%">
                      <HStack ml="3%" alignItems="center" justify="start" w="20%">
                        <Text className=" font-bold" fontSize='50%'>{item.orden}</Text>
                      </HStack>
                      <HStack spacing={4} alignItems="center" justify="center" w="40%">
                        <Text fontSize='50%' >{item.fecha}</Text>
                        <Text fontSize='50%' >{item.hora}</Text>
                      </HStack>
                      <HStack spacing={4} alignItems="center" justify="center" w="40%">
                        <Text color="yellow.500" fontSize='50%'>{item.estado} </Text>
                      </HStack>

                    </HStack>
                  </Button>
                )}
                {item.estado === "RECHAZADO" && (

                  <Button whiteSpace="nowrap" paddingRight={2} paddingLeft={2} justifyContent='center' alignItems="center" className="rounded-2xl" bg="gray.200" w="100%" h="50">
                    <HStack className="rounded-2xl" bgColor="white" align="center" justify="center" w="100%" h="100%">
                      <HStack ml="3%" alignItems="center" justify="start" w="20%">
                        <Text className=" font-bold" fontSize='50%'>{item.orden}</Text>
                      </HStack>
                      <HStack spacing={4} alignItems="center" justify="center" w="40%">
                        <Text fontSize='50%' >{item.fecha}</Text>
                        <Text fontSize='50%' >{item.hora}</Text>
                      </HStack>
                      <HStack spacing={4} alignItems="center" justify="center" w="40%">
                        <Text color="red" fontSize='50%'>{item.estado} </Text>
                      </HStack>

                    </HStack>
                  </Button>
                )}
              </VStack>
            ))}
            {isTable && (

              <div className={`relative p-4 bg-gradient-to-tr from-gray-200 to-gray-300 border border-gray-300 text-center rounded-3xl shadow-md  flex flex-col`}>
                <Flex
                  width="100%"
                  alignItems="center"
                  justifyContent="space-between"
                  p={4}
                  bg="gray.100"
                  position="relative"
                  className=" rounded-2xl"
                >
                  <Box position="absolute" left={4}>
                    <Button onClick={() => setisTable(false)} colorScheme='teal' backgroundColor='#F1D803'>
                      <ChevronLeftIcon w={5} h={5} color='black'></ChevronLeftIcon>
                    </Button>
                  </Box>
                  <Box flex={1} textAlign="center">
                    <Text fontSize="xl" fontWeight="bold">
                      Asociar Factura
                    </Text>
                  </Box>
                </Flex>
                {isScreenLarge && (<HStack className="mt-3 mb-3" >
                  <Input width='30%' border='1px' backgroundColor='white' placeholder="Posicion"></Input>
                  <Button colorScheme='teal' backgroundColor='#F1D803'>
                    <SearchIcon w={5} h={5} color='black'></SearchIcon>
                  </Button>
                </HStack>)}
                {isScreenSmall && (<HStack className="mt-3 mb-3" >
                  <Input width='60%' border='1px' backgroundColor='white' placeholder="Posicion"></Input>
                  <Button colorScheme='teal' backgroundColor='#F1D803'>
                    <SearchIcon w={5} h={5} color='black'></SearchIcon>
                  </Button>
                </HStack>)}
                {/* Caja Interior */}
                <Box overflow='auto'>
                  <HotTable
                    className="relative z-0"
                    data={initialData}
                    rowHeaders={false}
                    width="100%"
                    height="265"
                    licenseKey="non-commercial-and-evaluation"
                    columns={columns}
                    stretchH="all"
                  />
                </Box>
                <button
                  style={{ backgroundColor: '#F1D803' }}
                  className="mt-2 px-4 py-2 text-black rounded"
                  onClick={() => setShowRightBox(true)}
                >
                  Asociar
                </button>
              </div>


            )}



          </VStack>
        </Box>
      </Box>




    </>

  );

}
