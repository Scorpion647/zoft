"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";
import {
  getRecords,
  getRecordsInfo,
  updateRecordInfo,
  getRecordInfo,
  getMaterial,
  getSupplier,
  getInvoice,
  getSuplierInvoice,
  getRecordInvoice,
  getInvo,
  getRecord,
} from "@/app/_lib/database/service";
import {
  FormControl,
  FormLabel,
  Spinner,
  Switch,
  Tooltip,
  Select,
  ChakraProvider,
  Flex,
  Box,
  VStack,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Checkbox,
} from "@chakra-ui/react";
import { handleExport } from "@/app/_ui/ExportButton";
import { updateMaterial, insertMaterial } from "@/app/_lib/database/materials";
import {
  selectSingleInvoice,
  updateInvoice,
} from "@/app/_lib/database/invoice_data";
import { FaSave } from "react-icons/fa";

function formatMoney(amount) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function InfoModal({ isOpen, onClose, cellInfo, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState("national");
  const [tipo, setTipo] = useState(true);
  const [creatingMaterial, setCreatingMaterial] = useState(false);
  const [code, setCode] = useState(cellInfo?.code || "");
  const [subp, setSubp] = useState(cellInfo?.subp || "");
  const [unit, setUnit] = useState(cellInfo?.unit || "");

  useEffect(() => {
    const verificar = async () => {
      if (cellInfo) {
        try {
          const materialNational = await getMaterial(`${cellInfo.code}-N`);
          if (materialNational?.material_code) {
            if (!materialNational.type) {
              await updateMaterial({
                data: { type: "national" },
                target: materialNational.material_code,
              });
            }
            setTipo(true);
          } else {
            setTipo(false);
          }
        } catch (error) {
          console.error("Error verificando el material:", error);
          setTipo(false);
        }
      }
    };

    verificar();
  }, [cellInfo]);

  const handleSave = async () => {
    if (selectedStatus === "foreign" && !tipo) {
      const insert = await insertMaterial({
        material_code: `${cellInfo.code}-N`,
        subheading: cellInfo.subp,
        measurement_unit: unit,
        type: "national",
      });
    }
    console.log(cellInfo.code);
    console.log(selectedStatus);
    console.log(unit);
    const update = {
      data: {
        type: selectedStatus,
        ...(cellInfo.unit === "null" ? { measurement_unit: unit } : {}),
      },
      target: cellInfo.code,
    };
    console.log(update);
    const hola = await updateMaterial(update);
    console.log("hola", hola);

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="none">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Actualizar Material</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {cellInfo && (
            <>
              <p>
                <strong>Codigo:</strong> {cellInfo.code}
              </p>
              <p>
                <strong>Subpartida:</strong> {cellInfo.subp}
              </p>
              {cellInfo.unit !== "null" && (
                <p>
                  <strong>Unidad:</strong> {cellInfo.unit}
                </p>
              )}
              <FormControl mb={4}>
                {cellInfo.unit === "null" && (
                  <>
                    <HStack spacing={0}>
                      <FormLabel>
                        <strong>Unidad:</strong>
                      </FormLabel>
                      <Input
                        width="50%"
                        height="30px"
                        border="1px"
                        backgroundColor="white"
                        onChange={(e) => setUnit(e.target.value)}></Input>
                    </HStack>
                  </>
                )}
                <HStack spacing={0}>
                  <FormLabel>
                    <strong>Tipo:</strong>
                  </FormLabel>
                  <Select
                    width="50%"
                    border="1px"
                    height="30px"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    backgroundColor="white">
                    <option value="national">NACIONAL</option>
                    <option value="foreign">EXTRANJERO</option>
                    <option value="nationalized">NACIONALIZADO</option>
                    <option value="other">OTRO</option>
                  </Select>
                </HStack>
              </FormControl>
            </>
          )}

          <HStack align="center" justify="center" spacing={4} mt={4}>
            <Button colorScheme="teal" bgColor="red" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              colorScheme="teal"
              bgColor="#F1D803"
              textColor="black"
              onClick={handleSave}>
              Guardar
            </Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const Material = async (code, number) => {
  const material = await getMaterial(code);
  return (
    number === 0 ? material.subheading
    : number === 1 ? material.measurement_unit
    : material.type
  );
};

const Typematerial = (type) => {
  switch (type) {
    case "national":
      return "NACIONAL";
    case "foreign":
      return "EXTRANJERO";
    case "nationalized":
      return "NACIONALIZADO";
    case "other":
      return "OTRO";
    default:
      return "INVALIDO";
  }
};

const ReturnTable = ({ suppliers, volver }) => {
  const hotTableRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [Order, setOrder] = useState("");
  const [status, setStatus] = useState("");
  const [Data, setData] = useState([]);
  const [origin, setorigin] = useState("");
  const [numbeer, setnumbeer] = useState(0);
  useEffect(() => {
    fetchData();
  }, []);

  const [mergeCellsConfig, setMergeCellsConfig] = useState([]);
  useEffect(() => {
    const initialMergeCells = getMergeCells();
    setMergeCellsConfig(initialMergeCells);
  }, [Data]);

  const getMergeCells = () => {
    console.log(hotTableRef.current);
    if (
      hotTableRef.current !== null &&
      hotTableRef.current.hotInstance !== undefined
    ) {
      const hotInstance = hotTableRef.current.hotInstance;
      const data = hotInstance.getData();
      const mergeCells = [];
      let startRow = null;
      let lastValue8 = null;
      let lastValue = null;
      let lastValue6 = null;

      for (let row = 0; row < data.length; row++) {
        const value8 = data[row][8];
        const value = data[row][0];
        const value6 = data[row][6];

        if (value8 === lastValue8) {
          if (startRow === null) {
            startRow = row - 1;
          }
        } else {
          if (startRow !== null) {
            mergeCells.push({
              row: startRow,
              col: 0,
              rowspan: row - startRow,
              colspan: 1,
            });
            mergeCells.push({
              row: startRow,
              col: 6,
              rowspan: row - startRow,
              colspan: 1,
            });

            for (let i = startRow + 1; i < row; i++) {
              data[i][0] = data[startRow][0];
              data[i][6] = data[startRow][6];
            }

            startRow = null;
          }
        }

        lastValue8 = value8;
        lastValue = value;
        lastValue6 = value6;
      }

      if (startRow !== null) {
        mergeCells.push({
          row: startRow,
          col: 0,
          rowspan: data.length - startRow,
          colspan: 1,
        });
        mergeCells.push({
          row: startRow,
          col: 6,
          rowspan: data.length - startRow,
          colspan: 1,
        });

        for (let i = startRow + 1; i < data.length; i++) {
          data[i][0] = data[startRow][0];
          data[i][6] = data[startRow][6];
        }
      }

      return mergeCells;
    }
  };

  const inputvalue = async () => {
    const invoice = selectSingleInvoice(suppliers);
    if ((await invoice).state === "approved") {
      return "approved";
    } else if ((await invoice).state === "pending") {
      return "pending";
    } else if ((await invoice).state === "rejected") {
      return "rejected";
    }
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const [cellInfo, setCellInfo] = useState(null);

  const handleCellClick = (event, coords, td) => {
    const { row, col } = coords;
    const cellContent = td.innerText;

    if (cellContent === "INVALIDO" && col === 15) {
      let subp = 0;
      let code = "";
      let unit = "";

      if (Data[row] !== undefined) {
        if (Data[row][9] !== undefined) {
          subp = String(Data[row][9]);
          code = String(Data[row][2]);
        }
        if (Data[row][10] !== undefined) {
          unit = String(Data[row][10]);
        }
      }
      console.log(code);
      console.log(subp);
      console.log(unit);
      setCellInfo({ row, col, code, subp, unit, content: cellContent });
      setModalOpen(true);
    }
  };

  const handleSave = (updatedInfo) => {};

  const sendEmail = async (invoice, razon) => {
    const data = {
      invoice_id: invoice,
      type: "Actualizacion",
      subject: razon,
      reason: razon,
    };

    const res = await fetch("/api/mail/supplier-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (result.error) {
      console.error(result.error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    let data = [];
    if (status !== "") {
      await updateInvoice({ invoice_id: suppliers, state: status });
    }
    const active = await selectSingleInvoice(suppliers);
    if (active.state === "approved") {
      setisapproved(true);
    } else {
      setisapproved(false);
    }
    try {
      const invoice = await getSuplierInvoice(1, 200, suppliers);
      const invo = await getInvo(suppliers);
      await Promise.all(
        invoice.map(async (supdata) => {
          const record = await getRecordInvoice(supdata.base_bill_id);
          setOrder(record.purchase_order);
          const sup = await getSupplier(record.supplier_id);
          const material = await getMaterial(record.material_code);
          let type = material.type;
          let subheading = material.subheading;
          let unidad = material.measurement_unit;
          let material_code = record.material_code;
          const conversion =
            unidad === "KG" || unidad === "KGM" ?
              parseFloat(
                (supdata.gross_weight / supdata.billed_quantity).toFixed(8),
              )
            : ["U", "L"].includes(unidad) ? 1
            : 0;
          if (type === "foreign") {
            const materialNational = await getMaterial(
              `${material.material_code}-N`,
            );
            if (materialNational?.material_code) {
              material_code = materialNational.material_code;
              subheading = materialNational.subheading || material;
              unidad = materialNational.measurement_unit || unit;
              type = materialNational.type || tipo;

              if (!materialNational.type)
                await updateMaterial({
                  data: { type: "national" },
                  target: materialNational.material_code,
                });
            } else if (
              subheading !== undefined &&
              subheading !== null &&
              subheading !== ""
            ) {
              const insert = await insertMaterial({
                material_code: `${material.material_code}-N`,
                subheading: subheading,
                measurement_unit: unidad,
                type: "national",
              });
              material_code = `${material.material_code}-N`;
              type = "national";
            }
          }

          let estado = "";
          if (invo.state === "pending") {
            estado = "pending";
          } else if (invo.state === "rejected") {
            estado = "rejected";
          } else if (invo.state === "approved") {
            estado = "approved";
          }
          let oc = record.purchase_order;
          if (oc.length > 10) {
            oc = String(record.purchase_order).slice(0, 10);
          }

          data.push([
            oc, // OC
            record.item, // ITEMS
            material_code, // CODIGO
            record.description, // DESCRIPCION
            supdata.billed_quantity, // CANT
            record.measurement_unit, // UND
            sup.name, // PROVEEDOR
            parseFloat(
              parseFloat(supdata.billed_unit_price / 100 / supdata.trm).toFixed(
                8,
              ),
            ), // FOB_UNIT
            supdata.bill_number, // FACTURA
            subheading, // PA
            unidad, // UC
            supdata.trm, // TRM
            formatMoney(
              parseFloat(supdata.billed_unit_price / 100 / supdata.trm) *
                supdata.billed_quantity,
            ), // FOB
            formatMoney(supdata.billed_unit_price / 100), // COP_UNIT
            formatMoney(
              (supdata.billed_unit_price / 100) * supdata.billed_quantity,
            ), // COP_TOTAL
            Typematerial(type), // TIPO
            supdata.gross_weight, // PB
            supdata.gross_weight, // PN
            supdata.packages, // Bultos
            conversion, // Conversion
          ]);
        }),
      );
      // Después de llenar el array, ordenamos los objetos por record.item
      data.sort((a, b) => {
        // Asegúrate de que 'record.item' esté en la misma posición en 'data'
        return a[1] - b[1]; // Asumiendo que record.item es el segundo elemento (índice 1)
      });
      setData(data);
      setnumbeer(numbeer + 1);
    } catch {
    } finally {
      setIsLoading(false);

      if (active.state !== origin) {
        if (numbeer > 0) {
          sendEmail(
            suppliers,
            "El estado de su asociacion a sido cambiado por : " +
              (active.state === "approved" ? "Aprobado"
              : active.state === "pending" ? "Pendiente"
              : "Rechazado"),
          );
        }
      }
    }
  };

  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleExportar = async () => {
    if (hotTableRef.current) {
      const hotTableInstance = hotTableRef.current.hotInstance;
      const visibleData = hotTableInstance.getData();

      await onButtonClick(visibleData);
    }
  };

  const onButtonClick = async (visibledata) => {
    setIsLoading1(true);
    setError(null);
    onOpen();

    try {
      await handleExport(visibledata);
    } catch (err) {
      setError("Error al generar el archivo CSV.");
    } finally {
      setIsLoading1(false);
      onClose();
    }
  };

  useEffect(() => {
    calculateSum();
    calculateSum1();
    calculateSum2();
    calculateSum3();
  }, [Data]);

  useEffect(() => {
    const hola = async () => {
      const prue = await inputvalue();
      setStatus(prue);
      setorigin(prue);
    };
    hola();
  }, []);
  const calculateSum = () => {
    if (Data) {
      const columnIndex = 14;
      const sum = Data.reduce(
        (acc, row) => acc + (parseFloat(handleChange(row[columnIndex])) || 0),
        0,
      );
      return formatMoney(sum);
    }
    return 0;
  };
  const calculateSum1 = () => {
    if (Data) {
      const columnIndex = 16;
      const sum = Data.reduce(
        (acc, row) => acc + (parseFloat(row[columnIndex]) || 0),
        0,
      );
      return parseFloat(sum.toFixed(5));
    }
    return 0;
  };
  const calculateSum2 = () => {
    if (Data) {
      const columnIndex = 18;
      const sum = Data.reduce(
        (acc, row) => acc + (parseFloat(row[columnIndex]) || 0),
        0,
      );
      return parseFloat(sum.toFixed(5));
    }
    return 0;
  };
  const calculateSum3 = () => {
    if (Data) {
      const columnIndex = 12;
      const sum = Data.reduce(
        (acc, row) => acc + (parseFloat(handleChange(row[columnIndex])) || 0),
        0,
      );
      return formatMoney(sum);
    }
    return 0;
  };

  function handleChange(value) {
    if (!value) {
      return "";
    }
    let formattedValue = value.replace(/[\$\s]/g, "");

    formattedValue = formattedValue.replace(/\,/g, "").replace(/,/g, ".");

    const decimalMatch = formattedValue.match(/^(\d+)\.(\d{2})$/);

    if (decimalMatch) {
      if (decimalMatch[2] === "00") {
        return decimalMatch[1];
      }
      return formattedValue;
    }

    const splitValue = formattedValue.split(",");
    let intValue = splitValue[0];
    let decimalValue = splitValue[1] || "";

    if (decimalValue.length > 2) {
      decimalValue = decimalValue.slice(0, 2);
    } else if (decimalValue.length < 2) {
      decimalValue = decimalValue.padEnd(2, "0");
    }

    formattedValue = `${intValue}.${decimalValue}`;

    if (decimalValue === "00") {
      return intValue;
    }

    return formattedValue;
  }

  const change = async (e) => {
    setStatus(e);
  };
  const [isapproved, setisapproved] = useState(false);

  return (
    <div className="items-center justify-self-center h-[400px] w-full">
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="450">
          <Spinner size="xl" />
          <Text ml={4}>Cargando registros...</Text>
        </Box>
      )}
      {!isLoading && (
        <>
          <Flex
            width="100%"
            alignItems="center"
            justifyContent="space-between"
            p={2}
            bg="gray.100"
            className="rounded-2xl"
            position="relative"
            mb={0}>
            <Box position="absolute" right={2}>
              <Button
                isDisabled={!isapproved}
                onClick={() => handleExportar()}
                bgColor="#F1D803"
                textColor="black">
                Export
              </Button>
            </Box>

            <Box flex={1} textAlign="start">
              <Button
                onClick={() => volver()}
                bgColor="#F1D803"
                textColor="black">
                Regresar
              </Button>
            </Box>
            <Box flex={1} textAlign="start">
              <HStack>
                <Select
                  width="50%"
                  bg="white"
                  onChange={(e) => change(e.target.value)}
                  value={status}>
                  <option value="approved">APROBADO</option>
                  <option value="pending">PENDIENTE</option>
                  <option value="rejected">RECHAZADO</option>
                </Select>
                <Button
                  onClick={() => fetchData()}
                  bgColor="#F1D803"
                  textColor="black">
                  <FaSave />
                </Button>
              </HStack>
            </Box>
            <Box flex={1} textAlign="center"></Box>
          </Flex>
          <VStack spacing={0}>
            <HStack width="100%">
              <Text fontSize="90%" className=" font-bold">
                Orden:
              </Text>
              <Text className=" font-semibold" fontSize="90%">
                {Order}
              </Text>
            </HStack>

            <HStack align="center" justify="center" width="100%">
              <HStack width="15%">
                <Text fontSize="90%" className=" font-bold">
                  Peso:
                </Text>
                <Text fontSize="90%">{calculateSum1()}</Text>
              </HStack>
              <HStack width="15%">
                <Text fontSize="90%" className=" font-bold">
                  Bultos:
                </Text>
                <Text fontSize="90%">{calculateSum2()}</Text>
              </HStack>
              <HStack width="10%"></HStack>
              <HStack align="end" justify="end" width="30%">
                <Text fontSize="90%" className=" font-bold">
                  FOB:
                </Text>
                <Text fontSize="90%">{calculateSum3()}</Text>
              </HStack>
              <HStack align="end" justify="end" width="30%">
                <Text fontSize="90%" className=" font-bold">
                  Subtotal:
                </Text>
                <Text fontSize="90%">{calculateSum()}</Text>
              </HStack>
            </HStack>
          </VStack>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
              <ModalHeader>Exportando CSV</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {isLoading1 ?
                  "Generando archivo..."
                : "Archivo generado exitosamente."}
                {error && <p className="text-red-500">{error}</p>}
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <InfoModal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            cellInfo={cellInfo}
            onSave={handleSave}
          />
          <VStack
            alignItems="center"
            align="center"
            justify="center"
            className="bg-gray-300">
            <HotTable
              data={Data}
              columns={[
                { data: 0, width: 100, readOnly: true, title: "OC" },
                { data: 1, readOnly: true, title: "ITEMS" },
                { data: 2, readOnly: true, title: "CODIGO" },
                { data: 3, readOnly: true, title: "DESCRIPCION" },
                { data: 4, readOnly: true, title: "CANT" },
                { data: 5, readOnly: true, title: "UND" },
                { data: 6, width: 150, readOnly: true, title: "PROVEEDOR" },
                { data: 7, readOnly: true, title: "FOB UNIT" },
                { data: 8, readOnly: true, title: "FACTURA" },
                { data: 9, readOnly: true, title: "PA" },
                { data: 10, readOnly: true, title: "UC" },
                { data: 11, readOnly: true, title: "TRM" },
                { data: 12, readOnly: true, title: "FOB" },
                { data: 13, readOnly: true, title: "COP UNIT" },
                { data: 14, readOnly: true, title: "COP TOTAL" },
                { data: 15, readOnly: true, title: "TIPO" },
                { data: 16, readOnly: true, title: "PB" },
                { data: 17, readOnly: true, title: "PN" },
                { data: 18, readOnly: true, title: "Bultos" },
                { data: 19, readOnly: true, title: "Conversion" },
              ]}
              width="100%"
              scrollHorizontally={false}
              scrollVertically={false}
              height="350"
              className="relative z-10"
              licenseKey="non-commercial-and-evaluation"
              ref={hotTableRef}
              rowHeaders={true}
              stretchH="all"
              mergeCells={mergeCellsConfig}
              //beforeChange={handleAfterChange}
              fixedColumnsStart={3}
              afterOnCellMouseDown={handleCellClick}
              beforeContextMenuShow={(instance, menu, coords) => {
                const { row, col } = coords;
                const cellData = instance.getDataAtCell(row, 15);
                console.log(cellData);
                if (cellData === "INVALIDO") {
                  console.log(cellData);
                } else {
                  console.log("No entramos pero pasamos", cellData);
                }
              }}
              cells={(row, col, prop) => {
                const cellProperties = {};
                const editableStyle = { backgroundColor: "#EFFF82" };
                const readonlyStyle = { backgroundColor: "#f5c6c6" };
                const reset = { backgroundColor: "#89EFA3" };
                const vacio = { backgroundColor: "" };

                cellProperties.renderer = (
                  hotInstance,
                  td,
                  row,
                  col,
                  prop,
                  value,
                  cellProperties,
                ) => {
                  Handsontable.renderers.TextRenderer(
                    hotInstance,
                    td,
                    row,
                    col,
                    prop,
                    value,
                    cellProperties,
                  );
                  td.style.textAlign = "center";
                  td.style.verticalAlign = "middle";
                  td.style.justifyContent = "center";
                  td.style.alignItems = "center";
                  td.style.height = "100%";

                  const statusValue = hotInstance.getDataAtCell(row, 8);

                  const rows = hotInstance.getData();
                  const groupRows = [];

                  for (let i = 0; i < rows.length; i++) {
                    if (hotInstance.getDataAtCell(i, 8) === statusValue) {
                      groupRows.push(i);
                    }
                  }

                  const isFirstRow = row === groupRows[0];
                  const isLastRow = row === groupRows[groupRows.length - 1];

                  td.style.borderLeft = "1px solid rgba(0, 0, 0, 0.5)";
                  td.style.borderRight = "1px solid rgba(0, 0, 0, 0.5)";

                  if (groupRows.length === 1) {
                    td.style.borderTop = "1px solid rgba(0, 0, 0, 0.5)";
                    td.style.borderBottom = "1px solid rgba(0, 0, 0, 0.5)";
                  } else {
                    if (isFirstRow) {
                      td.style.borderTop = "1px solid rgba(0, 0, 0, 0.5)";
                      td.style.borderBottom = "none";
                    } else if (isLastRow) {
                      td.style.borderTop = "none";
                      td.style.borderBottom = "1px solid rgba(0, 0, 0, 0.5)";
                    } else {
                      td.style.borderTop = "none";
                      td.style.borderBottom = "none";
                    }
                  }

                  if (col === 15) {
                    if (
                      value !== "NACIONAL" &&
                      value !== "NACIONALIZADO" &&
                      value !== "INVALIDO"
                    ) {
                      td.style.backgroundColor = readonlyStyle.backgroundColor;
                      td.title = "Necesita revision";
                    } else if (value === "INVALIDO") {
                      td.style.backgroundColor = readonlyStyle.backgroundColor;
                      td.title = "Tipo no definido";
                    }
                  }
                };

                return cellProperties;
              }}
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
