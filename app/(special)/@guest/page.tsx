'use client'
import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { useState } from "react"; // Importar useState para manejar el estado

export default function GuestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

 

  return (
    <div className="flex w-full h-screen items-center justify-center lg:w-full bg-gradient-to-tr from-green-900 to-green-700">
      <Box bgColor="white" className="rounded-2xl p-12 lg:w-[40%] sm:w-[60%] w-[80%] h-[50%] lg:h-[46%] sm:h-[50%] content-center">
        <HStack justify="center" h="20%">
          <HStack display="inline-flex" className="p-4 bg-gray-400">
            <Image
              src="/grupo-ecopetrol.png"
              alt="Descripción de la imagen"
              w="160px"
              h="70px"
            />
            <HStack className="bg-black w-1 h-16"></HStack>
            <VStack spacing={0} align="start" textAlign="start">
              <Text className="text-black">REFINERIA</Text>
              <Text className="text-black">DE CARTAGENA</Text>
            </VStack>
          </HStack>
        </HStack>

        <VStack h="10%"></VStack>

        <VStack justify="center" h="40%" align="center">
          <Text className="font-semibold text-start" fontSize="90%">
            Hola Usuario
          </Text>
          <Text fontSize="80%">
            Por favor espera a que el administrador valide tu información para acceder.
          </Text>
        </VStack>

        <VStack className="mt-5 lg:mt-0 sm:mt-3" justify="center" h="20%">
          <Text fontSize="80%">
            Informe al administrador de su registro si aun no lo ha hecho para identificarse
          </Text>
          <Text
            textColor="blue"
            className="font-bold text-center underline underline-offset-4 decoration-blue-700 cursor-pointer"
            fontSize="80%"
            
          >
            ¿como identificarse?
          </Text>
        </VStack>

        <VStack h="10%"></VStack>
      </Box>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          
        >
          <div className="bg-white rounded-lg p-4 max-w-md w-full relative">
            <h2 className="text-lg font-bold mb-4">¿Cómo identificarse?</h2>
            <p className=" mt-1">Para identificarse como proveedor nuevo o miembro de uno existente porfavor mandar la siguiente informacion:</p>
            <p className=" mt-3 font-bold">*</p>
            <p className="  font-bold">*</p>
            <p className=" font-bold">*</p>
            <p className=" mt-2">Enviar todo al siguiente correo electronico y esperar a confirmacion</p>
            <p  className=" mt-2 text-center font-bold">********@gmail.com</p>
            <button
              onClick={handleCloseModal} // Cerrar modal al hacer clic en el botón
              
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

