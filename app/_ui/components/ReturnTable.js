import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { getRecords, getRecordsInfo, updateRecordInfo } from '@/app/_lib/database/service';
import { VStack, Select, Box, HStack, Spinner, Text, Button } from '@chakra-ui/react';


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
  const [isLoading, setIsLoading] = useState(false);
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const allRecords = await getRecords(1, 1000);
      const matchingRecords = allRecords.filter(record => record.purchase_order === suppliers);
      const recordIds = matchingRecords.map(record => record.id);
      const recordDetailsPromises = recordIds.map(id => getRecordsInfo(1, 1000));
      const recordDetails = await Promise.all(recordDetailsPromises);
      const allRecordDetails = recordDetails.flat();
      const uniqueRecordDetails = Array.from(new Map(allRecordDetails.map(record => [record.record_id, record])).values());
      const filteredData = uniqueRecordDetails.filter(detail =>
        matchingRecords.some(mr => mr.id === detail.record_id)
      );
      const completeData = filteredData.filter(isRecordComplete);
      const sortedData = completeData.sort((a, b) => a.bill_number.localeCompare(b.bill_number));

      const formattedData = sortedData.map(record => ({
        original: record,
        display: [
          record.bill_number,
          record.trm,
          record.billed_quantity,
          formatMoney(record.billed_unit_price / 100),
          formatMoney(((record.billed_unit_price / 100) * (record.billed_quantity))),
          record.gross_weight,
          record.packages,
          record.status
        ]
      }));

      setTableData(formattedData);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [suppliers]);

  useEffect(() => {
    const newFilteredData = tableData.map(({ original, display }) => display)
      .filter(row => 
        (billNumberFilter === 'all' || row[0] === billNumberFilter) &&
        (statusFilter === 'all' || row[7] === statusFilter)
      );
    setFilteredData(newFilteredData);
  }, [billNumberFilter, statusFilter, tableData]);

  const uniqueBillNumbers = useMemo(() => [...new Set(tableData.map(({ display }) => display[0]))], [tableData]);
  const uniqueStatuses = useMemo(() => [...new Set(tableData.map(({ display }) => display[7]))], [tableData]);

  const handleUpdate = async () => {
    const hotInstance = hotTableRef.current.hotInstance;
    const updatedData = hotInstance.getData();
    
    const updates = tableData.filter((entry, index) => {
      const updatedStatus = updatedData[index][7];
      return entry.original.status !== updatedStatus;
    }).map(async (entry, index) => {
      const updatedStatus = updatedData[index][7];
      return await updateRecordInfo(entry.original.record_id, { status: updatedStatus });
    });

    try {
      await Promise.all(updates);
      alert('Registros actualizados exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error actualizando registros:', error);
      alert('Hubo un problema al actualizar los registros.');
    }
  };

  const changeSelectedStatus = (status) => {
    const hotInstance = hotTableRef.current.hotInstance;
    const selected = hotInstance.getSelected();
  
    if (selected) {
      hotInstance.batch(() => {
        selected.forEach(([row1, col1, row2, col2]) => {
          if (col1 <= 7 && 7 <= col2) {
            const startRow = Math.max(row1, 0);
            const endRow = Math.min(row2, hotInstance.countRows() - 1);
  
            for (let row = startRow; row <= endRow; row++) {
              const currentStatus = hotInstance.getDataAtCell(row, 7);
              if (currentStatus !== status) {
                hotInstance.setDataAtCell(row, 7, status);
              }
            }
          }
        });
      });
    }
  };
  

  return (
    <div className='items-center justify-self-center h-[400px] w-full'>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="450">
          <Spinner size="xl" />
          <Text ml={4}>Cargando registros...</Text>
        </Box>  
      )}
      {!isLoading && (
        <>
          <HStack mb={3}>
            <Select value={billNumberFilter} onChange={(e) => setBillNumberFilter(e.target.value)}>
              <option value="all">Todas</option>
              {uniqueBillNumbers.map((billNumber, index) => (
                <option key={index} value={billNumber}>{billNumber}</option>
              ))}
            </Select>
            <Button
              width="40%"
              onClick={handleUpdate}
              bgColor="#F1D803"
              variant="solid"
              colorScheme='teal'
              textColor="black" 
            >
              Actualizar
            </Button>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              className="relative z-0"
              colHeaders={['No.Factura', 'TRM', 'Cantidad', 'Precio Unitario', 'Precio Total', 'Peso x material', 'Bultos', 'Estado']}
              columns={[
                { data: 0, type: 'text', readOnly: true },
                { data: 1, type: 'numeric', readOnly: true },
                { data: 2, type: 'numeric', readOnly: true },
                { data: 3, type: 'numeric', readOnly: true },
                { data: 4, type: 'numeric', readOnly: true },
                { data: 5, type: 'numeric', readOnly: true },
                { data: 6, type: 'numeric', readOnly: true },
                { data: 7, type: 'dropdown', source: ['pending', 'approved', 'rejected'] }
              ]}
              rowHeaders={true}
              width="100%"
              height="430"
              stretchH="all"
              licenseKey="non-commercial-and-evaluation"
              contextMenu={{
                items: {
                  "change-to-rejected": {
                    name: 'Cambiar estado a "rejected"',
                    callback: () => changeSelectedStatus('rejected'),
                  },
                  "change-to-pending": {
                    name: 'Cambiar estado a "pending"',
                    callback: () => changeSelectedStatus('pending'),
                  },
                  "change-to-approved": {
                    name: 'Cambiar estado a "approved"',
                    callback: () => changeSelectedStatus('approved'),
                  },
                  "---------": Handsontable.plugins.ContextMenu.SEPARATOR,
                  "copy": {},
                  "cut": {},
                  "paste": {}
                }
              }}
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
              } }
            />
          </VStack>
          
        </>
      )}
    </div>
  );
};

export default ReturnTable;











/*


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import Handsontable from 'handsontable';
import { getRecords, getRecordsInfo, getMaterial, getSupplier } from '@/app/_lib/database/service';
import { VStack, Select, Box, HStack, Spinner, Text, Button } from '@chakra-ui/react';

function formatMoney(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseMoney(amount) {
  return parseFloat(amount.replace(/[^0-9.-]+/g, ''));
}

const Material = async (code, number) => {
  const material = await getMaterial(code);
  if (number === 0) return material.subheading;
  if (number === 1) return material.measurement_unit;
  if (number === 2) return material.type;
};

const Typematerial = (type) => {
  if (type === 'national') return 'NACIONAL';
  if (type === 'foreign') return 'EXTRANJERO';
  return 'OTRO';
};

const ReturnTable = ({ suppliers }) => {
  const hotTableRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [billNumberFilter, setBillNumberFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const isRecordComplete = (record) => {
    return record.record_id !== null &&
           record.bill_number &&
           record.trm !== null &&
           record.billed_quantity !== null &&
           record.billed_unit_price !== null &&
           record.gross_weight !== null &&
           record.packages !== null &&
           record.status;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log(suppliers.code)
    const allRecords = await getRecords(1, 1000);
    
    const allRecordDetails = await getRecordsInfo(1, 1000);

    const supplierCode = suppliers;

    const filteredRecords = allRecords.filter(record =>
      record.purchase_order === supplierCode
    );

    const filteredRecordIds = filteredRecords.map(record => record.id);

    const filteredRelatedData = allRecordDetails.filter(detail =>
      filteredRecordIds.includes(detail.record_id)
    );

    const sortedData = filteredRelatedData.sort((a, b) =>
      a.bill_number.localeCompare(b.bill_number)
    );

    const materialsPromises = sortedData.map(async (record) => {
      const relatedRecord = allRecords.find((r) => r.id === record.record_id);
      const material = await Material(relatedRecord.material_code, 0);
      const unit = await Material(relatedRecord.material_code, 1);
      const type = await Material(relatedRecord.material_code, 2);
      const supplier = await getSupplier(relatedRecord.supplier_id);
      const conversion =
        record.unit === 'U'
          ? 1
          : parseFloat(
              (record.gross_weight / record.billed_quantity).toFixed(8)
            );

              return [
                  relatedRecord.purchase_order,
                  relatedRecord.item,
                  relatedRecord.material_code,
                  relatedRecord.description,
                  record.billed_quantity,
                  relatedRecord.measurement_unit,
                  supplier.name,
                  parseFloat(parseFloat((record.billed_unit_price / 100) / record.trm).toFixed(8)),
                  record.bill_number,
                  material,
                  unit,
                  record.trm,
                  formatMoney(parseFloat((record.billed_unit_price / 100) / record.trm) * record.billed_quantity),
                  formatMoney(record.billed_unit_price / 100),
                  formatMoney((record.billed_unit_price / 100) * record.billed_quantity),
                  Typematerial(type),
                  record.gross_weight,
                  record.gross_weight,
                  record.packages,
                  conversion,
                  record.status
              ];
          });

          const formattedData = await Promise.all(materialsPromises);
          setTableData(formattedData);
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(`An unexpected error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [suppliers]);

  useEffect(() => {
    const newFilteredData = tableData.filter(row =>
      (billNumberFilter === 'all' || row[8] === billNumberFilter) &&
      (statusFilter === 'all' || row[20] === statusFilter) 
    );
    setFilteredData(newFilteredData);
  }, [billNumberFilter, statusFilter, tableData]);

  const uniqueBillNumbers = useMemo(() => [...new Set(tableData.map(row => row[8]))], [tableData]);
  const uniqueStatuses = useMemo(() => [...new Set(tableData.map(row => row[20]))], [tableData]);

  const handleUpdate = async () => {
    const hotInstance = hotTableRef.current.hotInstance;
    const updatedData = hotInstance.getData();
    
    const updates = tableData.map((entry, index) => {
      const updatedStatus = updatedData[index][20];
      if (entry[20] !== updatedStatus) {
        return updateRecordInfo(entry[0], { status: updatedStatus });
      }
      return null;
    }).filter(update => update !== null);

    try {
      await Promise.all(updates);
      alert('Registros actualizados exitosamente');
      fetchData(); 
    } catch (error) {
      console.error('Error actualizando registros:', error);
      alert(`Hubo un problema al actualizar los registros: ${error.message}`);
    }
  };

  const changeSelectedStatus = (status) => {
    const hotInstance = hotTableRef.current.hotInstance;
    const selected = hotInstance.getSelected();

    if (selected) {
      hotInstance.batch(() => {
        selected.forEach(([row1, col1, row2, col2]) => {
          if (col1 <= 19 && 19 <= col2) {
            const startRow = Math.max(row1, 0);
            const endRow = Math.min(row2, hotInstance.countRows() - 1);

            const updates = [];
            for (let row = startRow; row <= endRow; row++) {
              const currentStatus = hotInstance.getDataAtCell(row, 19);
              if (currentStatus !== status) {
                updates.push({ row, status });
              }
            }

            updates.forEach(({ row, status }) => {
              hotInstance.setDataAtCell(row, 19, status);
            });
          }
        });
      });
    }
  };

  return (
    <div className='items-center justify-self-center h-[400px] w-full'>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="450">
          <Spinner size="xl" />
          <Text ml={4}>Cargando registros...</Text>
        </Box>
      )}
      {!isLoading && (
        <>
          <HStack mb={3}>
            <Select value={billNumberFilter} onChange={(e) => setBillNumberFilter(e.target.value)}>
              <option value="all">Todas</option>
              {uniqueBillNumbers.map((billNumber, index) => (
                <option key={index} value={billNumber}>{billNumber}</option>
              ))}
            </Select>
            <Button
              width="40%"
              onClick={handleUpdate}
              bgColor="#F1D803"
              variant="solid"
              colorScheme='teal'
              textColor="black" 
            >
              Actualizar
            </Button>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
              className="relative z-0"
              columns={[
                { data: 0, readOnly: true, title: 'OC' },
                { data: 1, readOnly: true, title: 'ITEMS' },
                { data: 2, readOnly: true, title: 'CODIGO' },
                { data: 3, readOnly: true, title: 'DESCRIPCION' },
                { data: 4, readOnly: true, title: 'CANT' },
                { data: 5, readOnly: true, title: 'UND' },
                { data: 6, readOnly: true, title: 'PROVEEDOR' },
                { data: 7, readOnly: true, title: 'FOB UNIT' },
                { data: 8, readOnly: true, title: 'FACTURA' },
                { data: 9, readOnly: true, title: 'PA' },
                { data: 10, readOnly: true, title: 'UC' },
                { data: 11, readOnly: true, title: 'TRM' },
                { data: 12, readOnly: true, title: 'FOB' },
                { data: 13, readOnly: true, title: 'COP UNIT' },
                { data: 14, readOnly: true, title: 'COP TOTAL' },
                { data: 15, readOnly: true, title: 'TIPO' },
                { data: 16, readOnly: true, title: 'PB' },
                { data: 17, readOnly: true, title: 'PN' },
                { data: 18, readOnly: true, title: 'Bultos' },
                { data: 19, readOnly: true, title: 'Conversion' },
                { data: 20, type: 'dropdown', title: 'STATUS', source: ['pending', 'approved', 'rejected'] }
              ]}
              colHeaders={true}
              rowHeaders={true}
              contextMenu={true}
              manualColumnResize={true}
              afterChange={(changes) => {
                console.log('Changes made:', changes);
              }}
              cells={(row, col, prop) => {
                const cellProperties = {};
                const editableStyle = { backgroundColor: '#EFFF82' };
                const readonlyStyle = { backgroundColor: '#f5c6c6' };
                const reset = { backgroundColor: '' };

                if (filteredData[row] && filteredData[row].length > 7) {
                  if (col === 7) {
                    if (filteredData[row][20] === "pending") {
                      cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                        Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                        td.style.backgroundColor = editableStyle.backgroundColor;
                        td.title = 'Pendiente a revision';
                      };
                    } else if (filteredData[row][20] === "approved") {
                      cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                        Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                        td.style.backgroundColor = reset.backgroundColor;
                        td.title = '';
                      };
                    } else if (filteredData[row][20] === "rejected") {
                      cellProperties.renderer = (hotInstance, td, row, col, prop, value, cellProperties) => {
                        Handsontable.renderers.TextRenderer(hotInstance, td, row, col, prop, value, cellProperties);
                        td.style.backgroundColor = readonlyStyle.backgroundColor;
                        td.title = '';
                      };
                    }
                  }
                }

                return cellProperties;
              } }
            />
          </VStack>
        </>
      )}
    </div>
  );
};

export default ReturnTable;



*/


















