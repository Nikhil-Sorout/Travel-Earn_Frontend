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

  useEffect(() => {
    fetchTravelerData();
  }, []);

  const fetchTravelerData = async () => {
    try {
      setLoading(true);
      const data = await getTravelerReport();
      console.log('Traveler data received:', data);
      setTravelers(Array.isArray(data) ? data : []);
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
    const matchesSearch = 
      traveler.travelerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.travelerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.phoneNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.leavingLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.goingLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || traveler.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Travel ID',
      'Traveler ID',
      'Traveler Name',
      'Phone No',
      'Email',
      'Address',
      'Leaving Location',
      'Going Location',
      'Travel Mode',
      'Vehicle Type',
      'Vehicle Number',
      'Travel Date',
      'Distance',
      'Duration',
      'Expected Earning',
      'Payable Amount',
      'Status',
      'Payment Status',
      'Average Rating',
      'Total Rating',
      'No of Consignments',
      'Total Amount',
      'Created At',
      'Updated At'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTravelers.map(traveler => [
        traveler.travelId || '',
        traveler.travelerId || '',
        `"${traveler.travelerName || ''}"`,
        traveler.phoneNo || '',
        `"${traveler.email || ''}"`,
        `"${traveler.address || ''}"`,
        traveler.leavingLocation || '',
        traveler.goingLocation || '',
        traveler.travelMode || '',
        traveler.vehicleType || '',
        traveler.vehicleNumber || '',
        traveler.travelDate || '',
        traveler.distance || '',
        traveler.duration || '',
        traveler.expectedearning || '',
        traveler.payableAmount || '',
        traveler.status || '',
        traveler.paymentStatus || '',
        traveler.averageRating || '',
        traveler.totalrating || '',
        traveler.noOfConsignment || '',
        traveler.totalAmount || '',
        traveler.createdAt || '',
        traveler.updatedAt || ''
      ].join(','))
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
              placeholder="Search by ID, name, phone, email, location..."
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
              <th>Travel Info</th>
              <th>Traveler Details</th>
              <th>Travel Details</th>
              <th>Financial Info</th>
              <th>Status & Rating</th>
              <th>Consignments</th>
              <th>Dates</th>
            </tr>
          </thead>
          <tbody>
            {filteredTravelers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">No traveler data available</td>
              </tr>
            ) : (
              filteredTravelers.map((traveler, index) => (
                <tr key={traveler.travelId || index}>
                  <td>
                    <div className="travel-info">
                      <div><strong>Travel ID:</strong> {traveler.travelId || 'N/A'}</div>
                      <div><strong>Traveler ID:</strong> {traveler.travelerId || 'N/A'}</div>
                      <div><strong>Traveler Name:</strong> {traveler.travelerName || 'N/A'}</div>
                      <div><strong>Phone:</strong> {traveler.phoneNo || 'N/A'}</div>
                      <div><strong>Email:</strong> {traveler.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="traveler-details">
                      <div><strong>Address:</strong> {traveler.address || 'N/A'}</div>
                      <div><strong>Is Verified:</strong> {traveler.isVerified ? 'Yes' : 'No'}</div>
                      <div><strong>Created:</strong> {traveler.travelerCreatedAt || 'N/A'}</div>
                      <div><strong>Last Updated:</strong> {traveler.travelerLastUpdated || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="travel-details">
                      <div><strong>From:</strong> {traveler.leavingLocation || 'N/A'}</div>
                      <div><strong>To:</strong> {traveler.goingLocation || 'N/A'}</div>
                      <div><strong>Mode:</strong> {traveler.travelMode || 'N/A'}</div>
                      <div><strong>Vehicle:</strong> {traveler.vehicleType || 'N/A'}</div>
                      <div><strong>Vehicle No:</strong> {traveler.vehicleNumber || 'N/A'}</div>
                      <div><strong>Date:</strong> {traveler.travelDate || 'N/A'}</div>
                      <div><strong>Distance:</strong> {traveler.distance || 'N/A'} km</div>
                      <div><strong>Duration:</strong> {traveler.duration || 'N/A'} hrs</div>
                    </div>
                  </td>
                  <td>
                    <div className="financial-info">
                      <div><strong>Expected Earning:</strong> ₹{Number(traveler.expectedearning || 0).toFixed(2)}</div>
                      <div><strong>Payable Amount:</strong> ₹{Number(traveler.payableAmount || 0).toFixed(2)}</div>
                      {/* <div><strong>Base Amount:</strong> ₹{Number(traveler.baseAmount || 0).toFixed(2)}</div>
                      <div><strong>Discount:</strong> ₹{Number(traveler.discount || 0).toFixed(2)}</div>
                      <div><strong>Total Amount:</strong> ₹{Number(traveler.totalAmount || 0).toFixed(2)}</div>
                      <div><strong>Insurance:</strong> ₹{Number(traveler.insuranceAmount || 0).toFixed(2)}</div>
                      <div><strong>Fuel Cost:</strong> ₹{Number(traveler.fuelCost || 0).toFixed(2)}</div>
                      <div><strong>Toll Charges:</strong> ₹{Number(traveler.tollCharges || 0).toFixed(2)}</div> */}
                    </div>
                  </td>
                  <td>
                    <div className="status-rating">
                      <div>
                        <strong>Status:</strong> 
                        <span className={`status ${traveler.status?.toLowerCase() || 'unknown'}`}>
                          {traveler.status || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <strong>Payment Status:</strong> 
                        <span className={`payment ${traveler.paymentStatus?.toLowerCase() || 'unknown'}`}>
                          {traveler.paymentStatus || 'N/A'}
                        </span>
                      </div>
                      <div><strong>Payment Method:</strong> {traveler.paymentMethod || 'N/A'}</div>
                      <div><strong>Average Rating:</strong> {traveler.averageRating || 'N/A'}/5</div>
                      <div><strong>Total Rating:</strong> {traveler.totalrating || 'N/A'}</div>
                      {traveler.review && (
                        <div><strong>Review:</strong> {traveler.review}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="consignments-info">
                      <div><strong>No of Consignments:</strong> {traveler.noOfConsignment || 0}</div>
                      <div><strong>Payment:</strong> {traveler.payment || 'N/A'}</div>
                      {Array.isArray(traveler.associatedConsignments) && traveler.associatedConsignments.length > 0 ? (
                        <button 
                          className="btn-details"
                          onClick={() => showConsignmentDetails(traveler.associatedConsignments, 'traveler')}
                        >
                          View Consignments ({traveler.associatedConsignments.length})
                        </button>
                      ) : (
                        <span className="no-consignments">No consignments</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="dates-info">
                      <div><strong>Travel Date:</strong> {traveler.travelDate || 'N/A'}</div>
                      <div><strong>Start Date:</strong> {traveler.startedat || 'N/A'}</div>
                      <div><strong>End Date:</strong> {traveler.endedat || 'N/A'}</div>
                      <div><strong>Created:</strong> {traveler.createdAt || 'N/A'}</div>
                      <div><strong>Updated:</strong> {traveler.updatedAt || 'N/A'}</div>
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