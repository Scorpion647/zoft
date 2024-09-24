'use client';
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; 
import { FormControl, FormLabel, Spinner, Switch, Tooltip, Select, ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Checkbox } from "@chakra-ui/react";
import { SearchIcon, ChevronLeftIcon, CheckCircleIcon, DownloadIcon, AtSignIcon, AttachmentIcon, CalendarIcon, CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import { getInvoice, getlastmodified, getbase_bill } from '@/app/_lib/database/service';
import { selectInvoice_data } from '@/app/_lib/database/invoice_data'
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
      const invoice = await selectInvoice_data({page: 1, limit: 12})
      console.log("invoice: ",invoice)
    let Data = []
    
    
     await Promise.all(
      invoice.map(async (invo) => {
        try{
          const data = await selectSupplierDataByInvoiceID(invo.invoice_id)
          console.log("data: ",data[0])

  

        let date =  formatDate(data[0].modified_at)
        let estado = "pending"
        if(invo.approved === false && invo.created_at === invo.updated_at){
          estado = "pending"
        }else if(invo.approved === false && invo.created_at !== invo.updated_at){
          estado = "rejected"
        }else if(invo.approved === true){
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
  }, [isTable]);

  
  

const ChangeReturn = (e) => {
setselectedSupplier2(e)
sethola(true)
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
                  <Button mr="2" onClick={() => setisTable(true)} colorScheme='teal' backgroundColor='#F1D803'>
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
                            <Text className="font-bold" fontSize="100%">{ShortConsecutivo(item.consecutivo)}</Text>
                          </HStack>
                          <HStack  alignItems="center" justify="center" w="20%">
                            <Text className=" font-light" fontSize="100%">{item.orden}</Text>
                          </HStack>
                          <HStack spacing={4} alignItems="center" justify="center" w="30%">
                            <Text className=" font-light" fontSize="100%">{item.fecha}</Text>
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
{hola && (<ReturnTable suppliers={selectedSupplier2} volver={() => ChangeHola()} />)}
    </>

  );

}




