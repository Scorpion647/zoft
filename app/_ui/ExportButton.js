// components/exportData.ts
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { getRecordsInfo, getRecords, getMaterial } from '@/app/_lib/database/service'; // Ajusta la ruta según tu estructura de archivos

async function fetchMaterialData(materialCode) {
    // Obtener los detalles del material basado en el material_code
    const material = await getMaterial(materialCode);
    return material;
}

async function fetchRecordAndMaterialData(recordId) {
    // Obtener el registro basado en el record_id
    const records = await getRecords(1, 100, '', [['id', { ascending: true }]]);
    const record = records?.find(r => r.id === recordId);
    
    if (!record) return null;

    // Obtener los detalles del material basado en el material_code
    const material = await fetchMaterialData(record.material_code);

    return { record, material };
}

export async function handleExport() {
    try {
        // Obtén los datos de la base de datos
        const recordsInfo = await getRecordsInfo(1, 100); // Ajusta los parámetros según sea necesario

        if (recordsInfo) {
            // Prepara los datos para la exportación
            const dataPromises = recordsInfo.map(async (recordInfo) => {
                const { record, material } = await fetchRecordAndMaterialData(recordInfo.record_id) || {};
                let conversion = 0;
                if (material?.measurement_unit === "U") {
                    conversion = 1;
                } else {
                    conversion = recordInfo.gross_weight / recordInfo.billed_quantity;
                }

                return {
                    'CODSUBP': material?.subheading || '',
                    'CODEMBALAJE': "PK",
                    'NMPESO_BRUTO': recordInfo.gross_weight || '',
                    'NMPESO_NETO': recordInfo.gross_weight || '',
                    'NMBULTOS': recordInfo.packages || '',
                    'CODBANDERA': 169,
                    'CODPAIS_ORIGEN': 169,
                    'PTTASA_CAMBIO': recordInfo.trm || 0,
                    'CODPAIS_COMPRA': 169,
                    'CODPAIS_DESTINO': 953,
                    'CODPAIS_PROCEDENCIA': 169,
                    'CODTRANSPORTE': 3,
                    'PTFLETES': 0,
                    'SEGUROS': 0,
                    'OTROS_GASTOS': 0,
                    'CODITEM': material?.code || 'N/A',
                    'NMCANTIDAD': recordInfo.billed_quantity || '',
                    'PTPRECIO': recordInfo.trm !== 0 ? ((recordInfo.billed_unit_price / 100) / recordInfo.trm) : (recordInfo.billed_unit_price / 100),
                    'NMCONVERSION': conversion || 'N/A' // Ajusta si hay un campo diferente en RecordInfoRow
                };
            });

            // Espera a que todas las promesas se resuelvan
            const allData = await Promise.all(dataPromises);

            // Agrupación y adición de datos
            const groupedData = [];
            const materialCodeMap = {};

            allData.forEach(data => {
                const materialCode = data['CODITEM'];
                if (materialCode) {
                    if (!materialCodeMap[materialCode]) {
                        materialCodeMap[materialCode] = [];
                    }
                    materialCodeMap[materialCode].push(data);
                }
            });

            Object.values(materialCodeMap).forEach((items) => {
                // Agregar el primer elemento tal como está
                groupedData.push(items[0]);

                // Si hay más elementos, agregar los siguientes sin los campos iniciales
                for (let i = 1; i < items.length; i++) {
                    groupedData.push({
                        'CODSUBP': '',
                        'CODEMBALAJE': '',
                        'NMPESO_BRUTO': '',
                        'NMPESO_NETO': '',
                        'NMBULTOS': '',
                        'CODBANDERA': '',
                        'CODPAIS_ORIGEN': '',
                        'PTTASA_CAMBIO': '',
                        'CODPAIS_COMPRA': '',
                        'CODPAIS_DESTINO': '',
                        'CODPAIS_PROCEDENCIA': '',
                        'CODTRANSPORTE': '',
                        'PTFLETES': '',
                        'SEGUROS': '',
                        'OTROS_GASTOS': '',
                        'CODITEM': items[i]['CODITEM'],
                        'NMCANTIDAD': items[i]['NMCANTIDAD'],
                        'PTPRECIO': items[i]['PTPRECIO'],
                        'NMCONVERSION': items[i]['NMCONVERSION']
                    });
                }
            });

            // Convertir los datos a CSV
            const csv = Papa.unparse(groupedData);

            // Crear y exportar el archivo CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'records.csv');
        } else {
            throw new Error('No se obtuvieron datos.');
        }
    } catch (err) {
        console.error('Error al generar el archivo CSV:', err);
    }
}
















/*



'CODSUBP': material.subheading,
                    'CODEMBALAJE': "PK",
                    'NMPESO_BRUTO': (recordInfo.gross_weight / 100),
                    'NMPESO_NETO': (recordInfo.gross_weight / 100),
                    'NMBULTOS': (recordInfo.packages / 1000),
                    'CODBANDERA': 169,
                    'CODPAIS_ORIGEN': 169,
                    'PTTASA_CAMBIO': recordInfo.trm,
                    'CODPAIS_COMPRA': 169,
                    'CODPAIS_DESTINO': 953,
                    'CODPAIS_PROCEDENCIA': 169,
                    'CODTRANSPORTE': 3,
                    'PTFLETES': 0,
                    'SEGUROS': 0,
                    'OTROS_GASTOS': 0,
                    'CODITEM':  material.code,
                    'NMCANTIDAD': recordInfo.billed_quantity,
                    'PTPRECIO': (recordInfo.billed_total_price / 100),
                    'NMCONVERSION': (recordInfo.conversion),





























                    // components/exportData.ts
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { getRecordsInfo, getRecords, getMaterials } from '@/app/_lib/database/service'; // Ajusta la ruta según tu estructura de archivos

async function fetchRecordAndMaterialData(recordId) {
    // Obtener el registro basado en el record_id
    const records = await getRecords(1, 100, '', [['id', { ascending: true }]]);
    const record = records?.find(r => r.id === recordId);
    
    if (!record) return null;

    // Obtener los detalles del material basado en el material_code
    const materials = await getMaterials(1, 100, '', [['code', { ascending: true }]]);
    const material = materials?.find(m => m.code === record.material_code);

    return { record, material };
}

// components/exportData.ts
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { getRecordsInfo, getRecords, getMaterials } from '@/app/_lib/database/service'; // Ajusta la ruta según tu estructura de archivos

async function fetchRecordAndMaterialData(recordId) {
    // Obtener el registro basado en el record_id
    const records = await getRecords(1, 100, '', [['id', { ascending: true }]]);
    const record = records?.find(r => r.id === recordId);
    
    if (!record) return null;

    // Obtener los detalles del material basado en el material_code
    const materials = await getMaterials(1, 100, '', [['code', { ascending: true }]]);
    const material = materials?.find(m => m.code === record.material_code);

    return { record, material };
}

export async function handleExport() {
    try {
        // Obtén los datos de la base de datos
        const recordsInfo = await getRecordsInfo(1, 100); // Ajusta los parámetros según sea necesario

        if (recordsInfo) {
            // Prepara los datos para la exportación
            const dataPromises = recordsInfo.map(async (recordInfo) => {
                const { record, material } = await fetchRecordAndMaterialData(recordInfo.record_id) || {};
                let conversion = 0;
                if(material.measurement_unit === "U"){
                    conversion = 1;
                }else{
                    conversion = (recordInfo.gross_weight / (recordInfo.billed_quantity))
                }

                return {
                    'CODSUBP': material?.subheading || 'N/A',
                    'CODEMBALAJE': "PK",
                    'NMPESO_BRUTO': (recordInfo.gross_weight),
                    'NMPESO_NETO': (recordInfo.gross_weight),
                    'NMBULTOS': (recordInfo.packages),
                    'CODBANDERA': 169,
                    'CODPAIS_ORIGEN': 169,
                    'PTTASA_CAMBIO': recordInfo.trm,
                    'CODPAIS_COMPRA': 169,
                    'CODPAIS_DESTINO': 953,
                    'CODPAIS_PROCEDENCIA': 169,
                    'CODTRANSPORTE': 3,
                    'PTFLETES': 0,
                    'SEGUROS': 0,
                    'OTROS_GASTOS': 0,
                    'CODITEM': material?.code || 'N/A',
                    'NMCANTIDAD': recordInfo.billed_quantity,
                    'PTPRECIO': (recordInfo.billed_total_price / 100),
                    'NMCONVERSION': conversion || 'N/A' // Ajusta si hay un campo diferente en RecordInfoRow
                };
            });

            // Espera a que todas las promesas se resuelvan
            const allData = await Promise.all(dataPromises);

            // Organiza los datos para que los items con el mismo Material Code estén juntos
            const groupedData = [];
            const materialCodeMap = {};

            for (const data of allData) {
                const materialCode = data['CODITEM'];
                if (materialCode && !materialCodeMap[materialCode]) {
                    // Guardar el primer item del grupo con toda la información
                    materialCodeMap[materialCode] = data;
                    groupedData.push(data);
                } else if (materialCode) {
                    // Agregar los items adicionales con el mismo Material Code
                    groupedData.push({
                        'CODSUBP': '', // Campos vacíos para los agrupados
                        'CODEMBALAJE': '',
                        'NMPESO_BRUTO': '',
                        'NMPESO_NETO': '',
                        'NMBULTOS': '',
                        'CODBANDERA': '',
                        'CODPAIS_ORIGEN': '',
                        'PTTASA_CAMBIO': '',
                        'CODPAIS_COMPRA': '',
                        'CODPAIS_DESTINO': '',
                        'CODPAIS_PROCEDENCIA': '',
                        'CODTRANSPORTE': '',
                        'PTFLETES': '',
                        'SEGUROS': '',
                        'OTROS_GASTOS': '',
                        'CODITEM': materialCode,
                        'NMCANTIDAD': data['NMCANTIDAD'],
                        'PTPRECIO': data['PTPRECIO'],
                        'NMCONVERSION': data['NMCONVERSION']
                    });
                }
            }

            // Convertir los datos a CSV
            const csv = Papa.unparse(groupedData);

            // Crear y exportar el archivo CSV
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'records.csv');
        } else {
            throw new Error('No se obtuvieron datos.');
        }
    } catch (err) {
        console.error('Error al generar el archivo CSV:', err);
    }
}
















































    // components/exportData.ts
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { getRecords, getRecordsInfo, getMaterials } from '@/app/_lib/database/service'; 


function formatCurrency(number) {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  }

async function fetchRecordAndMaterialData(recordId) {

    const records = await getRecords(1, 100, '', [['id', { ascending: true }]]);
    const record = records?.find(r => r.id === recordId);
    
    if (!record) return null;


    const materials = await getMaterials(1, 100, '', [['code', { ascending: true }]]);
    const material = materials?.find(m => m.code === record.material_code);

    return { record, material };
}

export async function handleExport() {
    try {

        const recordsInfo = await getRecordsInfo(1, 100); 

        if (recordsInfo) {

            const dataPromises = recordsInfo.map(async recordInfo => {
                const { record, material } = await fetchRecordAndMaterialData(recordInfo.record_id) || {};
                
                return {
                    'CODSUBP': material.subheading,
                    'CODEMBALAJE': "PK",
                    'NMPESO_BRUTO': (recordInfo.gross_weight / 100),
                    'NMPESO_NETO': (recordInfo.gross_weight / 100),
                    'NMBULTOS': (recordInfo.packages / 1000),
                    'CODBANDERA': 169,
                    'CODPAIS_ORIGEN': 169,
                    'PTTASA_CAMBIO': recordInfo.trm,
                    'CODPAIS_COMPRA': 169,
                    'CODPAIS_DESTINO': 953,
                    'CODPAIS_PROCEDENCIA': 169,
                    'CODTRANSPORTE': 3,
                    'PTFLETES': 0,
                    'SEGUROS': 0,
                    'OTROS_GASTOS': 0,
                    'CODITEM':  material.code,
                    'NMCANTIDAD': recordInfo.billed_quantity,
                    'PTPRECIO': (recordInfo.billed_total_price / 100),
                    'NMCONVERSION': (recordInfo.conversion),
                };
            });


            const data = await Promise.all(dataPromises);


            const csv = Papa.unparse(data);


            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            saveAs(blob, 'records.csv');
        } else {
            throw new Error('No se obtuvieron datos.');
        }
    } catch (err) {
        console.error('Error al generar el archivo CSV:', err);
    }
}
}*/