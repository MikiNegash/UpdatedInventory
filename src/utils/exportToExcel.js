// utils/exportToExcel.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const exportToExcel = ({ data, filename = 'report.xlsx', sheetName = 'Sheet1' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(fileData, filename);
};
