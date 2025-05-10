import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export visible HTML table to Excel
export const exportTableToExcel = (tableId, fileName = 'export') => {
  const table = document.getElementById(tableId);
  const workbook = XLSX.utils.table_to_book(table);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// Export visible HTML table to PDF
export const exportTableToPDF = (tableId, fileName = 'export') => {
  const doc = new jsPDF();
  const table = document.getElementById(tableId);
  doc.autoTable({ html: `#${tableId}` });
  doc.save(`${fileName}.pdf`);
};

// Export visible HTML table to CSV
export const exportTableToCSV = (tableId, fileName = 'export') => {
  const table = document.getElementById(tableId);
  const rows = table.querySelectorAll('tr');
  const csv = Array.from(rows).map(row =>
    Array.from(row.cells)
      .map(cell => `"${cell.innerText}"`)
      .join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.csv`;
  link.click();
};
