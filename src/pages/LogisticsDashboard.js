import React, { useEffect, useState } from 'react';
import api from '../Services/Api';
import { ChevronDown, ChevronLeft, ChevronRight, Edit, Search } from 'lucide-react';
import Sidebar from "../Components/Sidebar";
import '../pages/Styles/Logistic.css';
import { exportTableToCSV, exportTableToExcel, exportTableToPDF } from './Utils/download';


const LogisticsDashboard = () => {
  const [travelHistory, setTravelHistory] = useState([]);
  const [activeTravel, setActiveTravel] = useState(0);
  const [completedTravel, setCompletedTravel] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 15;
  const [searchQuery, setSearchQuery] = useState('');
  const [driverName, setDriverName] = useState('');
  const [date, setDate] = useState('');

  const [selectedFormat, setSelectedFormat] = useState('CSV');

  const totalPages = Math.ceil(activeTravel / transactionsPerPage);

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

  useEffect(() => {
    const fetchTravelHistory = async (page = 1) => {
      try {
        // Build the filters query dynamically based on the state
        const filterQuery = {
          page,
          limit: transactionsPerPage,
          search: searchQuery,
          driverName,
          date,
        };

        const response = await api.get('/admin/allTravelSummary', {
          params: filterQuery,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setActiveTravel(response.data.pagination.total);
        console.log("Response:", response.data);
        setTravelHistory(response.data.data);
      } catch (error) {
        console.error('Error fetching travel history:', error);
      }
    };

    fetchTravelHistory(currentPage);
  }, [currentPage, searchQuery, driverName, date]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'expired': return 'status-expired';
      case 'started': return 'status-started';
      case 'accepted': return 'status-accepted';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="card">
            <div className="card-title">Active</div>
            <div className="card-value">{activeTravel}</div>
          </div>
          <div className="card">
            <div className="card-title">Completed</div>
            <div className="card-value">{completedTravel}</div>
          </div>
          <div className="card">
            <div className="card-title">On Going</div>
            <div className="card-value">{activeTravel - completedTravel}</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-item">
              <label>Date</label>
              <div className="input-wrapper">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)} // Handle date change
                />
              </div>
            </div>
            <div className="filter-item">
              <label>Search</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Search by travel id"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // Handle search change
                />
                <div className="icon">
                  <Search size={20} />
                </div>
              </div>
            </div>
            <div className="filter-item">
              <label>Driver Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Driver Name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)} // Handle driver name change
                />
                <div className="icon">
                  <Search size={20} />
                </div>
              </div>
            </div>
          </div>
          {/* <button
            className="apply-button"
            onClick={() => setCurrentPage(1)} // Reset to page 1 when applying filters
          >
            Apply Filters
          </button> */}
        </div>

        {/* Load List */}
        <div className="searchBar">
            <div className="buttonWrapper">
              <div className="dropdownWrapper">
                <select
                  className="csvDropdown"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  <option value="CSV">CSV</option>
                  <option value="Excel">Excel</option>
                  <option value="PDF">PDF</option>
                </select>
                <span className="dropdownArrow">▼</span>
              </div>
              <button
                className="downloadButton"
                onClick={() => {
                  if (selectedFormat === 'CSV') exportTableToCSV('travel-table', travelHistory);
                  else if (selectedFormat === 'Excel') exportTableToExcel('travel-table', travelHistory);
                  else if (selectedFormat === 'PDF') exportTableToPDF('travel-table', travelHistory);
                }}
              >
                Download
              </button>
            </div>
          </div>
          
          


        <div className="table-container">
          <div className="table-wrapper">
            <table id="travel-table">
              <thead>
                <tr>
                  <th>Travel ID</th>
                  <th>Traveller</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Pick up</th>
                  <th>Drop</th>
                  <th>Distance</th>
                </tr>
              </thead>
              <tbody>
                {travelHistory.map((load) => (
                  <tr key={load._id}>
                    <td title={load._id}>{load.travelId}</td>
                    <td title={load.username}>{load.username}</td>
                    <td title={load.duration}>{load.duration}</td>
                    <td title={load.amount}>{load.expectedearning}</td>
                    <td>
                      <span className={getStatusClass(load.status)}>
                        {load.status}
                      </span>
                    </td>
                    <td title={load.Leavinglocation}>{load.Leavinglocation}</td>
                    <td title={load.Goinglocation}>{load.Goinglocation}</td>
                    <td>{load.distance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        </div>
        </div>

      </div>
    // </div>
  );
};

export default LogisticsDashboard;
