"use client";
import React, { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  Flex,
  Box,
  Stack,
  HStack,
  VStack,
  Button,
  Text,
  Heading,
  ChakraProvider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  SmallCloseIcon,
  DeleteIcon,
  RepeatClockIcon,
  LinkIcon,
  ArrowBackIcon,
} from "@chakra-ui/icons";
import { Associate_invoice } from "@/app/_ui/Associate_invoice";
import { CreatelargeAdmin } from "@/app/_ui/Createstate";
import { useSharedState } from "@/app/_ui/useSharedState";

export default function Userpage() {
  const { state, updateState } = useSharedState();
  const [showRightBox, setShowRightBox] = useState(false);
  const [isinicio, setisinicio] = useState(false);
  const [State, setState] = useState(false);
  const [Add, setAdd] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/logout", {
        method: "GET",
      });

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const screen = (numero: number) => {
    if (numero == 1) {
      setAdd(true);
      setState(false);
    }
    if (numero == 2) {
      setAdd(false);
      setState(true);
    }
  };

  const Asociar = () => {
    setisinicio(false);
  };
  const Estado = () => {
    router.push("/app/estado_factura");
  };

  const router = useRouter();

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleClick = () => {
    Asociar();
  };

  const HandleLogout = () => {
    redirect("@/app/(auth)/logout/route");
  };

  return (
    <ChakraProvider>
      <div className=" flex w-full h-screen items-center justify-center lg:w-full bg-gradient-to-tr from-green-900 to-green-700 ">
        {!isinicio ?
          <Box className="bg-gray-200 relative px-10 py-20 rounded-3xl lg:w-96 lg:h-30">
            <Stack>
              <VStack>
                <HStack className="absolute top-5 ">
                  <Heading marginLeft="10%">Bienvenido</Heading>
                  <Menu>
                    <MenuButton style={{ marginLeft: "7%" }}>
                      <HamburgerIcon w={8} h={8} color="black" />
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<DeleteIcon color="red.500" />}>
                        Eliminar Cuenta
                      </MenuItem>
                      <MenuItem
                        onClick={handleLogout}
                        icon={<SmallCloseIcon color="black" />}>
                        Cerrar Sesíon
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
                <Text className="absolute top-14 " color="black">
                  Juan Rios
                </Text>
                <VStack marginTop="15%" align="stretch">
                  <Button
                    onClick={() => (setisinicio(true), screen(2))}
                    style={{ marginTop: "30%" }}
                    colorScheme="teal"
                    backgroundColor="#F1D803">
                    <HStack>
                      <Text color="black">Estado de Facturas</Text>
                      <RepeatClockIcon w={5} h={5} color="black" />
                    </HStack>
                  </Button>
                  <Button
                    onClick={() => (setisinicio(true), screen(1))}
                    style={{ marginBottom: "40%", marginTop: "10%" }}
                    colorScheme="teal"
                    backgroundColor="#F1D803">
                    <HStack>
                      <Text color="black">Asociar Facturas</Text>
                      <LinkIcon marginLeft="7%" w={5} h={5} color="black" />
                    </HStack>
                  </Button>
                </VStack>
              </VStack>
            </Stack>
          </Box>
        : <>
            <div
              className={`relative p-4 bg-gray-100 border border-gray-300 text-center h-[82%] w-[80%]  rounded-3xl shadow-md flex flex-col`}>
              {Add === true && (
                <Associate_invoice
                  setisTable={setisinicio}
                  isTable={isinicio}
                  sharedState={state}
                  updateSharedState={updateState}
                />
              )}
              {State === true && (
                <>
                  <Flex
                    width="100%"
                    alignItems="center"
                    justifyContent="space-between"
                    p={2}
                    className="rounded-2xl"
                    position="relative">
                    <Box position="absolute" left={1}>
                      <Button
                        onClick={() => setisinicio(false)}
                        mb={2}
                        colorScheme="teal"
                        backgroundColor="#F1D803">
                        <ArrowBackIcon width={5} height={5} color="black" />
                      </Button>
                    </Box>
                    <Box flex={1} textAlign="center">
                      <Text fontSize="xl" fontWeight="bold">
                        Estado Factura
                      </Text>
                    </Box>
                  </Flex>

                  <CreatelargeAdmin
                    sharedState={state}
                    updateSharedState={updateState}
                  />
                </>
              )}
            </div>
          </>
        }
      </div>
    </ChakraProvider>
  );
}

/*{showRightBox && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-4 w-5/6 max-w-md border text-center border-gray-300 rounded-3xl shadow-md relative z-20 ">
                      <h2 className="text-xl font-bold mb-4">Asociar Factura</h2>
                      <p>Ingrese el orden de factura a asociar</p>
                      <Input type="number" value={inputValue}  onChange={handleInputChange}  width="70%" placeholder="Orden de Factura"></Input>
                      
                      <HStack mt={5} justify="center" align="center">
                        <Button 
                          colorScheme='teal'
                          bgColor="red.500"
                          textColor="white"
                          className=" px-4 py-2 rounded"
                          onClick={() => setShowRightBox(false)}
                        >
                          Cerrar
                        </Button>
                        <Button 
                          colorScheme='teal' backgroundColor='#F1D803'
                          textColor="black"
                          className=" px-4 py-2   rounded"
                          onClick={handleClick}
                        >
                          Buscar
                        </Button>
                      </HStack>
                    </div>
                  </div>
                )}

                */
