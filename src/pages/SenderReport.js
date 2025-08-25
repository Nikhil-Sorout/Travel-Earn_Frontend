import React, { useState, useEffect } from 'react';
import { getSenderReport, getSenderConsignmentDetails } from '../Services/Api';
import './Styles/SenderReport.css';

const SenderReport = () => {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [copiedCell, setCopiedCell] = useState(null);
  const [modalCopiedCell, setModalCopiedCell] = useState(null);
  const [expandedSender, setExpandedSender] = useState(null);
  const [expandedConsignments, setExpandedConsignments] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const recordsPerPage = 30;

  useEffect(() => {
    fetchSenderData();
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

  const copyModalToClipboard = async (text, cellId) => {
    try {
      await navigator.clipboard.writeText(text);
      setModalCopiedCell(cellId);
      // Clear the copied state after 2 seconds
      setTimeout(() => setModalCopiedCell(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setModalCopiedCell(cellId);
      setTimeout(() => setModalCopiedCell(null), 2000);
    }
  };

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

  const fetchSenderData = async () => {
    try {
      setLoading(true);
      const response = await getSenderReport(currentPage, recordsPerPage);
      console.log('Sender data received:', response);
      
      // Handle the backend response structure with data and pagination
      const data = response.data || response;
      console.log('Processed data:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('First sender record keys:', Object.keys(data[0]));
        console.log('Sample record:', {
          senderId: data[0]['Sender Id'],
          name: data[0]['Name'],
          phoneNo: data[0]['Phone No'],
          address: data[0]['Address'],
          totalAmount: data[0]['Total Amount']
        });
      }
      
      setSenders(Array.isArray(data) ? data : []);
      
      // Set pagination info if available
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1);
        setTotalRecords(response.pagination.totalRecords || 0);
      } else {
        // If no pagination info, calculate based on data length
        setTotalPages(Math.ceil((Array.isArray(data) ? data.length : 0) / recordsPerPage));
        setTotalRecords(Array.isArray(data) ? data.length : 0);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch sender data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConsignmentClick = async (senderPhone, senderId) => {
    if (expandedSender === senderPhone) {
      // Collapse if already expanded
      setExpandedSender(null);
      setExpandedConsignments([]);
    } else {
      // Expand and fetch details
      setExpandedSender(senderPhone);
      setLoadingDetails(true);
      
      try {
        const detailsResponse = await getSenderConsignmentDetails(senderPhone);
        console.log('Consignment details received:', detailsResponse);
        
        const consignments = detailsResponse.data || [];
        setExpandedConsignments(consignments);
      } catch (err) {
        console.error('Error fetching consignment details:', err);
        setExpandedConsignments([]);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const filteredSenders = senders.filter(sender => {
    const matchesSearch = 
      sender['Sender Id']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender['Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender['Phone No']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender['Address']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender['State']?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sender['Status of Consignment'] === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Sender Id',
      'Name',
      'Phone No',
      'Address',
      'State',
      'No of Consignment',
      'Total Amount',
      'Status of Consignment',
      'Payment'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSenders.map(sender => [
        sender['Sender Id'] || '',
        `"${sender['Name'] || ''}"`,
        sender['Phone No'] || '',
        `"${sender['Address'] || ''}"`,
        sender['State'] || '',
        sender['No of Consignment'] || 0,
        Number(sender['Total Amount'] || 0).toFixed(2),
        sender['Status of Consignment'] || '',
        sender['Payment'] || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sender_report.csv');
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
      <div className="sender-report-container">
        <div className="loading">Loading sender data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sender-report-container">
        <div className="error">{error}</div>
        <button onClick={fetchSenderData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="sender-report-container">
      <div className="report-header">
        <h1>Sender Report</h1>
        <div className="header-controls">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search by ID, name, phone, address, state..."
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
              <option value="Payment Completed">Payment Completed</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="No Consignments">No Consignments</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="export-btn">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Senders</h3>
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

      <div className="table-container">
        <table className="sender-table">
          <thead>
            <tr>
              <th>Sender Id</th>
              <th>Name</th>
              <th>Phone No</th>
              {/* <th>Address</th> */}
              {/* <th>State</th> */}
              <th>No of Consignment</th>
              <th>Total Amount</th>
              {/* <th>Status of Consignment</th> */}
              {/* <th>Payment</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredSenders.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No sender data available</td>
              </tr>
            ) : (
              filteredSenders.map((sender, index) => (
                <React.Fragment key={sender['Sender Id'] || index}>
                  <tr>
                    <td 
                      className={`id-cell copyable-cell ${copiedCell === `${index}-id` ? 'copied' : ''}`}
                      title={sender['Sender Id'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['Sender Id'] || 'N/A', `${index}-id`)}
                    >
                      {sender['Sender Id'] || 'N/A'}
                    </td>
                    <td 
                      className={`large-value copyable-cell ${copiedCell === `${index}-name` ? 'copied' : ''}`}
                      title={sender['Name'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['Name'] || 'N/A', `${index}-name`)}
                    >
                      {sender['Name'] || 'N/A'}
                    </td>
                    <td 
                      className={`phone-cell copyable-cell ${copiedCell === `${index}-phone` ? 'copied' : ''}`}
                      title={sender['Phone No'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['Phone No'] || 'N/A', `${index}-phone`)}
                    >
                      {sender['Phone No'] || 'N/A'}
                    </td>
                    {/* <td 
                      className={`address-cell copyable-cell ${copiedCell === `${index}-address` ? 'copied' : ''}`}
                      title={sender['Address'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['Address'] || 'N/A', `${index}-address`)}
                    >
                      {sender['Address'] || 'N/A'}
                    </td> */}
                    {/* <td 
                      className={`copyable-cell ${copiedCell === `${index}-state` ? 'copied' : ''}`}
                      title={sender['State'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['State'] || 'N/A', `${index}-state`)}
                    >
                      {sender['State'] || 'N/A'}
                    </td> */}
                    <td 
                      className={`consignment-count-cell ${copiedCell === `${index}-consignment-count` ? 'copied' : ''}`}
                      title={`Click to view ${sender['No of Consignment'] || 0} consignments`}
                      onClick={() => handleConsignmentClick(sender['Phone No'], sender['Sender Id'])}
                    >
                      <span className="clickable-count">
                        {sender['No of Consignment'] || 0}
                        {expandedSender === sender['Phone No'] ? ' ▼' : ' ▶'}
                      </span>
                    </td>
                    <td 
                      className={`amount-cell copyable-cell ${copiedCell === `${index}-amount` ? 'copied' : ''}`}
                      title={`₹${Number(sender['Total Amount'] || 0).toFixed(2)}`}
                      onClick={() => copyToClipboard(`₹${Number(sender['Total Amount'] || 0).toFixed(2)}`, `${index}-amount`)}
                    >
                      ₹{Number(sender['Total Amount'] || 0).toFixed(2)}
                    </td>
                    {/* <td 
                      className={`copyable-cell ${copiedCell === `${index}-status` ? 'copied' : ''}`}
                      title={sender['Status of Consignment'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['Status of Consignment'] || 'N/A', `${index}-status`)}
                    >
                      <span className={`status ${sender['Status of Consignment']?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                        {sender['Status of Consignment'] || 'N/A'}
                      </span>
                    </td>
                    <td 
                      className={`copyable-cell ${copiedCell === `${index}-payment` ? 'copied' : ''}`}
                      title={sender['Payment'] || 'N/A'}
                      onClick={() => copyToClipboard(sender['Payment'] || 'N/A', `${index}-payment`)}
                    >
                      <span className={`payment ${sender['Payment']?.toLowerCase() || 'unknown'}`}>
                        {sender['Payment'] || 'N/A'}
                      </span>
                    </td> */}
                  </tr>
                  
                  {/* Expanded consignment details row */}
                  {expandedSender === sender['Phone No'] && (
                    <tr className="expanded-details-row">
                      <td colSpan="9" className="consignment-details-cell">
                        {loadingDetails ? (
                          <div className="loading-details">Loading consignment details...</div>
                        ) : expandedConsignments.length > 0 ? (
                          <div className="consignment-details-container">
                            <h4>Consignment Details for {sender['Name']}</h4>
                            <div className="consignment-details-table">
                              <table>
                                <thead>
                                  <tr>
                                    <th>Consignment ID</th>
                                    <th>Starting Location</th>
                                    <th>Ending Location</th>
                                    <th>Payment Status</th>
                                    <th>Consignment Status</th>
                                    <th>Date of Sending</th>
                                    <th>Weight</th>
                                    <th>Description</th>
                                    <th>Receiver Name</th>
                                    <th>Receiver Phone</th>
                                    <th>Earnings</th>
                                    <th>Carry Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {expandedConsignments.map((consignment, consignmentIndex) => (
                                    <tr key={consignment.consignmentId || consignmentIndex}>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-id` ? 'copied' : ''}`}
                                        title={consignment.consignmentId || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.consignmentId || 'N/A', `modal-${consignmentIndex}-id`)}
                                      >
                                        {consignment.consignmentId || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-start` ? 'copied' : ''}`}
                                        title={consignment.startingLocation || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.startingLocation || 'N/A', `modal-${consignmentIndex}-start`)}
                                      >
                                        {consignment.startingLocation || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-end` ? 'copied' : ''}`}
                                        title={consignment.endingLocation || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.endingLocation || 'N/A', `modal-${consignmentIndex}-end`)}
                                      >
                                        {consignment.endingLocation || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-payment` ? 'copied' : ''}`}
                                        title={consignment.paymentStatus || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.paymentStatus || 'N/A', `modal-${consignmentIndex}-payment`)}
                                      >
                                        <span className={`payment ${consignment.paymentStatus?.toLowerCase() || 'unknown'}`}>
                                          {consignment.paymentStatus || 'N/A'}
                                        </span>
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-status` ? 'copied' : ''}`}
                                        title={consignment.consignmentStatus || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.consignmentStatus || 'N/A', `modal-${consignmentIndex}-status`)}
                                      >
                                        <span className={`status ${consignment.consignmentStatus?.toLowerCase().replace(' ', '-') || 'unknown'}`}>
                                          {consignment.consignmentStatus || 'N/A'}
                                        </span>
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-date` ? 'copied' : ''}`}
                                        title={formatDate(consignment.dateOfSending)}
                                        onClick={() => copyModalToClipboard(formatDate(consignment.dateOfSending), `modal-${consignmentIndex}-date`)}
                                      >
                                        {formatDate(consignment.dateOfSending)}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-weight` ? 'copied' : ''}`}
                                        title={consignment.weight || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.weight || 'N/A', `modal-${consignmentIndex}-weight`)}
                                      >
                                        {consignment.weight || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-desc` ? 'copied' : ''}`}
                                        title={consignment.description || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.description || 'N/A', `modal-${consignmentIndex}-desc`)}
                                      >
                                        {consignment.description || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-receiver` ? 'copied' : ''}`}
                                        title={consignment.receiverName || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.receiverName || 'N/A', `modal-${consignmentIndex}-receiver`)}
                                      >
                                        {consignment.receiverName || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-receiverPhone` ? 'copied' : ''}`}
                                        title={consignment.receiverPhone || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.receiverPhone || 'N/A', `modal-${consignmentIndex}-receiverPhone`)}
                                      >
                                        {consignment.receiverPhone || 'N/A'}
                                      </td>
                                      <td 
                                        className={`copyable-cell amount-cell ${modalCopiedCell === `modal-${consignmentIndex}-earnings` ? 'copied' : ''}`}
                                        title={`₹${Number(consignment.earnings || 0).toFixed(2)}`}
                                        onClick={() => copyModalToClipboard(`₹${Number(consignment.earnings || 0).toFixed(2)}`, `modal-${consignmentIndex}-earnings`)}
                                      >
                                        ₹{Number(consignment.earnings || 0).toFixed(2)}
                                      </td>
                                      <td 
                                        className={`copyable-cell ${modalCopiedCell === `modal-${consignmentIndex}-carry` ? 'copied' : ''}`}
                                        title={consignment.carryStatus || 'N/A'}
                                        onClick={() => copyModalToClipboard(consignment.carryStatus || 'N/A', `modal-${consignmentIndex}-carry`)}
                                      >
                                        <span className={`status ${consignment.carryStatus?.toLowerCase() || 'unknown'}`}>
                                          {consignment.carryStatus || 'N/A'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="no-consignments-message">No consignment details available</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
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

export default SenderReport; 