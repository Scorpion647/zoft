import React, { useState, useEffect } from 'react';
import Handsontable from 'handsontable';
import { HotTable } from '@handsontable/react';
import { getRecords} from '@/app/_lib/database/service';
import { Box, VStack, Input } from '@chakra-ui/react';

const TableComponent = ({suppliers}) => {
    const [purchaseOrder, setPurchaseOrder] = useState(suppliers);
    const [tableData, setTableData] = useState([]);
    
  
   
    const getStartOfDay = () => {
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0); 
      return now.toISOString().split('.')[0] + '+00'; 
    };

    const isRecordComplete = (record) => {
      return record.position !== null &&
             record.bill_number &&
             record.trm !== null &&
             record.billed_quantity !== null &&
             record.billed_net_price !== null &&
             record.currency &&
             record.unit_of_measure &&
             record.supplier_name &&
             record.subheading;
    };
  
    const handleFetchData = async () => {
      try {
        const args = {
          page_number: 1,
          page_size: 100,
          search: ""

        };
        const result = await getRecords(args);
  
        if (result instanceof Error) {
          console.error(result);
          alert(`Error fetching records: ${result.message}`);
          return;
        }
  
        const filteredData = result.filter(record => record.purchase_order === purchaseOrder);
  
        const completeData = filteredData.filter(isRecordComplete);
  
        const sortedData = completeData.sort((a, b) => a.position - b.position);
  
        const formattedData = sortedData.map(record => [
          record.position,
          record.bill_number,
          record.trm,
          record.billed_quantity,
          record.billed_net_price,
          record.currency,
          record.unit_of_measure,
          record.supplier_name,
          record.subheading
        ]);
  
        setTableData(formattedData);
      } catch (error) {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred.');
      }
    };
  
    useEffect(() => {
      if (purchaseOrder) {
        handleFetchData();
      }
    }, [purchaseOrder]);
  
    return (
      <div  className='  items-center justify-self-center h-[500px] w-full'>
        <VStack>
          <Input
            type="text"
            width="30%"
            value={purchaseOrder}
            onChange={(e) => setPurchaseOrder(e.target.value)}
            placeholder="Orden de Compra"
          />
        </VStack>
        <VStack alignItems="center" align="center" justify="center" className='bg-gray-300'>
        <HotTable
          data={tableData}
          colHeaders={['Position', 'Bill Number', 'TRM', 'Billed Quantity', 'Billed Net Price', 'Currency', 'Unit of Measure', 'Supplier Name', 'Subheading']}
          columns={[
            { data: 0, type: 'numeric' },
            { data: 1, type: 'text' },
            { data: 2, type: 'numeric' },
            { data: 3, type: 'numeric' },
            { data: 4, type: 'numeric' },
            { data: 5, type: 'text' },
            { data: 6, type: 'text' },
            { data: 7, type: 'text' },
            { data: 8, type: 'text' }
          ]}
          rowHeaders={true}
          width="100%"
          height="400"
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
        />
        </VStack>
      </div>
    );
  };
  
  export default TableComponent;