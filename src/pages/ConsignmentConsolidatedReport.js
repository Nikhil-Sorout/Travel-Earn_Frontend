import React, { useState, useEffect } from 'react';
import { getConsignmentConsolidatedReport } from '../Services/Api';
import './Styles/ConsignmentConsolidatedReport.css';

const ConsignmentConsolidatedReport = () => {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchConsignmentData();
  }, []);

  const fetchConsignmentData = async () => {
    try {
      setLoading(true);
      const data = await getConsignmentConsolidatedReport();
      console.log('Consignment consolidated data received:', data);
      setConsignments(Array.isArray(data) ? data : []);
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
      consignment.consignmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.travelerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.recepientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || consignment.consignmentStatus === filterStatus;
    
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
      'Recepient Name',
      'Recepient Address',
      'Recepient Phone no',
      'Received Date',
      'T&E Amount',
      'Tax Component'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredConsignments.map(consignment => [
        consignment.consignmentId || '',
        consignment.consignmentStatus || '',
        consignment.senderId || '',
        `"${consignment.senderName || ''}"`,
        consignment.senderMobileNo || '',
        `"${consignment.senderAddress || ''}"`,
        consignment.totalAmountSender || '',
        consignment.paymentStatus || '',
        consignment.travelerId || '',
        consignment.travelerAcceptanceDate || '',
        `"${consignment.travelerName || ''}"`,
        consignment.travelerMobileNo || '',
        `"${consignment.travelerAddress || ''}"`,
        consignment.amountToBePaidToTraveler || '',
        consignment.travelerPaymentStatus || '',
        consignment.travelMode || '',
        consignment.travelStartDate || '',
        consignment.travelEndDate || '',
        `"${consignment.recepientName || ''}"`,
        `"${consignment.recepientAddress || ''}"`,
        consignment.recepientPhoneNo || '',
        consignment.receivedDate || '',
        consignment.tneAmount || '',
        consignment.taxComponent || ''
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
              placeholder="Search by ID, names..."
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
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <button onClick={exportToCSV} className="export-btn">
            Export to CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="consignment-table">
          <thead>
            <tr>
              <th>Consignment ID</th>
              <th>Status</th>
              <th>Sender ID</th>
              <th>Sender Name</th>
              <th>Sender Mobile</th>
              <th>Sender Address</th>
              <th>Total Amount</th>
              <th>Payment Status</th>
              <th>Traveler ID</th>
              <th>Acceptance Date</th>
              <th>Traveler Name</th>
              <th>Traveler Mobile</th>
              <th>Traveler Address</th>
              <th>Amount to Traveler</th>
              <th>Traveler Payment</th>
              <th>Travel Mode</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Recipient Name</th>
              <th>Recipient Address</th>
              <th>Recipient Phone</th>
              <th>Received Date</th>
              <th>T&E Amount</th>
              <th>Tax Component</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsignments.length === 0 ? (
              <tr>
                <td colSpan="25" className="no-data">No consignment data available</td>
              </tr>
            ) : (
              filteredConsignments.map((consignment, index) => (
                <tr key={consignment.consignmentId || index}>
                  <td>{consignment.consignmentId || 'N/A'}</td>
                  <td>
                    <span className={`status ${consignment.consignmentStatus?.toLowerCase() || 'unknown'}`}>
                      {consignment.consignmentStatus || 'N/A'}
                    </span>
                  </td>
                  <td>{consignment.senderId || 'N/A'}</td>
                  <td>{consignment.senderName || 'N/A'}</td>
                  <td>{consignment.senderMobileNo || 'N/A'}</td>
                  <td className="address-cell">{consignment.senderAddress || 'N/A'}</td>
                  <td>₹{Number(consignment.totalAmountSender || 0).toFixed(2)}</td>
                  <td>
                    <span className={`payment ${consignment.paymentStatus?.toLowerCase() || 'unknown'}`}>
                      {consignment.paymentStatus || 'N/A'}
                    </span>
                  </td>
                  <td>{consignment.travelerId || 'N/A'}</td>
                  <td>{consignment.travelerAcceptanceDate || 'N/A'}</td>
                  <td>{consignment.travelerName || 'N/A'}</td>
                  <td>{consignment.travelerMobileNo || 'N/A'}</td>
                  <td className="address-cell">{consignment.travelerAddress || 'N/A'}</td>
                  <td>₹{Number(consignment.amountToBePaidToTraveler || 0).toFixed(2)}</td>
                  <td>
                    <span className={`payment ${consignment.travelerPaymentStatus?.toLowerCase() || 'unknown'}`}>
                      {consignment.travelerPaymentStatus || 'N/A'}
                    </span>
                  </td>
                  <td>{consignment.travelMode || 'N/A'}</td>
                  <td>{consignment.travelStartDate || 'N/A'}</td>
                  <td>{consignment.travelEndDate || 'N/A'}</td>
                  <td>{consignment.recepientName || 'N/A'}</td>
                  <td className="address-cell">{consignment.recepientAddress || 'N/A'}</td>
                  <td>{consignment.recepientPhoneNo || 'N/A'}</td>
                  <td>{consignment.receivedDate || 'N/A'}</td>
                  <td>₹{Number(consignment.tneAmount || 0).toFixed(2)}</td>
                  <td>₹{Number(consignment.taxComponent || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsignmentConsolidatedReport; 