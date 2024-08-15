'use client';

import { useState, useRef, useEffect } from "react";
import { Flex, Box, VStack,  HStack,  Button, Text, Input, Icon } from "@chakra-ui/react";
import { SearchIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";
import { IoMenu } from "react-icons/io5";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { getSuppliers } from '@/app/_lib/database/service'; 
import {Gettempleados} from '@/app/_ui/Gettempleados'


export const CreatelargeDomain = () => {

    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [hola, setHola] = useState(true); 

    useEffect(() => {
        const fetchSuppliers = async () => {
            const data = await getSuppliers(1, 10, search);
            if (data) {
                setSuppliers(data);
            }
        };

        fetchSuppliers();
    }, [search]);


    const handleSupplierClick = (supplier) => {
        setSelectedSupplier(supplier);
        setHola(false);
    };

    if (!hola && selectedSupplier) {
        return <Gettempleados supplier={selectedSupplier} />;
    }

    return (
        <>
            {hola && (
                <>
                <Flex w="100%" className="mt-3 mb-3" justify="space-between" align="center">
                <HStack>
                    <Input width='80%' border='1px' backgroundColor='white' placeholder="Dominio" />
                    <Button colorScheme='teal' backgroundColor='#F1D803'>
                        <SearchIcon w={5} h={5} color='black'></SearchIcon>
                    </Button>
                </HStack >
                <Button colorScheme='teal' backgroundColor='#F1D803'>
                    <AddIcon w={5} h={5} color='black'></AddIcon>
                </Button>
            </Flex >
            <VStack w="100%" bgColor="gray.200" height="400" justify='flex-start' alignItems="flex-start">
            <VStack  whiteSpace="nowrap"  justifyContent='center' alignItems="center"  bg="gray.200" w="100%" h="50">
                    <HStack paddingRight={2} paddingLeft={2}  bgColor="white" align="center" justify="center" w="100%" h="100%">
                    <HStack ml="3%" alignItems="center" justify="start" width="30%">
                    <Text className="font-bold" >Dominio</Text>
                        </HStack>
                        <Text className="font-bold" width="60%">Proveedor</Text>
                        <VStack width="10%"></VStack>
                    </HStack>
                </VStack>
            <VStack overflow="auto" width="100%" >
            {suppliers.map(supplier => (
                        <Box
                            key={supplier.id}
                            whiteSpace="nowrap"
                            paddingRight={2}
                            paddingLeft={2}
                            justifyContent='center'
                            alignItems="center"
                            className="rounded-2xl"
                            onClick={() => handleSupplierClick(supplier.domain)}
                            bg="gray.200"
                            w="100%"
                            h="100%"
                        >
                            <HStack
                                className="rounded-2xl"
                                bgColor="white"
                                align="center"
                                justify="center"
                                w="100%"
                                h="50px"
                            >
                                <HStack ml="3%" alignItems="center" justify="start" width="30%">
                                    <Text>{supplier.domain}</Text>
                                </HStack>
                                <Text width="60%">{supplier.name}</Text>
                                <VStack width="10%">
                                    <Icon as={IoEllipsisVerticalSharp} w={4} h={4} color='black' />
                                </VStack>
                            </HStack>
                        </Box>
                    ))}
                
            </VStack>
            </VStack>
                </>
            )}

        </>
    );
}


export const CreateSmallDomain = () => {

    return (
        <>
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
            <VStack overflow="auto" w="100%" bgColor="gray.200" height="400" justify='flex-start' alignItems="flex-start">
                <Box whiteSpace="nowrap" justifyContent='center' alignItems="center" className="rounded-2xl" bg="gray.200" w="100%" h="50">
                    <HStack marginTop="1%" className="rounded-2xl" bgColor="white" align="center" justify="center" w="100%" h="100%">
                        <HStack ml="5%" alignItems="center" justify="start" w="80%">
                            <Text fontSize='50%'>unicartagena.edu.co</Text>
                        </HStack>
                        <HStack spacing={2} alignItems="center" justify="center" w="20%">
                            <Box w={6} bg="red">
                                <CloseIcon w={2} h={2} color="white" />
                            </Box>
                        </HStack>
                    </HStack>
                </Box>
            </VStack>
        </>
    );
}