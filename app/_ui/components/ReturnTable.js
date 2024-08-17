import React, { useState, useEffect, useRef } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { getRecords, getRecordsInfo } from '@/app/_lib/database/service';
import { VStack, Select, Box, HStack } from '@chakra-ui/react';

function formatMoney(amount) {
  return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
  });
}

const ReturnTable = ({ suppliers }) => {
  const hotTableRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [billNumberFilter, setBillNumberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isRecordComplete = (record) => {
    return record.record_id !== null &&
           record.bill_number &&
           record.trm !== null &&
           record.billed_quantity !== null &&
           record.billed_unit_price !== null &&
           record.billed_total_price !== null &&
           record.gross_weight !== null &&
           record.packages !== null &&
           record.status;
  };

  const handleFetchData = async () => {
    try {
      const allRecords = await getRecords(1, 1000);
      const matchingRecords = allRecords.filter(record => record.purchase_order === suppliers);
      const recordIds = matchingRecords.map(record => record.id);
      const recordDetailsPromises = recordIds.map(id => getRecordsInfo(1,1000));
      const recordDetails = await Promise.all(recordDetailsPromises);
      const allRecordDetails = recordDetails.flat();
      const uniqueRecordDetails = Array.from(new Map(allRecordDetails.map(record => [record.record_id, record])).values());
      const filteredData = uniqueRecordDetails.filter(detail =>
        matchingRecords.some(mr => mr.id === detail.record_id)
      );
      const completeData = filteredData.filter(isRecordComplete);
      const sortedData = completeData.sort((a, b) => a.bill_number.localeCompare(b.bill_number));

      const formattedData = sortedData.map(record => [
        record.bill_number,
        record.trm,
        record.billed_quantity,
        formatMoney(record.billed_unit_price/100),
        formatMoney(((record.billed_unit_price/100)*(record.billed_quantity))),
        record.gross_weight,
        record.packages,
        record.status
      ]);

      setTableData(formattedData);
      setFilteredData(formattedData); // Inicialmente muestra todos los datos
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    }
  };

  const handleBillNumberChange = (event) => {
    const selectedBillNumber = event.target.value;
    setBillNumberFilter(selectedBillNumber);
  };

  const handleStatusChange = (event) => {
    const selectedStatus = event.target.value;
    setStatusFilter(selectedStatus);
  };

  useEffect(() => {
    handleFetchData();
  }, [suppliers]);

  useEffect(() => {
    let newFilteredData = tableData;

    if (billNumberFilter !== 'all') {
      newFilteredData = newFilteredData.filter(row => row[0] === billNumberFilter);
    }

    if (statusFilter !== 'all') {
      newFilteredData = newFilteredData.filter(row => row[7] === statusFilter);
    }

    setFilteredData(newFilteredData);
  }, [billNumberFilter, statusFilter, tableData]);

  const uniqueBillNumbers = [...new Set(tableData.map(row => row[0]))];
  const uniqueStatuses = [...new Set(tableData.map(row => row[7]))];

  return (
    <div className='items-center justify-self-center h-[400px] w-full'>
      <HStack>
          <Select value={billNumberFilter} onChange={handleBillNumberChange} >
            <option value="all">Todas</option>
            {uniqueBillNumbers.map((billNumber, index) => (
              <option key={index} value={billNumber}>{billNumber}</option>
            ))}
          </Select>

          <Select value={statusFilter} onChange={handleStatusChange} >
            <option value="all">Todos</option>
            {uniqueStatuses.map((status, index) => (
              <option key={index} value={status}>{status}</option>
            ))}
          </Select>
        </HStack>
      <VStack alignItems="center" align="center" justify="center" className='bg-gray-300'>

        <HotTable
          ref={hotTableRef}
          data={filteredData}
          colHeaders={['No.Factura', 'TRM', 'Cantidad', 'Precio Unitario', 'Precio Total', 'Peso x material', 'Bultos', 'Estado']}
          columns={[
            { data: 0, type: 'text', readOnly: "true" },
            { data: 1, type: 'numeric', readOnly: "true" },
            { data: 2, type: 'numeric', readOnly: "true" },
            { data: 3, type: 'numeric', readOnly: "true" },
            { data: 4, type: 'numeric', readOnly: "true" },
            { data: 5, type: 'numeric', readOnly: "true" },
            { data: 6, type: 'numeric', readOnly: "true" },
            { data: 7, type: 'dropdown', source: ['pending', 'approved', 'rejected'] }
          ]}
          rowHeaders={true}
          width="100%"
          height="440"
          stretchH="all"
          licenseKey="non-commercial-and-evaluation"
          cells={(row, col, prop) => {
            const cellProperties = {};
            const editableStyle = { backgroundColor: '#EFFF82' };
            const readonlyStyle = { backgroundColor: '#f5c6c6' };
            const reset = { backgroundColor: '' };

            if (filteredData[row] && filteredData[row].length > 7) {
              if (col === 7) {
                if (filteredData[row][7] === "pending") {
                  cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                    Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                    td.style.backgroundColor = editableStyle.backgroundColor;
                    td.title = 'Pendiente a revision';
                  };
                } else if (filteredData[row][7] === "approved") {
                  cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                    Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                    td.style.backgroundColor = reset.backgroundColor;
                    td.title = '';
                  };
                } else if (filteredData[row][7] === "rejected") {
                  cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                    Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                    td.style.backgroundColor = readonlyStyle.backgroundColor;
                    td.title = '';
                  };
                }
              }
            }

            return cellProperties;
          }}
        />
      </VStack>
    </div>
  );
};

export default ReturnTable;












