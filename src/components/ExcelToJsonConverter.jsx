import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelToJsonConverter = () => {
    const [jsonData, setJsonData] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Obtener la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convertir a JSON
            const jsonResult = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Convertir array de arrays a array de objetos (si la primera fila son headers)
            if (jsonResult.length > 0) {
                const headers = jsonResult[0];
                const objectsArray = jsonResult.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] !== undefined ? row[index] : null;
                    });
                    return obj;
                });

                setJsonData(objectsArray);
            } else {
                setJsonData([]);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadJson = () => {
        if (!jsonData) return;

        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

        const exportFileDefaultName = `${fileName.split('.')[0]}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Convertidor de Excel a JSON</h2>

            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ marginBottom: '20px' }}
            />

            {jsonData && (
                <div>
                    <h3>Datos convertidos ({jsonData.length} registros)</h3>
                    <button
                        onClick={downloadJson}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        Descargar JSON
                    </button>

                    <div style={{ maxHeight: '400px', overflow: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                        <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExcelToJsonConverter;