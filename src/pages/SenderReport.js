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

  useEffect(() => {
    fetchSenderData();
  }, []);

  const fetchSenderData = async () => {
    try {
      setLoading(true);
      const response = await getSenderReport();
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
                   <td className="id-cell" title={sender['Sender Id'] || 'N/A'}>{sender['Sender Id'] || 'N/A'}</td>
                   <td className="large-value" title={sender['Name'] || sender.senderName || 'N/A'}>
                     {sender['Name'] || sender.senderName || 'N/A'}
                   </td>
                   <td className="phone-cell" title={sender['Phone No'] || 'N/A'}>{sender['Phone No'] || 'N/A'}</td>
                   <td className="address-cell" title={sender['Address'] || 'N/A'}>{sender['Address'] || 'N/A'}</td>
                   <td title={sender['State'] || 'N/A'}>{sender['State'] || 'N/A'}</td>
                   <td title={sender['No of Consignment'] || 1}>{sender['No of Consignment'] || 1}</td>
                   <td className="amount-cell" title={`₹${Number(sender['Total Amount'] || 0).toFixed(2)}`}>₹{Number(sender['Total Amount'] || 0).toFixed(2)}</td>
                   <td title={sender['Sender\'s Consignment'] || 'No consignments'}>
                     {sender['Sender\'s Consignment'] && sender['Sender\'s Consignment'] !== 'N/A' ? (
                       <span className="consignment-info">{sender['Sender\'s Consignment']}</span>
                     ) : (
                       <span className="no-consignments">No consignments</span>
                     )}
                   </td>
                   <td title={sender['Status of Consignment'] || 'N/A'}>
                     <span className={`status ${sender['Status of Consignment']?.toLowerCase() || 'unknown'}`}>
                       {sender['Status of Consignment'] || 'N/A'}
                     </span>
                   </td>
                   <td title={sender['Payment'] || 'N/A'}>
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