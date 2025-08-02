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
      const data = await getSenderReport();
      console.log('Sender data received:', data);
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
    const matchesSearch = 
      sender.consignmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.senderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.senderMobileNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.senderEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sender.consignmentStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Consignment ID',
      'Consignment Status',
      'Sender ID',
      'Sender Name',
      'Sender Mobile No',
      'Sender Email',
      'Sender Address',
      'Description',
      'Category',
      'Subcategory',
      'Weight',
      'Dimensions',
      'Distance',
      'Duration',
      'Handle With Care',
      'Special Request',
      'Delivery Type',
      'Payment Method',
      'Payment Status',
      'Tracking Number',
      'Estimated Delivery',
      'Actual Delivery',
      'Recipient Name',
      'Recipient Address',
      'Recipient Phone',
      'Total Amount Sender',
      'Amount to Traveler',
      'T&E Amount',
      'Tax Component',
      'Insurance Amount',
      'Total Amount',
      'Traveler Name',
      'Traveler Mobile',
      'Travel Mode',
      'Date of Sending',
      'Received Date',
      'Created At',
      'Updated At'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSenders.map(sender => [
        sender.consignmentId || '',
        sender.consignmentStatus || '',
        sender.senderId || '',
        `"${sender.senderName || ''}"`,
        sender.senderMobileNo || '',
        `"${sender.senderEmail || ''}"`,
        `"${sender.senderAddress || ''}"`,
        `"${sender.description || ''}"`,
        sender.category || '',
        sender.subcategory || '',
        sender.weight || '',
        sender.dimensions || '',
        sender.distance || '',
        sender.duration || '',
        sender.handleWithCare ? 'Yes' : 'No',
        `"${sender.specialRequest || ''}"`,
        sender.deliveryType || '',
        sender.paymentMethod || '',
        sender.paymentStatus || '',
        sender.trackingNumber || '',
        sender.estimatedDelivery || '',
        sender.actualDelivery || '',
        `"${sender.recepientName || ''}"`,
        `"${sender.recepientAddress || ''}"`,
        sender.recepientPhoneNo || '',
        sender.totalAmountSender || '',
        sender.amountToBePaidToTraveler || '',
        sender.tneAmount || '',
        sender.taxComponent || '',
        sender.insuranceAmount || '',
        sender.totalAmount || '',
        `"${sender.travelerName || ''}"`,
        sender.travelerMobileNo || '',
        sender.travelMode || '',
        sender.dateOfSending || '',
        sender.receivedDate || '',
        sender.createdAt || '',
        sender.updatedAt || ''
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
              placeholder="Search by ID, name, phone, email, description, category..."
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
              <th>Consignment Info</th>
              <th>Sender Details</th>
              <th>Consignment Details</th>
              <th>Recipient Info</th>
              <th>Financial Details</th>
              <th>Traveler Info</th>
              <th>Delivery Info</th>
              <th>Dates</th>
            </tr>
          </thead>
          <tbody>
            {filteredSenders.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No sender data available</td>
              </tr>
            ) : (
              filteredSenders.map((sender, index) => (
                <tr key={sender.consignmentId || index}>
                  <td>
                    <div className="consignment-info">
                      <div><strong>Consignment ID:</strong> {sender.consignmentId || 'N/A'}</div>
                      <div>
                        <strong>Status:</strong> 
                        <span className={`status ${sender.consignmentStatus?.toLowerCase() || 'unknown'}`}>
                          {sender.consignmentStatus || 'N/A'}
                        </span>
                      </div>
                      <div><strong>Tracking Number:</strong> {sender.trackingNumber || 'N/A'}</div>
                      <div><strong>Delivery Type:</strong> {sender.deliveryType || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="sender-details">
                      <div><strong>Sender ID:</strong> {sender.senderId || 'N/A'}</div>
                      <div><strong>Name:</strong> {sender.senderName || 'N/A'}</div>
                      <div><strong>Mobile:</strong> {sender.senderMobileNo || 'N/A'}</div>
                      <div><strong>Email:</strong> {sender.senderEmail || 'N/A'}</div>
                      <div><strong>Address:</strong> {sender.senderAddress || 'N/A'}</div>
                      <div><strong>Current Location:</strong> {sender.senderCurrentLocation || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="consignment-details">
                      <div><strong>Description:</strong> {sender.description || 'N/A'}</div>
                      <div><strong>Category:</strong> {sender.category || 'N/A'}</div>
                      <div><strong>Subcategory:</strong> {sender.subcategory || 'N/A'}</div>
                      <div><strong>Weight:</strong> {sender.weight || 'N/A'} kg</div>
                      <div><strong>Dimensional Weight:</strong> {sender.dimensionalweight || 'N/A'} kg</div>
                      <div><strong>Dimensions:</strong> {sender.dimensions || 'N/A'}</div>
                      <div><strong>Distance:</strong> {sender.distance || 'N/A'} km</div>
                      <div><strong>Duration:</strong> {sender.duration || 'N/A'} hrs</div>
                      <div><strong>Handle With Care:</strong> {sender.handleWithCare ? 'Yes' : 'No'}</div>
                      {sender.specialRequest && (
                        <div><strong>Special Request:</strong> {sender.specialRequest}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="recipient-info">
                      <div><strong>Name:</strong> {sender.recepientName || 'N/A'}</div>
                      <div><strong>Address:</strong> {sender.recepientAddress || 'N/A'}</div>
                      <div><strong>Phone:</strong> {sender.recepientPhoneNo || 'N/A'}</div>
                      <div><strong>Email:</strong> {sender.receiverEmail || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="financial-details">
                      <div><strong>Total Amount:</strong> ₹{Number(sender.totalAmountSender || 0).toFixed(2)}</div>
                      <div><strong>Amount to Traveler:</strong> ₹{Number(sender.amountToBePaidToTraveler || 0).toFixed(2)}</div>
                      {/* <div><strong>T&E Amount:</strong> ₹{Number(sender.tneAmount || 0).toFixed(2)}</div>
                      <div><strong>Tax Component:</strong> ₹{Number(sender.taxComponent || 0).toFixed(2)}</div>
                      <div><strong>Insurance Amount:</strong> ₹{Number(sender.insuranceAmount || 0).toFixed(2)}</div>
                      <div><strong>Total Amount:</strong> ₹{Number(sender.totalAmount || 0).toFixed(2)}</div>
                      <div>
                        <strong>Sender Payment:</strong> 
                        <span className={`payment ${sender.senderPaymentStatus?.toLowerCase() || 'unknown'}`}>
                          {sender.senderPaymentStatus || 'N/A'}
                        </span>
                      </div>
                      <div> */}
                        {/* <strong>Traveler Payment:</strong> 
                        <span className={`payment ${sender.travelerPaymentStatus?.toLowerCase() || 'unknown'}`}>
                          {sender.travelerPaymentStatus || 'N/A'}
                        </span>
                      </div>
                      <div><strong>Payment Method:</strong> {sender.paymentMethod || 'N/A'}</div>
                      */}
                      </div> 

                  </td>
                  <td>
                    <div className="traveler-info">
                      <div><strong>Traveler ID:</strong> {sender.travelerId || 'N/A'}</div>
                      <div><strong>Name:</strong> {sender.travelerName || 'N/A'}</div>
                      <div><strong>Mobile:</strong> {sender.travelerMobileNo || 'N/A'}</div>
                      <div><strong>Address:</strong> {sender.travelerAddress || 'N/A'}</div>
                      <div><strong>Acceptance Date:</strong> {sender.travelerAcceptanceDate || 'N/A'}</div>
                      <div><strong>Travel Mode:</strong> {sender.travelMode || 'N/A'}</div>
                      <div><strong>Has Traveler:</strong> {sender.hasTraveler || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="delivery-info">
                      <div><strong>Pickup Date:</strong> {sender.pickupDate || 'N/A'}</div>
                      <div><strong>Pickup Time:</strong> {sender.pickupTime || 'N/A'}</div>
                      <div><strong>Delivery Date:</strong> {sender.deliveryDate || 'N/A'}</div>
                      <div><strong>Delivery Time:</strong> {sender.deliveryTime || 'N/A'}</div>
                      <div><strong>Estimated Delivery:</strong> {sender.estimatedDelivery || 'N/A'}</div>
                      <div><strong>Actual Delivery:</strong> {sender.actualDelivery || 'N/A'}</div>
                      <div><strong>Signature:</strong> {sender.signature || 'N/A'}</div>
                      {sender.notes && (
                        <div><strong>Notes:</strong> {sender.notes}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="dates-info">
                      <div><strong>Date of Sending:</strong> {sender.dateOfSending || 'N/A'}</div>
                      <div><strong>Received Date:</strong> {sender.receivedDate || 'N/A'}</div>
                      <div><strong>Created:</strong> {sender.createdAt || 'N/A'}</div>
                      <div><strong>Updated:</strong> {sender.updatedAt || 'N/A'}</div>
                      <div><strong>Sender Created:</strong> {sender.senderCreatedAt || 'N/A'}</div>
                      <div><strong>Sender Updated:</strong> {sender.senderLastUpdated || 'N/A'}</div>
                    </div>
                  </td>
                </tr>
              ))
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