import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import styles from "./Styles/Header.module.css";
import { useNavigate } from "react-router-dom";

const Header = ({ onSearch = () => {} }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminDetails, setAdminDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("admin");
    if (admin) {
      setAdminDetails(JSON.parse(admin));
    }
  }, []);
  // console.log(adminDetails, "adminDetails");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/");
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.userIcon}>
          <div>
            <h4>Welcome, {adminDetails?.name}</h4>
            <p>Today is {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
        </div>
        <div className={styles.userSection}>
          <FaUserCircle size={40} color="#4a90e2" onClick={toggleDropdown} />
          <p>{adminDetails?.name}</p>
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <p onClick={() => setShowProfileModal(true)}>Profile</p>
              <p onClick={handleLogout}>Logout</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showProfileModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>User Profile</h3>
            <p><strong>Name:</strong> {adminDetails?.name}</p>
            <p><strong>Email:</strong> {adminDetails?.email}</p>
            <p><strong>Role:</strong> {adminDetails?.role}</p>
            <p><strong>Phone Number:</strong> {adminDetails?.phoneNumber}</p>
            {/* Add more fields if needed */}
            <button onClick={() => setShowProfileModal(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
