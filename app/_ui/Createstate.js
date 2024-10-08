'use client';
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; 
import { useToast,FormControl, FormLabel, Spinner, Switch, Tooltip, Select, ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Checkbox } from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, CheckCircleIcon, DownloadIcon, AtSignIcon, AttachmentIcon, CalendarIcon, CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { getInvoice, getlastmodified, getbase_bill } from '@/app/_lib/database/service';
import { selectInvoice_data, selectSingleInvoice } from '@/app/_lib/database/invoice_data'
import { selectSingleSupplierData, selectSupplierData, selectSupplierDataByInvoiceID } from '@/app/_lib/database/supplier_data'
import {selectSingleMaterial} from '@/app/_lib/database/materials'
import { selectBills, selectSingleBill } from '@/app/_lib/database/base_bills'
import ReturnTable from '@/app/_ui/components/ReturnTable'
import { Associate_invoice } from '@/app/_ui/Associate_invoice'
import { handleExport } from '@/app/_ui/ExportButton'
import { getRole } from "../_lib/supabase/client";






function formatDate(dateString) {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", options);
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
  const [selectedSupplier2,setselectedSupplier2] = useState()
  const [Role,setRole] = useState("")
  const toast = useToast();


  const [IsAdmin,setIsAdmin] = useState(false)
  const [filteredData, setFilteredData] = useState([]);



  
  useEffect(() => {
    const Validar = async () => {
      const role = await getRole();
    if(role === "administrator"){
      setIsAdmin(true)
    }
    }
    Validar()
   }, []);
  
  
  const ShortConsecutivo = (e) => {
    let consecutivo = String(e).slice(0,8)
    return consecutivo
  }



  const fetchData = async () => {
    
    setIsLoading(true)
    try{
      const role = await getRole()
      setRole(role)
      const invoice = await selectInvoice_data({page: 1, limit: 12})
      console.log("invoice: ",invoice)
    let Data = []
    
    
     await Promise.all(
      invoice.map(async (invo) => {
        try{
          const data = await selectSupplierDataByInvoiceID(invo.invoice_id)
          console.log("data con []: ",data[0])

  

        let date =  formatDate(data[0].modified_at)
        let estado = ""
        if(invo.state === "pending"){
          estado = "pending"
        }else if(invo.state === "rejected"){
          estado = "rejected"
        }else if(invo.state === "approved"){
          estado = "approved"
        }
        let hola = data[0].base_bill_id;

        const record = await selectBills({page: 1, limit: 1, search: String(hola)})
        
        let orden = ShortConsecutivo(record[0].purchase_order)

        Data.push({
          consecutivo: invo.invoice_id,
          orden: orden,
          fecha: date,
          estado: estado,
        });
        }
        catch (err) {
          console.error("Error fetching data for invoice", invo.invoice_id, err);
        }
      })
     )
      
 
    setFilteredData(Data)

    } catch {
      console.log("En algun punto fallamos")
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
   fetchData()
  }, [isTable, hola]);

  
const [Razon,setRazon] = useState(false)
const [Type,setType] = useState("View")
const [codigo,setcodigo] = useState("")
const [conta,setconta] = useState(0)

useEffect(() => {
  if (codigo) {
    if (Role === "administrator") {
      setselectedSupplier2(codigo)
      sethola(true)
    } else if (Role === "employee") {
      handleEmployeeActions(codigo)
    }
  }
}, [codigo,conta])

const handleEmployeeActions = async (e) => {
  const invoice = await selectSingleInvoice(e)
  if (invoice.state === "rejected") {
    setRazon(true)
    setType("Edit")
  } else if (invoice.state === "pending") {
    setType("View")
    setisTable(true)
  } else if (invoice.state === "approved") {
    setType("View")
    setisTable(true)
  }
}

const ChangeReturn = (e) => {
  setconta(conta + 1)
  setcodigo(e)
}

const ChangeHola = (e) => {
  sethola(false)
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
                  <Button  colorScheme='teal' backgroundColor='#F1D803'>
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
                  mr="2"
                  border="1px"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  width="20%"
                  backgroundColor='white'
                >
                  <option value="TODOS">Todos</option>
                  <option value="APROBADO">Aprobados</option>
                  <option value="PENDIENTE">En Proceso</option>
                  <option value="RECHAZADO">Rechazados</option>
                </Select>
                {IsAdmin && (
                  <Button mr="2" onClick={() => (setisTable(true), setType("Create"), setcodigo(""))} colorScheme='teal' backgroundColor='#F1D803'>
                  <AddIcon w={5} h={5} color='black' />
                </Button>
                )}
                
                
              </Flex>
              <HStack  borderColor="gray.300"  whiteSpace="nowrap" className="rounded-2xl" justifyContent='center' alignItems="center" bg="gray.200" w="100%" h="10%">
                <HStack bgColor="white" align="center" justify="center" w="100%" h="100%">
                  <HStack overflowX="clip" ml='3%' alignItems="center" justify="start" w="30%">
                    <Text ml={4} className="font-bold" fontSize='100%'>ID Fact</Text>
                  </HStack>
                  <HStack alignItems="center" justify="center" w="20%">
                    <Text marginRight={2} className="font-bold" fontSize='100%'>orden</Text>
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
      onClick={() => ChangeReturn(item.consecutivo)}
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
        <HStack ml="3%" alignItems="center" justify="start" w="30%">
          <Tooltip label={item.consecutivo} aria-label={item.consecutivo}>
            <Text
              className="font-bold"
              fontSize="100%"
              onClick={(event) => {
                event.stopPropagation(); // Detiene la propagación del evento
                toast({ title: "ID de Factura se ha copiado con exito", description: `El ID de Factura se ha copiado al portapapeles con exito`, status: "success", duration: 3000, isClosable: true });
                navigator.clipboard.writeText(item.consecutivo);
                // Aquí puedes añadir un mensaje de éxito o feedback
              }}
              _hover={{ cursor: "pointer", textDecoration: "underline" }} // Cambia el cursor y añade un subrayado al pasar el mouse
            >
              {ShortConsecutivo(item.consecutivo)}
            </Text>
          </Tooltip>
        </HStack>
        <HStack alignItems="center" justify="center" w="20%">
          <Text className="font-light" fontSize="100%">{item.orden}</Text>
        </HStack>
        <HStack spacing={4} alignItems="center" justify="center" w="30%">
          <Text className="font-light" fontSize="100%">{item.fecha}</Text>
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

              {Razon && (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-4 w-5/6 max-w-md border text-center border-gray-300 rounded-3xl shadow-md relative z-20 ">
              <h2 className="text-xl font-bold mb-4">Su Solicitud de asociacion a sido Rechazada</h2>

              <VStack mb={4} textAlign='start' justifyContent="start" alignItems='start' mt={5} >
              <Text>La razon del rechazo se debe a una inconsistencia en el apartado del numero de la factura y en el peso total ya que no estan acordes en ninguna factura existente</Text>
              </VStack>
              <p className="font-bold">Si desea editar la asociacion anterior haga click en Editar</p>
            
              <HStack mt={4} justify="center" align="center">
                <Button bgColor="red.500" colorScheme="teal" className=" px-4 py-2 rounded" onClick={() => setRazon(false)}>
                    Cerrar
                </Button>
                <Button textColor="black" bgColor="#F1D803" colorScheme="teal" className=" px-4 py-2 rounded" onClick={() => (setisTable(true), setRazon(false))}>
                    Editar
                </Button>
              </HStack>
            </div>
          </div>)}
            </VStack>

          
          ) : (
            <>
            
              {(Type === "Create") && (
              <Associate_invoice setisTable={setisTable} isTable={Type} invoi={codigo}  sharedState={sharedState} updateSharedState={updateSharedState} />
            )}
            
            {(Type === "Edit" || Type === "View") && (
              <div
              className={` absolute p-4 bg-gray-100 border border-gray-300 text-center h-[100%] w-[100%] justify-center self-center content-center bottom-1 snap-center origin-center  rounded-3xl shadow-md flex flex-col`}>
              <Associate_invoice setisTable={setisTable} isTable={Type} invoi={codigo}  sharedState={sharedState} updateSharedState={updateSharedState} />
              </div>
            )}
            </>
            
            
            




          )}
          
        </>
      )}
{hola && (<ReturnTable suppliers={selectedSupplier2} volver={() => ChangeHola()} />)}
    </>

  );

}




