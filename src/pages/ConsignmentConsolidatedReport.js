import React, { useState, useEffect } from 'react';
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
  const [recordsPerPage, setRecordsPerPage] = useState(100);

  useEffect(() => {
    fetchConsignmentData();
  }, [currentPage]);

  const fetchConsignmentData = async () => {
    try {
      setLoading(true);
      const response = await getConsignmentConsolidatedReport(currentPage, recordsPerPage);
      console.log('Consignment consolidated data received:', response);
      
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
        setTotalRecords(response.pagination.totalRecords || 0);
        setRecordsPerPage(response.pagination.recordsPerPage || 100);
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
      consignment.consignmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.travelerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.recepientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consignment.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      'Traveler Total Earnings',
      'Travel Mode',
      'Travel Start Date',
      'Travel End Date',
      'Recipient Name',
      'Recipient Address',
      'Recipient Phone No',
      'Received Date',
      'T&E Amount',
      'Tax Component',
      'Weight',
      'Category',
      'Subcategory',
      'Description',
      'Dimensions',
      'Distance',
      'Duration',
      'Handle With Care',
      'Special Request',
      'Date of Sending',
      'Created At',
      'Updated At'
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
        consignment.travelerTotalEarnings || '',
        consignment.travelMode || '',
        consignment.travelStartDate || '',
        consignment.travelEndDate || '',
        `"${consignment.recepientName || ''}"`,
        `"${consignment.recepientAddress || ''}"`,
        consignment.recepientPhoneNo || '',
        consignment.receivedDate || '',
        consignment.tneAmount || '',
        consignment.taxComponent || '',
        consignment.weight || '',
        consignment.category || '',
        consignment.subcategory || '',
        `"${consignment.description || ''}"`,
        consignment.dimensions || '',
        consignment.distance || '',
        consignment.duration || '',
        consignment.handleWithCare ? 'Yes' : 'No',
        `"${consignment.specialRequest || ''}"`,
        consignment.dateOfSending || '',
        consignment.createdAt || '',
        consignment.updatedAt || ''
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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
              placeholder="Search by ID, names, description, category..."
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

      <div className="table-container">
        <table className="consignment-table">
          <thead>
            <tr>
              <th>Consignment ID</th>
              <th>Status</th>
              <th>Sender Info</th>
              <th>Amount & Payment</th>
              <th>Traveler Info</th>
              <th>Travel Details</th>
              <th>Recipient Info</th>
              <th>Financial Details</th>
              <th>Consignment Details</th>
              <th>Dates</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsignments.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No consignment data available</td>
              </tr>
            ) : (
              filteredConsignments.map((consignment, index) => (
                <tr key={consignment.consignmentId || index}>
                  <td>
                    <div className="consignment-id">{consignment.consignmentId || 'N/A'}</div>
                    <div className="status-badge">
                      <span className={`status ${consignment.consignmentStatus?.toLowerCase() || 'unknown'}`}>
                        {consignment.consignmentStatus || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="sender-info">
                      <div><strong>ID:</strong> {consignment.senderId || 'N/A'}</div>
                      <div><strong>Name:</strong> {consignment.senderName || 'N/A'}</div>
                      <div><strong>Mobile:</strong> {consignment.senderMobileNo || 'N/A'}</div>
                      <div><strong>Address:</strong> {consignment.senderAddress || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <div><strong>Total Amount:</strong> ₹{Number(consignment.totalAmountSender || 0).toFixed(2)}</div>
                      <div><strong>Payment Status:</strong> 
                        <span className={`payment ${consignment.paymentStatus?.toLowerCase() || 'unknown'}`}>
                          {consignment.paymentStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="traveler-info">
                      <div><strong>ID:</strong> {consignment.travelerId || 'N/A'}</div>
                      <div><strong>Name:</strong> {consignment.travelerName || 'N/A'}</div>
                      <div><strong>Mobile:</strong> {consignment.travelerMobileNo || 'N/A'}</div>
                      <div><strong>Address:</strong> {consignment.travelerAddress || 'N/A'}</div>
                      <div><strong>Acceptance Date:</strong> {consignment.travelerAcceptanceDate || 'N/A'}</div>
                      <div><strong>Total Earnings:</strong> ₹{Number(consignment.travelerTotalEarnings || 0).toFixed(2)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="travel-details">
                      <div><strong>Mode:</strong> {consignment.travelMode || 'N/A'}</div>
                      <div><strong>Start Date:</strong> {consignment.travelStartDate || 'N/A'}</div>
                      <div><strong>End Date:</strong> {consignment.travelEndDate || 'N/A'}</div>
                      <div><strong>Amount to Traveler:</strong> ₹{Number(consignment.amountToBePaidToTraveler || 0).toFixed(2)}</div>
                      <div><strong>Traveler Payment:</strong> 
                        <span className={`payment ${consignment.travelerPaymentStatus?.toLowerCase() || 'unknown'}`}>
                          {consignment.travelerPaymentStatus || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="recipient-info">
                      <div><strong>Name:</strong> {consignment.recepientName || 'N/A'}</div>
                      <div><strong>Address:</strong> {consignment.recepientAddress || 'N/A'}</div>
                      <div><strong>Phone:</strong> {consignment.recepientPhoneNo || 'N/A'}</div>
                      <div><strong>Received Date:</strong> {consignment.receivedDate || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="financial-details">
                      <div><strong>T&E Amount:</strong> ₹{Number(consignment.tneAmount || 0).toFixed(2)}</div>
                      <div><strong>Tax Component:</strong> ₹{Number(consignment.taxComponent || 0).toFixed(2)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="consignment-details">
                      <div><strong>Weight:</strong> {consignment.weight || 'N/A'} kg</div>
                      <div><strong>Category:</strong> {consignment.category || 'N/A'}</div>
                      <div><strong>Subcategory:</strong> {consignment.subcategory || 'N/A'}</div>
                      <div><strong>Description:</strong> {consignment.description || 'N/A'}</div>
                      <div><strong>Dimensions:</strong> {consignment.dimensions || 'N/A'}</div>
                      <div><strong>Distance:</strong> {consignment.distance || 'N/A'} km</div>
                      <div><strong>Duration:</strong> {consignment.duration || 'N/A'} hrs</div>
                      <div><strong>Handle With Care:</strong> {consignment.handleWithCare ? 'Yes' : 'No'}</div>
                      {consignment.specialRequest && (
                        <div><strong>Special Request:</strong> {consignment.specialRequest}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="dates-info">
                      <div><strong>Date of Sending:</strong> {consignment.dateOfSending || 'N/A'}</div>
                      <div><strong>Created:</strong> {consignment.createdAt || 'N/A'}</div>
                      <div><strong>Updated:</strong> {consignment.updatedAt || 'N/A'}</div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ConsignmentConsolidatedReport; 