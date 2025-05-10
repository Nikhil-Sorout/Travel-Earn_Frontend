import { Download, Search } from '@mui/icons-material';
import { Box, Button, Menu, MenuItem, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React, { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import Sidebar from '../Components/Sidebar';
import './Styles/DriverDetails.css';

const DriverDetails = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const rows = [
    // Your rows data
    { 
      id: 1, 
      name: 'Andrew Bojangles', 
      phone: '+79000010101', 
      dl: 'WB-9SIDID402', 
      panAadhar: 'NNZPS2221A', 
      bank: 'AXIS Bank LTD, Diamond harbour', 
      ifsc: 'UTIB0000365', 
      holderName: 'Andrew Bojangles', 
      experience: '8 Yrs', 
      insurance: 'BAJAJ', 
      validInsurance: '09-10-2026', 
      status: 'Approved' 
    },
    { 
      id: 2, 
      name: 'Andrew Bojangles', 
      phone: '+79000010101', 
      dl: 'WB-9SIDID402', 
      panAadhar: 'NNZPS2221A', 
      bank: 'AXIS Bank LTD, Diamond harbour', 
      ifsc: 'UTIB0000365', 
      holderName: 'Andrew Bojangles', 
      experience: '8 Yrs', 
      insurance: 'BAJAJ', 
      validInsurance: '09-10-2026', 
      status: 'Pending' 
    },
    { 
      id: 3, 
      name: 'Andrew Bojangles', 
      phone: '+79000010101', 
      dl: 'WB-9SIDID402', 
      panAadhar: 'NNZPS2221A', 
      bank: 'AXIS Bank LTD, Diamond harbour', 
      ifsc: 'UTIB0000365', 
      holderName: 'Andrew Bojangles', 
      experience: '8 Yrs', 
      insurance: 'BAJAJ', 
      validInsurance: '09-10-2026', 
      status: 'Reject' 
    },
    // Add other rows similarly
  ];

  const handleDownloadClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const downloadExcel = () => {
    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Driver Details');
    writeFile(workbook, 'DriverDetails.xlsx');
    handleClose();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Driver Details", 14, 20);
    doc.autoTable({
      head: [['Sl No.', 'Name', 'Phone Number', 'Driving License', 'Pan/Aadhar Card', 'Branch Name & Location', 'Bank IFSC', 'Account Holder Name', 'Experience', 'Insurance', 'Valid Insurance', 'Status']],
      body: rows.map(row => [
        row.id, row.name, row.phone, row.dl, row.panAadhar, row.bank, row.ifsc, 
        row.holderName, row.experience, row.insurance, row.validInsurance, row.status
      ]),
    });
    doc.save('DriverDetails.pdf');
    handleClose();
  };

  return (
    <Box display="flex">
      <Box className="sidebar-container">
        <Sidebar />
      </Box>

      <Box className="content-container">
        <Box className="search-download-container">
          <TextField 
            variant="outlined" 
            size="small" 
            placeholder="Search" 
            className="search-field"
            InputProps={{
              startAdornment: <Search />,
            }}
          />
          <Box className="button-group">
            <Button variant="contained" startIcon={<Search />} sx={{ marginRight: 1 }}>
              Search
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<Download />} 
              onClick={handleDownloadClick}>
              Download
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={downloadExcel}>Download Excel</MenuItem>
              <MenuItem onClick={downloadPDF}>Download PDF</MenuItem>
            </Menu>
          </Box>
        </Box>
        
        <TableContainer component={Paper} className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sl No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Driving License</TableCell>
                <TableCell>Pan/Aadhar Card</TableCell>
                <TableCell>Branch Name & Location</TableCell>
                <TableCell>Bank IFSC</TableCell>
                <TableCell>Account Holder Name</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Insurance</TableCell>
                <TableCell>Valid Insurance</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="table-row">
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.dl}</TableCell>
                  <TableCell>{row.panAadhar}</TableCell>
                  <TableCell>{row.bank}</TableCell>
                  <TableCell>{row.ifsc}</TableCell>
                  <TableCell>{row.holderName}</TableCell>
                  <TableCell>{row.experience}</TableCell>
                  <TableCell>{row.insurance}</TableCell>
                  <TableCell>{row.validInsurance}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small" 
                      className="status-button"
                      color={row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}>
                      {row.status}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box className="pagination-container">
          <Pagination count={5} color="primary" />
        </Box>
      </Box>
    </Box>
  );
};

export default DriverDetails;
