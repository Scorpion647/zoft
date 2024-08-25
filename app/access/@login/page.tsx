"use client"
import Image from "next/image";
import { login } from "@/app/_lib/login";
import { useFormContext } from "@/app/_lib/utils/formContext"
import AccessForm, { FormType } from "@/app/_ui/components/accessForm";
import AccessCardContainer from "@/app/_ui/components/accessCardContainer";
import { Select, Stack, HStack, VStack, Text, Input, Button, Box, ChakraProvider, IconButton, Heading } from '@chakra-ui/react'




export default function LoginPage() {
    const { setFormType } = useFormContext();
    const handleLogin = async (data: FormData) => {
        return login(data);
    };

    return (
        <ChakraProvider>
            <div className="w-full flex items-center justify-center lg:w-1/2 bg-gradient-to-tr from-green-900 to-green-700 ">
                <Box className='bg-gradient-to-tr border-2 border-black from-gray-200 to-gray-300 px-10 py-20 rounded-3xl'>
                    <VStack >
                        <Heading mb="2" h={10} color='black' style={{ fontSize: '200%' }} noOfLines={1}>Inicio de sesion</Heading>
                        <AccessForm type={FormType.Login} action={handleLogin} />


                        <IconButton colorScheme='gray' aria-label='Search database'>
                            <Image alt='' src='/google.png' width={30} height={30} />
                        </IconButton>
                        <VStack spacing='0px'>
                            <Text fontSize='sm'>¿No esta registrado?</Text>
                            <HStack style={{ marginBottom: '40%' }}>
                                <Text fontSize='sm'>Registrese</Text>
                                <Text onClick={() => { setFormType(FormType.SignUp) }} cursor="pointer" fontSize='sm' color='blue'>aqui</Text>
                            </HStack>
                        </VStack>

                    </VStack>
                </Box>
            </div>
        </ChakraProvider>
    )
}