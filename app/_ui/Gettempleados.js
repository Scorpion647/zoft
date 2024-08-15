import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Icon } from "@chakra-ui/react";
import { IoEllipsisVerticalSharp } from "react-icons/io5";
import { getEmployees } from '@/app/_lib/database/service'; 


export const Gettempleados = ({ supplier }) => {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            const domainPart = supplier.domain.split('@')[1];
            try {
                const data = await getEmployees(supplier.id);

                console.log('Fetched employees:', data);

                if (Array.isArray(data)) {
                    const filteredEmployees = data.filter(emp => emp.email?.split('@')[1] === domainPart);
                    setEmployees(filteredEmployees);
                } else {
                    
                    console.error('Error: data is not an array or is null/undefined', data);
                    setEmployees([]); 
                }
            } catch (e) {
                console.error('Error fetching employees:', e);
                setError('Error fetching employees');
            }
        };

        fetchEmployees();
    }, [supplier]);

    return (
        <VStack w="100%" bgColor="gray.200" height="400" justify='flex-start' alignItems="flex-start">
            <Box
                whiteSpace="nowrap"
                paddingRight={2}
                paddingLeft={2}
                justifyContent='center'
                alignItems="center"
                bg="gray.200"
                w="100%"
                h="50"
            >
                <HStack className="rounded-2xl" bgColor="white" align="center" justify="center" w="100%" h="100%">
                    <HStack ml="3%" alignItems="center" justify="start" width="30%">
                        <Text className="font-bold">Nombre</Text>
                    </HStack>
                    <Text className="font-bold" width="60%">Email</Text>
                    <VStack width="10%"></VStack>
                </HStack>
            </Box>
            {error && <Text color="red.500">{error}</Text>}
            <VStack overflow="auto" width="100%">
                {employees.map(emp => (
                    <Box
                        key={emp.user_id}
                        whiteSpace="nowrap"
                        paddingRight={2}
                        paddingLeft={2}
                        justifyContent='center'
                        alignItems="center"
                        className="rounded-2xl"
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
                                <Text>{emp.full_name}</Text>
                            </HStack>
                            <Text width="60%">{emp.email}</Text>
                            <VStack width="10%">
                                <Icon as={IoEllipsisVerticalSharp} w={4} h={4} color='black' />
                            </VStack>
                        </HStack>
                    </Box>
                ))}
            </VStack>
        </VStack>
    );
}