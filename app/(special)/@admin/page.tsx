'use client';

import { useState, useRef, useEffect } from "react";
import 'handsontable/dist/handsontable.full.css';
import { CreatelargeAdmin, CreateSmallAdmin } from "@/app/_ui/Createstate";
import { CreateLargeUser, CreateSmallUser } from "@/app/_ui/CreateUser";
import { CreatelargeDomain, CreateSmallDomain } from "@/app/_ui/CreateDomain";
import { useSharedState } from '@/app/_ui/useSharedState';
import { FaUserCheck } from "react-icons/fa";
import { ModalOverlay,FormControl,ModalBody,FormLabel,Tooltip, Modal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Icon, ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure } from "@chakra-ui/react";
import { SearchIcon, CheckCircleIcon, DownloadIcon, AtSignIcon, AttachmentIcon, CalendarIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import { ImportDataBase } from '@/app/_ui/ImportDataBase'
import { IoMenu } from "react-icons/io5";
import { redirect } from 'next/navigation'
import { useRouter } from "next/navigation";
import MainButton from '@/app/_ui/component_items/MainButton';
import { handleExport } from '@/app/_ui/ExportButton';





function formatCurrency(number:number) {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  }


export default function Admin(){
    const { state, updateState } = useSharedState();
    const [MenuL, setMenuL] = useState(true)
    const [AddDomain, setAddDomain] = useState(false);
    const [isInicio, setisInicio] = useState(true);
    const [isRegistro, setisRegistro] = useState(false);
    const [isUsuario, setisUsuario] = useState(false);
    const [isDominio, setisDominio] = useState(false);
    const [isDatos, setisDatos] = useState(false);


    const [showRightBox, setShowRightBox] = useState(false);



    const [isScreenSmall, setIsScreenSmall] = useState(window.innerWidth < 1000);

    useEffect(() => {
        const handleResize = () => {
            setIsScreenSmall(window.innerWidth < 1000);
        };

        window.addEventListener('resize', handleResize);


        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);




    const [isScreenLarge, setIsScreenLarge] = useState(window.innerWidth > 1000);

    useEffect(() => {
        const handleResize = () => {
            setIsScreenLarge(window.innerWidth > 1000);
        };

        window.addEventListener('resize', handleResize);


        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const screen = (numero: number) => {

        if (numero == 1) {
            setisRegistro(true);
            setisDatos(false);
            setisDominio(false);
            setisUsuario(false);
            setisInicio(false)
        }
        if (numero == 2) {
            setisRegistro(false);
            setisDatos(false);
            setisDominio(false);
            setisUsuario(true);
            setisInicio(false)
        }
        if (numero == 3) {
            setisRegistro(false);
            setisDatos(false);
            setisDominio(true);
            setisUsuario(false);
            setisInicio(false)
        }
        if (numero == 4) {
            setisRegistro(false);
            setisDatos(true);
            setisDominio(false);
            setisUsuario(false);
            setisInicio(false)
        }

    };
    const router = useRouter();
    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'GET',
            });

            if (response.ok) {
                router.push('/');
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleActive = () => {
        setMenuL(prevState => !prevState);
    };
//onClick={toggleActive}


const handleVisibilityChange = (visible: any) => {
    setShowRightBox(visible);
  };

  const [isVisible, setIsVisible] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = async () => {
      setIsLoading(true);
      setError(null);
      onOpen();

      try {
        console.log(state.TRMNUM)
          await handleExport({TRM: state.TRMNUM});
      } catch (err) {
          setError('Error al generar el archivo CSV.');
      } finally {
          setIsLoading(false);
          onClose();
      }
  };



  const { isOpen: isOpenSecondModal, onOpen: onOpenSecondModal, onClose: onCloseSecondModal } = useDisclosure();

   // Estado del input y la variable actualizada
   const [inputValue, setInputValue] = useState('');
   const [updatedValue, setUpdatedValue] = useState('');

   // Manejo del cambio en el input
  const handleInputChange = (event:React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Manejo del clic en el botón "Aplicar" del nuevo modal
  const handleApply = () => {
    updateState('TRMNUM', inputValue);
    onCloseSecondModal(); // Cierra el nuevo modal
  };


    return (
        <ChakraProvider>
            <div className="w-full h-full flex justify-center items-center p-4 bg-gradient-to-tr from-green-900 to-green-700">
                <div className={`relative flex w-full max-w-6xl  ${(showRightBox && !isScreenSmall) ? 'md:justify-between' : 'justify-center'}`}>
                    {/* Caja Principal */}
                    <div className={`relative p-4 bg-gradient-to-tr from-gray-200 to-gray-300 border border-gray-300 text-center rounded-3xl shadow-md  ${showRightBox ? 'md:w-2/3' : 'w-full'} flex flex-col`}>
                        <Flex
                            width="100%"
                            alignItems="center"
                            justifyContent="space-between"
                            p={4}
                            bg="gray.100"
                            className="rounded-2xl"
                            position="relative"
                        >
                            <Box position="absolute" right={4}>
                                <Menu>
                                    <MenuButton >
                                        <Button colorScheme='teal' backgroundColor='#F1D803'>
                                            <Icon as={IoMenu} w={5} h={5} color='black' />
                                        </Button>
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem className=' font-bold' onClick={() => alert('Option 2')}>Colaboradores</MenuItem>
                                        <MenuItem color="#7E801E" className=' font-bold' onClick={onOpenSecondModal}>Actualizar TRM</MenuItem>
                                        <MenuItem color="red" className=' font-bold' onClick={handleLogout}>Cerrar sesion</MenuItem>
                                    </MenuList>
                                </Menu>

                            </Box>
                            <Box flex={1} textAlign="center">
                                <Text fontSize="xl" fontWeight="bold">
                                    Administrador
                                </Text>
                            </Box>
                        </Flex> 
                        <HStack height='100%' mt={3} spacing={2} align="stretch">
                            <VStack  justify='center' width={MenuL ? '7%' : '20%'} bg="white" border="1px" borderColor="gray.300" backgroundColor="gray.100" borderRadius="md" className=" p-3" align="center" transition="width 0.3s ease-in-out" >
                                <VStack align='stretch' justify='center'>
                                    <MainButton
                                        onClick={() => screen(1)}
                                        text="Busqueda de Registros"
                                        icon={<SearchIcon w={4} h={4} color="black" />}
                                        backgroundColor={isRegistro ? 'teal' : '#F1D803'}
                                        showRightBox={showRightBox}
                                        isScreenSmall={isScreenSmall}
                                        MenuL={MenuL}
                                    />
                                    <MainButton
                                        onClick={() => screen(2)}
                                        text="Autorizacion de Usuarios"
                                        icon={<CheckCircleIcon w={4} h={4} color="black" />}
                                        backgroundColor={isUsuario ? 'teal' : '#F1D803'}
                                        showRightBox={showRightBox}
                                        isScreenSmall={isScreenSmall}
                                        MenuL={MenuL}
                                    />
                                    <MainButton
                                        onClick={() => screen(3)}
                                        text="Dominios"
                                        icon={<AtSignIcon w={4} h={4} color="black" />}
                                        backgroundColor={isDominio ? 'teal' : '#F1D803'}
                                        showRightBox={showRightBox}
                                        isScreenSmall={isScreenSmall}
                                        MenuL={MenuL}
                                    />
                                    <MainButton
                                        onClick={() => screen(4)}
                                        text="Base de Datos"
                                        icon={<AttachmentIcon w={4} h={4} color="black" />}
                                        backgroundColor={isDatos ? 'teal' : '#F1D803'}
                                        showRightBox={showRightBox}
                                        isScreenSmall={isScreenSmall}
                                        MenuL={MenuL}
                                    />
                                    <MainButton
                                        onClick={handleButtonClick}
                                        text="Descargar CSV"
                                        icon={<DownloadIcon w={4} h={4} color="black" />}
                                        backgroundColor='gray.300'
                                        showRightBox={showRightBox}
                                        isScreenSmall={isScreenSmall}
                                        MenuL={MenuL}
                                    />
                                </VStack>
                                <VStack height='40%'>

                                </VStack>
                                {(isScreenLarge && !MenuL) && (<HStack justify='center' align='center' bg='gray.200' spacing='20%' height='10%'>
                                    <Button position='relative' colorScheme='transparent' bg='transparent'>
                                        <Text bottom='5' borderRadius='100' backgroundColor='red' right='1' position='absolute' color='white'>5</Text>
                                        <Icon w={4} h={4} color="black" as={FaUserCheck} />
                                    </Button>
                                    <Button position='relative' colorScheme='transparent' bg='transparent'>
                                        <Text bottom='5' borderRadius='100' backgroundColor='red' fontSize={15} right='1' position='absolute' color='white'>5</Text>
                                        <CalendarIcon w={4} h={4} color="black" />
                                    </Button>
                                </HStack>)}
                                {(isScreenSmall || MenuL) && (<VStack justify='center' align='center' bg='gray.200' spacing='20%' height='20%'>
                                    <Button position='relative' colorScheme='transparent' bg='transparent'>
                                        <Text bottom='5' borderRadius='100' backgroundColor='red' right='1' position='absolute' color='white'>5</Text>
                                        <Icon w={4} h={4} color="black" as={FaUserCheck} />
                                    </Button>
                                    <Button position='relative' colorScheme='transparent' bg='transparent'>
                                        <Text bottom='5' borderRadius='100' backgroundColor='red' right='1' position='absolute' color='white'>5</Text>
                                        <CalendarIcon w={4} h={4} color="black" />
                                    </Button>
                                </VStack>)}
                            </VStack>
                            <VStack
                                overflow='auto'
                                flex='1'
                                width="100%"
                                height="500"
                                bg="white"
                                border="1px"
                                borderColor="gray.300"
                                borderRadius="md"
                                className=" p-3"
                                align="stretch"  >

                                {isRegistro && !isUsuario && !isDominio && !isDatos && (

                                    <>
                                        {isScreenLarge && <CreatelargeAdmin onVisibilityChange={handleVisibilityChange} sharedState={state} updateSharedState={updateState} />}
                                        {isScreenSmall && <CreateSmallAdmin />}
                                    </>



                                )}
                                {!isRegistro && isUsuario && !isDominio && !isDatos && (

                                    <>
                                        {isScreenLarge && <CreateLargeUser />}
                                        {isScreenSmall && <CreateSmallUser />}
                                    </>


                                )}
                                {!isRegistro && !isUsuario && isDominio && !isDatos && (


                                    <>
                                        {isScreenLarge && (<CreatelargeDomain/> )}
                                        {isScreenSmall && (<CreateSmallDomain/> )}

                                        


                                    </>


                                )}
                                {!isRegistro && !isUsuario && !isDominio && isDatos && (

                                    <>
                                        {isScreenLarge && (
                                            <>

                                                <ImportDataBase   />


                                            </>

                                        )}
                                        {isScreenSmall && (
                                            <Flex w="100%" className="mt-3 mb-3" justify="space-between" align="center">
                                                <HStack>
                                                    <Input fontSize="60%" width='68%' border='1px' backgroundColor='white' placeholder="Dominio" />
                                                    <Button width={6} colorScheme='teal' backgroundColor='#F1D803'>
                                                        <SearchIcon w={5} h={5} color='black'></SearchIcon>
                                                    </Button>
                                                </HStack >
                                                <Button width={6} onClick={() => setAddDomain(true)} colorScheme='teal' backgroundColor='#F1D803'>
                                                    <AddIcon w={5} h={5} color='black'></AddIcon>
                                                </Button>
                                            </Flex>
                                        )}




                                    </>

                                )}
                            </VStack>
                        </HStack>

                        <Modal isOpen={isOpenSecondModal} onClose={onCloseSecondModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Actualizar TRM</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>TRM</FormLabel>
              <Input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleApply}>
              Aplicar
            </Button>
            <Button variant="ghost" onClick={onCloseSecondModal} ml={3}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>






                        <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Exportando CSV</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {isLoading ? 'Generando archivo...' : 'Archivo generado exitosamente.'}
                        {error && <p className="text-red-500">{error}</p>}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
                    </div>

                    {AddDomain && (



                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50  transition-opacity duration-300">
                            <div className="bg-white p-4 w-5/6 max-w-md border text-center border-gray-300 rounded-3xl shadow-md relative z-20 ">
                                <h2 className="text-xl font-bold mb-4">Asociar factura</h2>
                                <p className='font-medium text-lg text-gray-500'>Digite el dominio a agregar</p>
                                <Input placeholder="Dominio"></Input>
                                <Box width="70%" height="150" className=" mb-4 " overflow='auto'>

                                </Box>
                                <HStack textAlign='center' justifyContent="center" alignItems='center'>
                                    <Button
                                        bg='red'
                                        textColor='white'
                                        className="mt-4 px-4 py- rounded"
                                        onClick={() => (setAddDomain(false))}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        backgroundColor="#F1D803"
                                        className="mt-4 px-4 py-2 rounded"
                                        onClick={() => setAddDomain(false)}
                                    >
                                        Agregar
                                    </Button>
                                </HStack>
                            </div>
                        </div>
                    )}

                {showRightBox && (
                        <div  className="hidden md:block p-4 bg-white border text-center border-gray-300 rounded-3xl md:w-1/3 ml-4 transition-opacity duration-300">
                            <h2 className="text-xl font-bold mb-4">Datos de la Orden de Compra</h2>

                            <HStack textAlign='center' justifyContent="center" alignItems='center'>
                            <VStack  >
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p   className="font-bold flex-1 flex-shrink">Descripcion</p>
                                <p  className=" flex-1 text-right flex-shrink-0 " >{state.descripcion}</p>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p  className="font-bold flex-1 flex-shrink-0">Proveedor</p>
                                <p className=" flex-1 text-right flex-shrink-0 whitespace-nowrap text-ellipsis">{state.proveedor}</p>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p className="font-bold flex-1 flex-shrink-0 whitespace-nowrap">Cantidad O.C</p>
                                <p className=" flex-1 text-right flex-shrink-0 whitespace-nowrap text-ellipsis">{state.cantidadoc}</p>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p className="font-bold flex-1 flex-shrink-0 whitespace-nowrap">Precio Unitario O.C</p>
                                <p className=" flex-1 text-right flex-shrink-0 whitespace-nowrap text-ellipsis">{state.preciouni}</p>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p className="font-bold flex-1 flex-shrink">Moneda</p>
                                <p className=" flex-1 text-right flex-shrink-0 whitespace-nowrap ">{state.moneda}</p>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p className="font-bold flex-1 flex-shrink-0 whitespace-nowrap">Precio Unitario Fact</p>
                                <p className=" flex-1 text-right flex-shrink-0 whitespace-nowrap text-ellipsis">${formatCurrency(state.factunit)}</p>
                                </HStack>
                                <HStack justifyContent="space-between" alignItems="flex-start">
                                <p className="font-bold flex-1 flex-shrink-0 whitespace-nowrap">Valor Total Fact</p>
                                <p className=" flex-1 text-right flex-shrink-0 whitespace-nowrap text-ellipsis">${formatCurrency(state.facttotal)}</p>
                                </HStack>
                                
                                
                                
                                
                                
                            </VStack>
                            <VStack textAlign='end' justifyContent="end" alignItems='end'>            
                            
                            
                            
            
                            </VStack>
                            </HStack>
                            <p className="font-bold mt-3">Suma de las cantidades: {state.columnSum} </p> {/* Muestra el valor de la celda seleccionada */}
                            <p className="font-bold ">Cantidades: {state.cantidadespor} </p> {/* Muestra la suma de la columna */}
                            <p className="font-bold ">Peso X material: {state.pesopor} </p>
                            <p className="font-bold ">Factor de conversion: {state.factor} </p>
                            <p className="font-bold ">Bulto: {state.bulto} </p>
                            <button 
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                            onClick={() => setShowRightBox(false)}
                            >
                            Cerrar
                            </button>
                            
                        </div>
                        )}

                </div>
            </div>
        </ChakraProvider>
    );
}



/*

'use client'
import { getAllRecords } from '@/app/_lib/database/records'



export default async function UserPage() {

    const hola = async () => {


        const Records = await getAllRecords({ date_before: (new Date()).toISOString(), number_of_records: 10 })
        alert((new Date()).toISOString())
        console.log(Records)
    }

    await hola();

    return (

        <h1>user</h1>
    );
}

*/