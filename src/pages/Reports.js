import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import Header from './Header';
import TravelerReport from './TravelerReport';
import SenderReport from './SenderReport';
import ConsignmentConsolidatedReport from './ConsignmentConsolidatedReport';
import './Styles/Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('traveler');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="dashboard-container" style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <div className="dashboard-content" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f5f5f5' }}>
        {/* <Header onSearch={setSearchQuery} /> */}
        <div className="reports-container">
          <div className="reports-header">
            <h1>Reports</h1>
            <div className="tab-container">
              <button
                className={`tab-button ${activeTab === 'traveler' ? 'active' : ''}`}
                onClick={() => setActiveTab('traveler')}
              >
                Traveler Report
              </button>
              <button
                className={`tab-button ${activeTab === 'sender' ? 'active' : ''}`}
                onClick={() => setActiveTab('sender')}
              >
                Sender Report
              </button>
              <button
                className={`tab-button ${activeTab === 'consolidated' ? 'active' : ''}`}
                onClick={() => setActiveTab('consolidated')}
              >
                Consignment Consolidated Report
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === 'traveler' && <TravelerReport />}
            {activeTab === 'sender' && <SenderReport />}
            {activeTab === 'consolidated' && <ConsignmentConsolidatedReport />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 