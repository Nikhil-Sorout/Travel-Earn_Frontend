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
      <div className="table-container" style={{ overflowY: 'auto', maxHeight: '70vh', overflowX: 'auto' }}>
        <table className="sender-table">
          <thead>
            <tr>
              <th>Sender Id</th>
              <th>Name</th>
              <th>Phone No</th>
              <th>Address</th>
              <th>State</th>
              <th>No of<br />Consignment</th>
              <th>Total Amount</th>
              <th>Sender's Consignment</th>
              <th>Status of Consignment</th>
              <th>Payment</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {senders.length === 0 ? (
              <tr>
                <td colSpan="11" className="no-data">No sender data available</td>
              </tr>
            ) : (
              senders.map((sender, index) => (
                <tr key={sender.senderId || index}>
                  <td>{String(sender.senderId || 'N/A')}</td>
                  <td>{String(sender.name || 'N/A')}</td>
                  <td>{String(sender.phoneNo || 'N/A')}</td>
                  <td>{String(sender.address || 'N/A')}</td>
                  <td>{String(sender.state || 'N/A')}</td>
                  <td>{Number(sender.noOfConsignment || 0)}</td>
                  <td>₹{Number(sender.totalAmount || 0)}</td>
                  <td>
                    {Array.isArray(sender.senderConsignment) && sender.senderConsignment.length > 0 ? (
                      <button 
                        className="btn-details"
                        onClick={() => showConsignmentDetails(sender.senderConsignment, 'sender')}
                      >
                        View Details ({sender.senderConsignment.length})
                      </button>
                    ) : (
                      'No consignments'
                    )}
                  </td>
                  <td>
                    <span className={`status ${String(sender.statusOfConsignment || 'N/A').toLowerCase()}`}>
                      {String(sender.statusOfConsignment || 'N/A')}
                    </span>
                  </td>
                  <td>
                    <span className={`payment ${String(sender.payment || 'N/A').toLowerCase()}`}>
                      {String(sender.payment || 'N/A')}
                    </span>
                  </td>
                  <td>
                    <div className="rating">
                      <span className="stars">{'★'.repeat(Math.floor(sender.averageRating || 0))}</span>
                      <span className="rating-value">({Number(sender.averageRating || 0).toFixed(1)})</span>
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
              <h3>Sender Consignment Details</h3>
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
                    <th>Earning</th>
                    <th>Weight</th>
                    <th>Dimensional Weight</th>
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
                      <td>₹{Number(consignment.earning|| 0)}</td>
                      <td>{String(consignment.weight || 'N/A')}</td>
                      <td>{String(consignment.dimensionalweight || 'N/A')}</td>
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