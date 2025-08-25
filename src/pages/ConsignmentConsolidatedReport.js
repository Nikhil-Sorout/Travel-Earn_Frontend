import React, { useState, useEffect, useRef } from 'react';
import { getConsignmentConsolidatedReport } from '../Services/Api';
import './Styles/ConsignmentConsolidatedReport.css';

const ConsignmentConsolidatedReport = () => {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(30);
  const [copiedCell, setCopiedCell] = useState(null);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchConsignmentData();
  }, [currentPage]);

  // Function to copy text to clipboard
  const copyToClipboard = async (text, cellId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCell(cellId);
      // Clear the copied state after 2 seconds
      setTimeout(() => setCopiedCell(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedCell(cellId);
      setTimeout(() => setCopiedCell(null), 2000);
    }
  };

  useEffect(() => {
    // Add horizontal scroll functionality with mouse wheel
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;

    const handleWheel = (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        const scrollAmount = e.deltaY || e.deltaX;
        tableContainer.scrollLeft += scrollAmount;
      }
    };

    tableContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      tableContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const getPageNumbers = () => {
    const maxButtons = 3;
    let start = Math.max(currentPage - 1, 1);
    let end = Math.min(start + maxButtons - 1, totalPages);

    // Adjust start if we're near the end
    if (end - start < maxButtons - 1) {
      start = Math.max(end - maxButtons + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const fetchConsignmentData = async () => {
    try {
      setLoading(true);
      const response = await getConsignmentConsolidatedReport(currentPage, recordsPerPage);
      console.log('Consignment consolidated data received:', response);
      console.log('Response structure:', {
        hasData: !!response.data,
        dataLength: response.data?.length,
        isArray: Array.isArray(response),
        responseKeys: Object.keys(response || {})
      });
      
      // Log first record if available
      if (response.data && response.data.length > 0) {
        console.log('First record sample:', response.data[0]);
        console.log('First record keys:', Object.keys(response.data[0]));
      }
      
      // Handle the pagination structure
      if (response.data && Array.isArray(response.data)) {
        setConsignments(response.data);
      } else if (Array.isArray(response)) {
        setConsignments(response);
      } else {
        setConsignments([]);
      }
      
      // Set pagination info if available
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalRecords(response.pagination.totalRecords || response.pagination.total || 0);
        setRecordsPerPage(response.pagination.recordsPerPage || 30);
      } else {
        // If no pagination info, calculate based on data length
        setTotalPages(Math.ceil((Array.isArray(response.data || response) ? (response.data || response).length : 0) / recordsPerPage));
        setTotalRecords(Array.isArray(response.data || response) ? (response.data || response).length : 0);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch consignment data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsignments = consignments.filter(consignment => {
    const matchesSearch = 
      consignment['Consignment ID']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment['Sender Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment['Traveler Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment['Recipient Name']?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || consignment['Consignment Status'] === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Consignment ID',
      'Consignment Status',
      'Sender ID',
      'Sender Name',
      'Sender Mobile No',
      'Sender Address',
      'Total Amount Sender',
      'Payment Status',
      'Traveler Id',
      'Traveler Acceptance Date',
      'Traveler Name',
      'Traveler Mobile No',
      'Traveler Address',
      'Amount to be paid to Traveler',
      'Traveler Payment Status',
      'Travel Mode',
      'Travel Start Date',
      'Travel End Date',
      'Recipient Name',
      'Recipient Address',
      'Recipient Phone no',
      'Received Date',
      'T&E Amount',
      'Tax Component'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredConsignments.map(consignment => [
        consignment['Consignment ID'] || '',
        consignment['Consignment Status'] || '',
        consignment['Sender ID'] || '',
        `"${consignment['Sender Name'] || ''}"`,
        consignment['Sender Mobile No'] || '',
        `"${consignment['Sender Address'] || ''}"`,
        consignment['Total Amount Sender'] || '',
        consignment['Payment Status'] || '',
        consignment['Traveler Id'] || '',
        formatDate(consignment['Traveler Acceptance Date']) || '',
        `"${consignment['Traveler Name'] || ''}"`,
        consignment['Traveler Mobile No'] || '',
        `"${consignment['Traveler Address'] || ''}"`,
        consignment['Amount to be paid to Traveler'] || '',
        consignment['Traveler Payment Status'] || '',
        consignment['Travel Mode'] || '',
        formatDate(consignment['Travel Start Date']) || '',
        formatDate(consignment['Travel End Date']) || '',
        `"${consignment['Recipient Name'] || ''}"`,
        `"${consignment['Recipient Address'] || ''}"`,
        consignment['Recipient Phone no'] || '',
        formatDate(consignment['Received Date']) || '',
        consignment['T&E Amount'] || '',
        consignment['Tax Component'] || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'consignment_consolidated_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date to local timezone
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="consignment-report-container">
        <div className="loading">Loading consignment data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="consignment-report-container">
        <div className="error">{error}</div>
        <button onClick={fetchConsignmentData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="consignment-report-container">
      <div className="report-header">
        <h1>Consignment Consolidated Report</h1>
        <div className="header-controls">
          <div className="search-filter-container">
                         <input
               type="text"
               placeholder="Search by Consignment ID, Sender Name, Traveler Name, Recipient Name..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="search-input"
             />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="export-btn">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Records</h3>
          <p>{totalRecords}</p>
        </div>
        <div className="stat-card">
          <h3>Current Page</h3>
          <p>{currentPage} of {totalPages}</p>
        </div>
        <div className="stat-card">
          <h3>Records Per Page</h3>
          <p>{recordsPerPage}</p>
        </div>
      </div>

      <div className="table-container" ref={tableContainerRef}>
        {/* <div className="scroll-hint">
          <span>💡 Tip: Hold Shift + Mouse Wheel for horizontal scrolling</span>
        </div> */}
        <div className="table-wrapper">
          <table className="consignment-table">
            <thead>
              <tr>
                <th>Consignment ID</th>
                <th>Consignment Status</th>
                <th>Sender ID</th>
                <th>Sender Name</th>
                <th>Sender Mobile No</th>
                <th>Sender Address</th>
                <th>Total Amount Sender</th>
                <th>Payment Status</th>
                <th>Traveler Id</th>
                <th>Traveler Acceptance Date</th>
                <th>Traveler Name</th>
                <th>Traveler Mobile No</th>
                <th>Traveler Address</th>
                <th>Amount to be paid to Traveler</th>
                <th>Traveler Payment Status</th>
                <th>Travel Mode</th>
                <th>Travel Start Date</th>
                <th>Travel End Date</th>
                <th>Recipient Name</th>
                <th>Recipient Address</th>
                <th>Recipient Phone no</th>
                <th>Received Date</th>
                <th>T&E Amount</th>
                <th>Tax Component</th>
              </tr>
            </thead>
            <tbody>
              {filteredConsignments.length === 0 ? (
                <tr>
                  <td colSpan="24" className="no-data">No consignment data available</td>
                </tr>
              ) : (
                filteredConsignments.map((consignment, index) => (
                  <tr key={consignment['Consignment ID'] || index}>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-consignment-id` ? 'copied' : ''}`}
                      title={consignment['Consignment ID'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Consignment ID'] || 'N/A', `${index}-consignment-id`)}
                    >
                      {consignment['Consignment ID'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-status` ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(consignment['Consignment Status'] || 'N/A', `${index}-status`)}
                    >
                      <span 
                        className={`status ${consignment['Consignment Status']?.toLowerCase() || 'unknown'}`}
                        title={consignment['Consignment Status'] || 'N/A'}
                      >
                        {consignment['Consignment Status'] || 'N/A'}
                      </span>
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-sender-id` ? 'copied' : ''}`}
                      title={consignment['Sender ID'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Sender ID'] || 'N/A', `${index}-sender-id`)}
                    >
                      {consignment['Sender ID'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-sender-name` ? 'copied' : ''}`}
                      title={consignment['Sender Name'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Sender Name'] || 'N/A', `${index}-sender-name`)}
                    >
                      {consignment['Sender Name'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-sender-mobile` ? 'copied' : ''}`}
                      title={consignment['Sender Mobile No'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Sender Mobile No'] || 'N/A', `${index}-sender-mobile`)}
                    >
                      {consignment['Sender Mobile No'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-sender-address` ? 'copied' : ''}`}
                      title={consignment['Sender Address'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Sender Address'] || 'N/A', `${index}-sender-address`)}
                    >
                      {consignment['Sender Address'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-sender-amount` ? 'copied' : ''}`}
                      title={`₹${Number(consignment['Total Amount Sender'] || 0).toFixed(2)}`}
                      onClick={() => copyToClipboard(`₹${Number(consignment['Total Amount Sender'] || 0).toFixed(2)}`, `${index}-sender-amount`)}
                    >
                      ₹{Number(consignment['Total Amount Sender'] || 0).toFixed(2)}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-payment-status` ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(consignment['Payment Status'] || 'N/A', `${index}-payment-status`)}
                    >
                      <span 
                        className={`payment ${consignment['Payment Status']?.toLowerCase() || 'unknown'}`}
                        title={consignment['Payment Status'] || 'N/A'}
                      >
                        {consignment['Payment Status'] || 'N/A'}
                      </span>
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-traveler-id` ? 'copied' : ''}`}
                      title={consignment['Traveler Id'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Traveler Id'] || 'N/A', `${index}-traveler-id`)}
                    >
                      {consignment['Traveler Id'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-acceptance-date` ? 'copied' : ''}`}
                      title={formatDate(consignment['Traveler Acceptance Date'])}
                      onClick={() => copyToClipboard(formatDate(consignment['Traveler Acceptance Date']), `${index}-acceptance-date`)}
                    >
                      {formatDate(consignment['Traveler Acceptance Date'])}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-traveler-name` ? 'copied' : ''}`}
                      title={consignment['Traveler Name'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Traveler Name'] || 'N/A', `${index}-traveler-name`)}
                    >
                      {consignment['Traveler Name'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-traveler-mobile` ? 'copied' : ''}`}
                      title={consignment['Traveler Mobile No'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Traveler Mobile No'] || 'N/A', `${index}-traveler-mobile`)}
                    >
                      {consignment['Traveler Mobile No'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-traveler-address` ? 'copied' : ''}`}
                      title={consignment['Traveler Address'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Traveler Address'] || 'N/A', `${index}-traveler-address`)}
                    >
                      {consignment['Traveler Address'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-traveler-amount` ? 'copied' : ''}`}
                      title={`₹${Number(consignment['Amount to be paid to Traveler'] || 0).toFixed(2)}`}
                      onClick={() => copyToClipboard(`₹${Number(consignment['Amount to be paid to Traveler'] || 0).toFixed(2)}`, `${index}-traveler-amount`)}
                    >
                      ₹{Number(consignment['Amount to be paid to Traveler'] || 0).toFixed(2)}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-traveler-payment` ? 'copied' : ''}`}
                      onClick={() => copyToClipboard(consignment['Traveler Payment Status'] || 'N/A', `${index}-traveler-payment`)}
                    >
                      <span 
                        className={`payment ${consignment['Traveler Payment Status']?.toLowerCase() || 'unknown'}`}
                        title={consignment['Traveler Payment Status'] || 'N/A'}
                      >
                        {consignment['Traveler Payment Status'] || 'N/A'}
                      </span>
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-travel-mode` ? 'copied' : ''}`}
                      title={consignment['Travel Mode'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Travel Mode'] || 'N/A', `${index}-travel-mode`)}
                    >
                      {consignment['Travel Mode'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-travel-start` ? 'copied' : ''}`}
                      title={formatDate(consignment['Travel Start Date'])}
                      onClick={() => copyToClipboard(formatDate(consignment['Travel Start Date']), `${index}-travel-start`)}
                    >
                      {formatDate(consignment['Travel Start Date'])}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-travel-end` ? 'copied' : ''}`}
                      title={formatDate(consignment['Travel End Date'])}
                      onClick={() => copyToClipboard(formatDate(consignment['Travel End Date']), `${index}-travel-end`)}
                    >
                      {formatDate(consignment['Travel End Date'])}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-recipient-name` ? 'copied' : ''}`}
                      title={consignment['Recipient Name'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Recipient Name'] || 'N/A', `${index}-recipient-name`)}
                    >
                      {consignment['Recipient Name'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-recipient-address` ? 'copied' : ''}`}
                      title={consignment['Recipient Address'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Recipient Address'] || 'N/A', `${index}-recipient-address`)}
                    >
                      {consignment['Recipient Address'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-recipient-phone` ? 'copied' : ''}`}
                      title={consignment['Recipient Phone no'] || 'N/A'}
                      onClick={() => copyToClipboard(consignment['Recipient Phone no'] || 'N/A', `${index}-recipient-phone`)}
                    >
                      {consignment['Recipient Phone no'] || 'N/A'}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-received-date` ? 'copied' : ''}`}
                      title={formatDate(consignment['Received Date'])}
                      onClick={() => copyToClipboard(formatDate(consignment['Received Date']), `${index}-received-date`)}
                    >
                      {formatDate(consignment['Received Date'])}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-te-amount` ? 'copied' : ''}`}
                      title={`₹${Number(consignment['T&E Amount'] || 0).toFixed(2)}`}
                      onClick={() => copyToClipboard(`₹${Number(consignment['T&E Amount'] || 0).toFixed(2)}`, `${index}-te-amount`)}
                    >
                      ₹{Number(consignment['T&E Amount'] || 0).toFixed(2)}
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-tax-component` ? 'copied' : ''}`}
                      title={`₹${Number(consignment['Tax Component'] || 0).toFixed(2)}`}
                      onClick={() => copyToClipboard(`₹${Number(consignment['Tax Component'] || 0).toFixed(2)}`, `${index}-tax-component`)}
                    >
                      ₹{Number(consignment['Tax Component'] || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="page-controls">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            «
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`${currentPage === page ? "page-controls active-page" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
        <div className="pagination-info">
          Showing page {currentPage} of {totalPages} ({totalRecords} total records)
        </div>
      </div>
    </div>
  );
};

export default ConsignmentConsolidatedReport; 