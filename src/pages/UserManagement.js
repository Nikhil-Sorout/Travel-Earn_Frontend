import React, { useEffect, useState } from 'react';
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import styles from "./Styles/UserDetails.module.css";
import api from '../Services/Api';
import {
  exportTableToExcel,
  exportTableToPDF,
  exportTableToCSV,
} from './Utils/download';


const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserPhone, setSelectedUserPhone] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedFormat, setSelectedFormat] = useState('CSV');


  const [searchQuery, setSearchQuery] = useState("");


  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const totalPages = Math.ceil(totalUsers / transactionsPerPage);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const fetchDrivers = async () => {
        setLoading(true);
        try {
          const response = await api.get(`/t/getUserTravelDetails?page=${currentPage}&limit=${transactionsPerPage}&search=${searchQuery}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setDrivers(response.data.data);
          setTotalUsers(response.data.totalCount);
        } catch (error) {
          console.error('Error fetching drivers:', error);
        
        } finally { 
          setLoading(false); // 👈 end loading
        }
      };

      fetchDrivers(currentPage);
    }, 400); // Delay in ms
    return () => clearTimeout(delayDebounce);
  }, [currentPage, drivers.length, searchQuery]);

  useEffect(() => {
    if (isModalOpen && selectedUserPhone) {
      const fetchUser = async () => {
        try {
          const response = await api.get(`/t/travelhistory/${selectedUserPhone}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          });
          setSelectedUser(response.data);
          // console.log(response.data);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      };

      fetchUser();
    }
  }, [isModalOpen, selectedUserPhone]);

  const handleDeleteClick = (user) => {
    setDriverDetails(user);
    console.log("Driver Details: ", driverDetails);
    setSelectedUserPhone(user.phoneNumber);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await api.delete(`/editp/delete/${driverDetails?.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      console.log("Delete Response: ", response.data);
      setDrivers(drivers.filter((driver) => driver._id !== driverDetails._id));
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className={styles.mainContainer}>
      <Sidebar />
      <div className={styles.userDetailsContent}>
        <Header onSearch={setSearchQuery} />

        {/* Top Section */}
        <div className={styles.topSection}>
          <div className={styles.card}>
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
        </div>

        {/* Export Options */}
        <div className={styles.searchBar}>
          <div className={styles.buttonWrapper}>
            <div className={styles.dropdownWrapper}>
              <select
                className={styles.csvDropdown}
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <option value="CSV">CSV</option>
                <option value="Excel">Excel</option>
                <option value="PDF">PDF</option>
              </select>
              <span className={styles.dropdownArrow}>▼</span>
            </div>
            <button
              className={styles.downloadButton}
              onClick={() => {
                if (selectedFormat === 'CSV') exportTableToCSV('driver-table', drivers);
                else if (selectedFormat === 'Excel') exportTableToExcel('driver-table',drivers);
                else if (selectedFormat === 'PDF') exportTableToPDF('driver-tabel',drivers);
              }}
            >
              Download
            </button>
          </div>
        </div>

        {/* Driver Table */}
        {loading ? (
                    <div className={styles.loader}>Loading...</div> // 👈 loader placeholder
                  ) :(
        <table id="driver-table" className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Phone Number</th>
              <th>Earning</th>
              <th>Distance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers?.map((driver) => (
              <tr key={driver._id} className={styles.tableTr}>
                <td>
                  {driver.firstName || driver.username} {driver.lastName || ""}
                  <br />
                  <small>{driver.email}</small>
                </td>
                <td>{driver.phoneNumber}</td>
                <td>₹ {Number(driver.totalEarnings || 0).toFixed(2)}</td>
                <td>{driver.totalDistance.toFixed(2) || 0} km</td>
                <td>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleDeleteClick(driver)}
                  >
                    <span className={styles.editIcon}>✎</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                  )}

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationButtons}>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              «
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.paginationButtonActive : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              »
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {isModalOpen && selectedUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Driver Details</h3>
              <div className={styles.driverInfo}>
                <p><strong>Name:</strong> {driverDetails.username}</p>
                <p><strong>Email:</strong> {driverDetails.email}</p>
                <p><strong>Phone:</strong> {driverDetails.phoneNumber}</p>
                <p><strong>Total Earnings:</strong> ₹ {Number(driverDetails.totalEarnings.toFixed(2) || 0).toFixed(2)}</p>
                <p><strong>Total Distance:</strong> {driverDetails.totalDistance.toFixed(2) || 0} km</p>
              </div>

              <h3 className={styles.travelHistoryHeader}>Travel History ({selectedUser?.travels?.length})</h3>
              <div className={styles.travelHistory}>
                {selectedUser?.travels && selectedUser?.travels?.length > 0 ? (
                  selectedUser.travels.map((travel) => (
                    <div key={travel._id} className={styles.travelCard}>
                      <div className={styles.travelHeader}>
                        <span className={styles.travelId}>Trip ID: {travel.travelId}</span>
                        <span className={`${styles.status} ${travel.status === 'ENDED' ? styles.ended : styles.started}`}>
                          {travel.status}
                        </span>
                      </div>
                      <div className={styles.travelDetails}>
                        <p><strong>From:</strong> {travel.pickup}</p>
                        <p><strong>To:</strong> {travel.drop}</p>
                        <p><strong>Vehicle:</strong> {travel.travelMode} ({travel.travelmode_number})</p>
                        <p><strong>Scheduled:</strong> {new Date(travel.expectedStartTime).toLocaleString()} - {new Date(travel.expectedendtime).toLocaleString()}</p>
                        <p><strong>Consignments:</strong> {travel.consignmentCount}</p>
                      </div>
                      {travel.consignmentDetails && travel.consignmentDetails.length > 0 && (
                        <div className={styles.consignments}>
                          <h4>Consignment Details:</h4>
                          {travel.consignmentDetails.map((consignment, index) => (
                            <div key={index} className={styles.consignment}>
                              <p><strong>ID:</strong> {consignment.consignmentId}</p>
                              <p><strong>Status:</strong> {consignment.status}</p>
                              <p><strong>Weight:</strong> {consignment.weight} kg</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className={styles.noTravels}>No travel history found</p>
                )}
              </div>

              <div className={styles.modalActions}>
                <button className={styles.confirmButton} onClick={handleDeleteConfirm}>
                  Delete Driver
                </button>
                <button className={styles.cancelButton} onClick={handleModalClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DriverManagement;
