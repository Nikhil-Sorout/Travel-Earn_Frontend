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
      <div className="table-container" style={{ overflowX: 'auto', maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="traveler-table">
          <thead>
            <tr>
              <th>Traveler Id</th>
              <th>Name</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>State</th>
              <th>No of<br />Consignment</th>
              <th>Total Amount</th>
              <th>Traveler's Consignment</th>
              <th>Status of Consignment</th>
              <th>Payment</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {travelers.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">No traveler data available</td>
              </tr>
            ) : (
              travelers.map((traveler, index) => (
                <tr key={traveler.travelerId || index}>
                  <td>{String(traveler.travelerId || 'N/A')}</td>
                  <td>{String(traveler.name || 'N/A')}</td>
                  <td>{String(traveler.phoneNo || 'N/A')}</td>
                  <td>{String(traveler.address || 'N/A')}</td>
                  <td>{String(traveler.state || 'N/A')}</td>
                  <td>{Number(traveler.noOfConsignment || 0)}</td>
                  <td>₹{Number(traveler.totalAmount || 0)}</td>
                  <td>
                    {Array.isArray(traveler.travelerConsignment) && traveler.travelerConsignment.length > 0 ? (
                      <button 
                        className="btn-details"
                        onClick={() => showConsignmentDetails(traveler.travelerConsignment, 'traveler')}
                      >
                        View Details ({traveler.travelerConsignment.length})
                      </button>
                    ) : (
                      'No consignments'
                    )}
                  </td>
                  <td>
                    <span className={`status ${String(traveler.statusOfConsignment || 'N/A').toLowerCase()}`}>
                      {String(traveler.statusOfConsignment || 'N/A')}
                    </span>
                  </td>
                  <td>
                    <span className={`payment ${String(traveler.payment || 'N/A').toLowerCase()}`}>
                      {String(traveler.payment || 'N/A')}
                    </span>
                  </td>
                  <td>
                    <div className="rating">
                      <span className="stars">{'★'.repeat(Math.floor(traveler.averageRating || 0))}</span>
                      <span className="rating-value">({Number(traveler.averageRating || 0).toFixed(1)})</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Consignment Details Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Traveler Consignment Details</h3>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <table className="consignment-table">
                <thead>
                  <tr>
                    <th>Consignment ID</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Distance</th>
                    <th>Category</th>
                    <th>Expected Earning</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedConsignments.map((consignment) => (
                    <tr key={consignment.consignmentId}>
                      <td>{String(consignment.consignmentId || 'N/A')}</td>
                      <td>{String(consignment.description || 'N/A')}</td>
                      <td>
                        <span className={`status ${String(consignment.status || 'N/A').toLowerCase()}`}>
                          {String(consignment.status || 'N/A')}
                        </span>
                      </td>
                      <td>{String(consignment.distance || 'N/A')}</td>
                      <td>
                        <span className={`category ${String(consignment.category || 'N/A').toLowerCase()}`}>
                          {String(consignment.category || 'N/A')}
                        </span>
                      </td>
                      <td>₹{Number(consignment.expectedEarning || 0)}</td>
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