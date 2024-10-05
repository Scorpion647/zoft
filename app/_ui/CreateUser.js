
'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Checkbox,ChakraProvider, Flex, Box, VStack, Heading, HStack, Menu, MenuButton, MenuList, MenuItem, Button, Text, Input, useDisclosure } from "@chakra-ui/react";
import { SearchIcon, CheckIcon, CloseIcon, AddIcon, ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { getProfile, selectProfiles } from "../_lib/database/profiles";







const create = [
    { email: "jcastroc1@unicartagena.edu.co" },
    { email: "jhoyflow15@gmail.com" },
    { email: "jhoyflow@hotmail.com" },
    


]




export const CreateLargeUser = () => {
    const [Email, setEmail] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [filteredValue, setFilteredValue] = useState('');
    const [isAccept, setisAccept] = useState(false);
    const [Profiles, setProfiles] = useState([]);

    
    


    const handleFilterClick = () => {
        if (inputValue.trim() !== '') {
            setFilteredValue(inputValue.trim());
        } else {
            setFilteredValue(''); 
        }
    };
    const router = useRouter();
    
    
   const FetchData = async () => {
    const data = []
        try{
        const Data = await selectProfiles({page: 1, limit: 10})
        Data.map((prof) => {
            if(prof.user_role === "guest"){
                data.push({
                    email: prof.email
                })
            }
        })
        setProfiles(data)

        
        }catch{

        }finally{

        }
    }

    useEffect(() => {
        FetchData()
    },[])

    const filteredData = Profiles.filter(item =>
        item.email.startsWith(filteredValue)  
    );
     
return(
    <>
        <HStack className="mt-3 mb-3">
            <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} width='30%' border='1px' backgroundColor='white' placeholder="Usuario"></Input>
            <Button onClick={handleFilterClick} colorScheme='teal' backgroundColor='#F1D803'>
                <SearchIcon w={5} h={5} color='black'></SearchIcon>
            </Button>
        </HStack>
        <VStack overflow="auto" w="100%" bgColor="gray.200" height="400" justify='flex-start' alignItems="flex-start">
            {filteredData.map ((item) => (
                <VStack key={item.email} w="100%" h="50">
                    <Box whiteSpace="nowrap" paddingRight={2} paddingLeft={2}  justifyContent='center' alignItems="center" className="rounded-2xl" bg="gray.200" w="100%" h="50">
                        <HStack marginTop="1%" className="rounded-2xl" bgColor="white"  align="center" justify="center" w="100%" h="100%">
                            <HStack ml="3%" alignItems="center" justify="start" w="80%">
                                <Text fontSize='100%'>{item.email}</Text>
                            </HStack>
                            <HStack spacing={4} alignItems="center" justify="center" w="20%">
                                <Button bg="red">
                                    <CloseIcon w={3} h={3} color="white" />
                                </Button>
                                <Button onClick={() => (setisAccept(true), setEmail(item.email))} bg="green">
                                    <CheckIcon w={3} h={3} color="white" />
                                </Button>
                            </HStack>
                        </HStack>
                    </Box>  
                </VStack> 
            ))}      
        </VStack>
        <HStack width="100%" height="6%" bg="gray.200" justify="center">
                        <Button
                            width="1%"
                            height="60%"
                            bg="#F1D803"

                            colorScheme="teal"
                        >
                            <ArrowBackIcon width={4} height={4} color="black" />
                        </Button>
                        <Text>1</Text>
                        <Button
                            width="1%"
                            height="60%"
                            bg="#F1D803"

                            colorScheme="teal"
                        >
                            <ArrowForwardIcon width={4} height={4} color="black" />
                        </Button>
                    </HStack>
        {isAccept && (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-4 w-5/6 max-w-md border text-center border-gray-300 rounded-3xl shadow-md relative z-20 ">
              <h2 className="text-xl font-bold mb-4">Confirmacion de Autorizacion de Usuario</h2>
              <p className="font-semibold">¿Esta seguro de querer agregar al siguiente usuario?</p>
              <p className="font-bold">{Email}</p>
              <VStack mb={4} textAlign='start' justifyContent="start" alignItems='start' mt={5} >
              <Checkbox>¿Desea agregar este dominio a la lista de dominios autorizados y aceptar a todos los usuarios registrados con este dominio a espera de autorizacion?</Checkbox>
              </VStack>
              <p className="font-bold">No acepte esta opcion si el dominio no es privado</p>
             
              <HStack mt={4} justify="center" align="center">
                <Button bgColor="red.500" colorScheme="teal" className=" px-4 py-2 rounded" onClick={() => setisAccept(false)}>
                    Cerrar
                </Button>
                <Button textColor="black" bgColor="#F1D803" colorScheme="teal" className=" px-4 py-2 rounded" onClick={() => setisAccept(false)}>
                    Aceptar
                </Button>
              </HStack>
            </div>
          </div>)}
    </>
    
);

}


export const CreateSmallUser = () =>  {
    const [Email, setEmail] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [filteredValue, setFilteredValue] = useState('');
    const [isAccept, setisAccept] = useState(false);

    const filteredData = create.filter(item =>
        item.email.startsWith(filteredValue)  

    );
    
    const handleFilterClick = () => {
        if (inputValue.trim() !== '') {
            setFilteredValue(inputValue.trim());
        } else {
            setFilteredValue('');
        }
    };
    const router = useRouter();

     

    

return(
    <>
        <HStack className="mt-3 mb-3">
            <Input fontSize="60%" width='58%' border='1px' backgroundColor='white' placeholder="Usuario"></Input>
            <Button width={6} colorScheme='teal' backgroundColor='#F1D803'>
                <SearchIcon w={5} h={5} color='black'></SearchIcon>
            </Button>
        </HStack>
        <VStack overflow="auto" w="100%" bgColor="gray.200" height="400" justify='flex-start' alignItems="flex-start">
            {filteredData.map ((item) => (
                <VStack key={item.id} w="100%">
                    <Box w="100%" h="30" whiteSpace="nowrap"   justifyContent='center' alignItems="center" className="rounded-2xl" bg="gray.200">
                        <HStack marginTop="1%" className="rounded-2xl" bgColor="white"  align="center" justify="center" w="100%" h="100%">
                            <HStack ml="3%" alignItems="center" justify="start" w="70%">
                                <Text fontSize='50%'>{item.email} </Text>
                            </HStack>
                            <HStack spacing={2} alignItems="center" justify="start" w="30%">
                                <Box w="5"   bg="red">
                                <CloseIcon w={2} h={2} color="white" />
                                </Box>
                                <Box w="5"  onClick={() => (setisAccept(true), setEmail(item.email))} bg="green">
                                <CheckIcon w={2} h={2} color="white" />
                                </Box>
                            </HStack>
                        </HStack>
                    </Box>
                </VStack>
            ))}
        </VStack>
        {isAccept && (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-4 w-5/6 max-w-md border text-center border-gray-300 rounded-3xl shadow-md relative z-20 ">
              <h2 className="text-xl font-bold mb-4">Confirmacion de Autorizacion de Usuario</h2>
              <p className="font-semibold">¿Esta seguro de querer agregar al siguiente usuario?</p>
              <p className="font-bold">{Email}</p>
              <VStack mb={4} textAlign='start' justifyContent="start" alignItems='start' mt={5} >
              <Checkbox>¿Desea agregar este dominio a la lista de dominios autorizados y aceptar a todos los usuarios registrados con este dominio a espera de autorizacion?</Checkbox>
              </VStack>
              <p className="font-bold">No acepte esta opcion si el dominio no es privado</p>
             
              <HStack mt={4} justify="center" align="center">
                <Button bgColor="red.500" colorScheme="teal" className=" px-4 py-2 rounded" onClick={() => setisAccept(false)}>
                    Cerrar
                </Button>
                <Button textColor="black" bgColor="#F1D803" colorScheme="teal" className=" px-4 py-2 rounded" onClick={() => setisAccept(false)}>
                    Aceptar
                </Button>
              </HStack>
            </div>
          </div>)}
    </>
    
);

}