import React, { useState, useEffect } from 'react';
import { getSenderReport } from '../Services/Api';
import './Styles/SenderReport.css';

const SenderReport = () => {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedConsignments, setSelectedConsignments] = useState([]);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [copiedCell, setCopiedCell] = useState(null);
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
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('First sender record keys:', Object.keys(data[0]));
        console.log('Name field value:', data[0]['Name']);
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

  const showConsignmentDetails = (consignments, type) => {
    setSelectedConsignments(consignments);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedConsignments([]);
    setModalType('');
  };

  const filteredSenders = senders.filter(sender => {
    // Get the name value using simplified logic
    const nameValue = sender['Name'] || sender.senderName || '';
    
    const matchesSearch = 
      sender['Sender Id']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nameValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      'Sender\'s Consignment',
      'Status of Consignment',
      'Payment'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSenders.map(sender => {
        // Get the name value using simplified logic
        const nameValue = sender['Name'] || sender.senderName || '';
        
        return [
          sender['Sender Id'] || '',
          `"${nameValue}"`,
          sender['Phone No'] || '',
          `"${sender['Address'] || ''}"`,
          sender['State'] || '',
          sender['No of Consignment'] || 1,
          Number(sender['Total Amount'] || 0).toFixed(2),
          `"${sender['Sender\'s Consignment'] || ''}"`,
          sender['Status of Consignment'] || '',
          sender['Payment'] || ''
        ].join(',');
      })
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

      <div className="table-container">
        <table className="sender-table">
          <thead>
            <tr>
              <th>Sender Id</th>
              <th>Name</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>State</th>
              <th>No of Consignment</th>
              <th>Total Amount</th>
              <th>Sender's Consignment</th>
              <th>Status of Consignment</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredSenders.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No sender data available</td>
              </tr>
            ) : (
                             filteredSenders.map((sender, index) => {
                               // Debug logging for first few senders only
                               if (index < 3) {
                                 console.log(`Sender ${index}:`, {
                                   senderId: sender['Sender Id'],
                                   name: sender['Name'],
                                   nameType: typeof sender['Name']
                                 });
                               }
                               return (
                 <tr key={sender['Sender Id'] || index}>
                   <td 
                     className={`id-cell copyable-cell ${copiedCell === `${index}-id` ? 'copied' : ''}`}
                     title={sender['Sender Id'] || 'N/A'}
                     onClick={() => copyToClipboard(sender['Sender Id'] || 'N/A', `${index}-id`)}
                   >
                     {sender['Sender Id'] || 'N/A'}
                   </td>
                   <td 
                     className={`large-value copyable-cell ${copiedCell === `${index}-name` ? 'copied' : ''}`}
                     title={sender['Name'] || sender.senderName || 'N/A'}
                     onClick={() => copyToClipboard(sender['Name'] || sender.senderName || 'N/A', `${index}-name`)}
                   >
                     {sender['Name'] || sender.senderName || 'N/A'}
                   </td>
                   <td 
                     className={`phone-cell copyable-cell ${copiedCell === `${index}-phone` ? 'copied' : ''}`}
                     title={sender['Phone No'] || 'N/A'}
                     onClick={() => copyToClipboard(sender['Phone No'] || 'N/A', `${index}-phone`)}
                   >
                     {sender['Phone No'] || 'N/A'}
                   </td>
                   <td 
                     className={`address-cell copyable-cell ${copiedCell === `${index}-address` ? 'copied' : ''}`}
                     title={sender['Address'] || 'N/A'}
                     onClick={() => copyToClipboard(sender['Address'] || 'N/A', `${index}-address`)}
                   >
                     {sender['Address'] || 'N/A'}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-state` ? 'copied' : ''}`}
                     title={sender['State'] || 'N/A'}
                     onClick={() => copyToClipboard(sender['State'] || 'N/A', `${index}-state`)}
                   >
                     {sender['State'] || 'N/A'}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-consignment-count` ? 'copied' : ''}`}
                     title={sender['No of Consignment'] || 1}
                     onClick={() => copyToClipboard(String(sender['No of Consignment'] || 1), `${index}-consignment-count`)}
                   >
                     {sender['No of Consignment'] || 1}
                   </td>
                   <td 
                     className={`amount-cell copyable-cell ${copiedCell === `${index}-amount` ? 'copied' : ''}`}
                     title={`₹${Number(sender['Total Amount'] || 0).toFixed(2)}`}
                     onClick={() => copyToClipboard(`₹${Number(sender['Total Amount'] || 0).toFixed(2)}`, `${index}-amount`)}
                   >
                     ₹{Number(sender['Total Amount'] || 0).toFixed(2)}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-consignment` ? 'copied' : ''}`}
                     title={sender['Sender\'s Consignment'] || 'No consignments'}
                     onClick={() => copyToClipboard(sender['Sender\'s Consignment'] || 'No consignments', `${index}-consignment`)}
                   >
                     {sender['Sender\'s Consignment'] && sender['Sender\'s Consignment'] !== 'N/A' ? (
                       <span className="consignment-info">{sender['Sender\'s Consignment']}</span>
                     ) : (
                       <span className="no-consignments">No consignments</span>
                     )}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-status` ? 'copied' : ''}`}
                     title={sender['Status of Consignment'] || 'N/A'}
                     onClick={() => copyToClipboard(sender['Status of Consignment'] || 'N/A', `${index}-status`)}
                   >
                     <span className={`status ${sender['Status of Consignment']?.toLowerCase() || 'unknown'}`}>
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
                   </td>
                 </tr>
               );
                             })
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

      {/* Modal for consignment details */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'sender' ? 'Sender Consignments' : 'Traveler Consignments'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <table className="consignment-modal-table">
                <thead>
                  <tr>
                    <th>Consignment ID</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Weight</th>
                    <th>Distance</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedConsignments.map((consignment, index) => (
                    <tr key={consignment.consignmentId || index}>
                      <td>{consignment.consignmentId || 'N/A'}</td>
                      <td>{consignment.description || 'N/A'}</td>
                      <td>
                        <span className={`status ${consignment.status?.toLowerCase() || 'unknown'}`}>
                          {consignment.status || 'N/A'}
                        </span>
                      </td>
                      <td>{consignment.category || 'N/A'}</td>
                      <td>{consignment.weight || 'N/A'} kg</td>
                      <td>{consignment.distance || 'N/A'} km</td>
                      <td>₹{Number(consignment.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`payment ${consignment.paymentStatus?.toLowerCase() || 'unknown'}`}>
                          {consignment.paymentStatus || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SenderReport; 