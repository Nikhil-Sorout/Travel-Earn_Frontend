import React, { useState, useEffect } from 'react';
import { getTravelerReport } from '../Services/Api';
import './Styles/TravelerReport.css';

const TravelerReport = () => {
  const [travelers, setTravelers] = useState([]);
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
    fetchTravelerData();
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

  const fetchTravelerData = async () => {
    try {
      setLoading(true);
      const response = await getTravelerReport(currentPage, recordsPerPage);
      console.log('Traveler data received:', response);
      
      // Handle the backend response structure with data and pagination
      const data = response.data || response;
      console.log('Processed data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('First traveler record keys:', Object.keys(data[0]));
        console.log('Name field value:', data[0]['Name']);
        console.log('Sample traveler record:', {
          travelerId: data[0]['Traveler Id'],
          name: data[0]['Name'],
          phoneNo: data[0]['Phone No'],
          address: data[0]['Address'],
          totalAmount: data[0]['Total Amount'],
          status: data[0]['Status of Consignment'],
          payment: data[0]['Payment'],
          consignment: data[0]['Traveler\'s Consignment'],
          // Additional debugging for address and amount issues
          rawAddress: data[0]['Address'],
          rawAmount: data[0]['Total Amount'],
          amountType: typeof data[0]['Total Amount']
        });
        
        // Check if address contains only "to" or similar empty concatenation
        if (data[0]['Address'] && (data[0]['Address'].trim() === 'to' || data[0]['Address'].trim() === ' to ' || data[0]['Address'].includes('undefined'))) {
          console.warn('⚠️ Address field contains empty concatenation:', data[0]['Address']);
        }
        
        // Check if amount is 0
        if (data[0]['Total Amount'] === 0 || data[0]['Total Amount'] === '0') {
          console.warn('⚠️ Total Amount is 0 for traveler:', data[0]['Traveler Id']);
        }
      }
      
      setTravelers(Array.isArray(data) ? data : []);
      
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
      setError('Failed to fetch traveler data');
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

  const filteredTravelers = travelers.filter(traveler => {
    // Get the name value using backend-specific logic
    const nameValue = traveler['Name'] || traveler.username || traveler.sender || '';
    // Clean up address for search
    const cleanAddress = (() => {
      const address = traveler['Address'] || '';
      if (!address || 
          address.trim() === 'to' || 
          address.trim() === ' to ' || 
          address.includes('undefined') ||
          address.trim() === 'null to null' ||
          address.trim() === ' to') {
        return '';
      }
      return address;
    })();
    
    const matchesSearch = 
      traveler['Traveler Id']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nameValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler['Phone No']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleanAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler['State']?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || traveler['Status of Consignment'] === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Traveler Id',
      'Name',
      'Phone No',
      'Address',
      'State',
      'No of Consignment',
      'Total Amount',
      'Traveler\'s Consignment',
      'Status of Consignment',
      'Payment'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTravelers.map(traveler => {
        // Get the name value using backend-specific logic
        const nameValue = traveler['Name'] || traveler.username || traveler.sender || '';
        
        // Clean up address for CSV export
        const cleanAddress = (() => {
          const address = traveler['Address'] || '';
          if (!address || 
              address.trim() === 'to' || 
              address.trim() === ' to ' || 
              address.includes('undefined') ||
              address.trim() === 'null to null' ||
              address.trim() === ' to') {
            return 'N/A';
          }
          return address;
        })();
        
        return [
          traveler['Traveler Id'] || '',
          `"${nameValue}"`,
          traveler['Phone No'] || '',
          `"${cleanAddress}"`,
          traveler['State'] || '',
          traveler['No of Consignment'] || 1,
          Number(traveler['Total Amount'] || 0).toFixed(2),
          `"${traveler['Traveler\'s Consignment'] || ''}"`,
          traveler['Status of Consignment'] || '',
          traveler['Payment'] || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'traveler_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="traveler-report-container">
        <div className="loading">Loading traveler data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="traveler-report-container">
        <div className="error">{error}</div>
        <button onClick={fetchTravelerData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="traveler-report-container">
      <div className="report-header">
        <h1>Traveler Report</h1>
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Delayed">Delayed</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="export-btn">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="traveler-table">
          <thead>
            <tr>
              <th>Traveler Id</th>
              <th>Name</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>State</th>
              <th>No of Consignment</th>
              <th>Total Amount</th>
              <th>Traveler's Consignment</th>
              <th>Status of Consignment</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {filteredTravelers.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No traveler data available</td>
              </tr>
            ) : (
                             filteredTravelers.map((traveler, index) => {
                               // Debug logging for first few travelers only
                               if (index < 3) {
                                 console.log(`Traveler ${index}:`, {
                                   travelerId: traveler['Traveler Id'],
                                   name: traveler['Name'],
                                   nameType: typeof traveler['Name']
                                 });
                               }
                               return (
                 <tr key={traveler['Traveler Id'] || index}>
                   <td 
                     className={`id-cell copyable-cell ${copiedCell === `${index}-id` ? 'copied' : ''}`}
                     title={traveler['Traveler Id'] || 'N/A'}
                     onClick={() => copyToClipboard(traveler['Traveler Id'] || 'N/A', `${index}-id`)}
                   >
                     {traveler['Traveler Id'] || 'N/A'}
                   </td>
                   <td 
                     className={`large-value copyable-cell ${copiedCell === `${index}-name` ? 'copied' : ''}`}
                     title={traveler['Name'] || traveler.username || traveler.sender || 'N/A'}
                     onClick={() => copyToClipboard(traveler['Name'] || traveler.username || traveler.sender || 'N/A', `${index}-name`)}
                   >
                     {traveler['Name'] || traveler.username || traveler.sender || 'N/A'}
                   </td>
                   <td 
                     className={`phone-cell copyable-cell ${copiedCell === `${index}-phone` ? 'copied' : ''}`}
                     title={traveler['Phone No'] || 'N/A'}
                     onClick={() => copyToClipboard(traveler['Phone No'] || 'N/A', `${index}-phone`)}
                   >
                     {traveler['Phone No'] || 'N/A'}
                   </td>
                   <td 
                     className={`address-cell copyable-cell ${copiedCell === `${index}-address` ? 'copied' : ''}`}
                     title={(() => {
                       const address = traveler['Address'] || '';
                       if (!address || 
                           address.trim() === 'to' || 
                           address.trim() === ' to ' || 
                           address.includes('undefined') ||
                           address.trim() === 'null to null' ||
                           address.trim() === ' to') {
                         return 'N/A';
                       }
                       return address;
                     })()}
                     onClick={() => {
                       const address = traveler['Address'] || '';
                       const cleanAddress = (!address || 
                           address.trim() === 'to' || 
                           address.trim() === ' to ' || 
                           address.includes('undefined') ||
                           address.trim() === 'null to null' ||
                           address.trim() === ' to') ? 'N/A' : address;
                       copyToClipboard(cleanAddress, `${index}-address`);
                     }}
                   >
                     {(() => {
                       const address = traveler['Address'] || '';
                       // Clean up empty concatenations like "to", " to ", "undefined to undefined", etc.
                       if (!address || 
                           address.trim() === 'to' || 
                           address.trim() === ' to ' || 
                           address.includes('undefined') ||
                           address.trim() === 'null to null' ||
                           address.trim() === ' to') {
                         return 'N/A';
                       }
                       return address;
                     })()}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-state` ? 'copied' : ''}`}
                     title={traveler['State'] || 'N/A'}
                     onClick={() => copyToClipboard(traveler['State'] || 'N/A', `${index}-state`)}
                   >
                     {traveler['State'] || 'N/A'}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-consignment-count` ? 'copied' : ''}`}
                     title={traveler['No of Consignment'] || 1}
                     onClick={() => copyToClipboard(String(traveler['No of Consignment'] || 1), `${index}-consignment-count`)}
                   >
                     {traveler['No of Consignment'] || 1}
                   </td>
                   <td 
                     className={`amount-cell copyable-cell ${copiedCell === `${index}-amount` ? 'copied' : ''}`}
                     title={`₹${Number(traveler['Total Amount'] || 0).toFixed(2)}`}
                     onClick={() => {
                       const amount = Number(traveler['Total Amount'] || 0);
                       copyToClipboard(`₹${amount.toFixed(2)}`, `${index}-amount`);
                     }}
                   >
                     {(() => {
                       const amount = Number(traveler['Total Amount'] || 0);
                       if (amount === 0) {
                         return <span style={{color: '#6c757d', fontStyle: 'italic'}}>₹0.00</span>;
                       }
                       return `₹${amount.toFixed(2)}`;
                     })()}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-consignment` ? 'copied' : ''}`}
                     title={traveler['Traveler\'s Consignment'] || 'No consignments'}
                     onClick={() => copyToClipboard(traveler['Traveler\'s Consignment'] || 'No consignments', `${index}-consignment`)}
                   >
                     {traveler['Traveler\'s Consignment'] && traveler['Traveler\'s Consignment'] !== 'N/A' ? (
                       <span className="consignment-info">{traveler['Traveler\'s Consignment']}</span>
                     ) : (
                       <span className="no-consignments">No consignments</span>
                     )}
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-status` ? 'copied' : ''}`}
                     title={traveler['Status of Consignment'] || 'N/A'}
                     onClick={() => copyToClipboard(traveler['Status of Consignment'] || 'N/A', `${index}-status`)}
                   >
                     <span className={`status ${traveler['Status of Consignment']?.toLowerCase() || 'unknown'}`}>
                       {traveler['Status of Consignment'] || 'N/A'}
                     </span>
                   </td>
                   <td 
                     className={`copyable-cell ${copiedCell === `${index}-payment` ? 'copied' : ''}`}
                     title={traveler['Payment'] || 'N/A'}
                     onClick={() => copyToClipboard(traveler['Payment'] || 'N/A', `${index}-payment`)}
                   >
                     <span className={`payment ${traveler['Payment']?.toLowerCase() || 'unknown'}`}>
                       {traveler['Payment'] || 'N/A'}
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
              <h2>{modalType === 'traveler' ? 'Traveler Consignments' : 'Sender Consignments'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <table className="consignment-modal-table">
                <thead>
                  <tr>
                    <th>Consignment ID</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Expected Earning</th>
                    <th>Distance</th>
                    <th>Category</th>
                    <th>Pickup</th>
                    <th>Delivery</th>
                    <th>Sender Phone</th>
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
                      <td>₹{Number(consignment.expectedEarning || 0).toFixed(2)}</td>
                      <td>{consignment.distance || 'N/A'} km</td>
                      <td>{consignment.category || 'N/A'}</td>
                      <td>{consignment.pickup || 'N/A'}</td>
                      <td>{consignment.delivery || 'N/A'}</td>
                      <td>{consignment.senderPhoneNumber || 'N/A'}</td>
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

export default TravelerReport; 