import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import "./Styles/DriverManagement.css";

const DriverManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [drivers] = useState([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      license: "CLD-A 123456",
      licenseExp: "12/2024",
      status: "Active",
      payRate: "$0.55/mile",
      distance: "40 km",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarahj@example.com",
      license: "CLD-A 123456",
      licenseExp: "06/2025",
      status: "Active",
      payRate: "$25/hour",
      distance: "35 km",
    },
    {
      id: 3,
      name: "Sarah Ani",
      email: "sarahj@example.com",
      license: "CLD-A 123456",
      licenseExp: "09/2025",
      status: "Active",
      payRate: "$25/hour",
      distance: "70 km",
    },
    {
      id: 4,
      name: "Pritam Johnson",
      email: "pritamj@example.com",
      license: "CLD-A 123456",
      licenseExp: "10/2026",
      status: "Active",
      payRate: "$25/hour",
      distance: "90 km",
    },
    {
      id: 5,
      name: "Rahul Smith",
      email: "rahulj@example.com",
      license: "CLD-A 123456",
      licenseExp: "05/2025",
      status: "Inactive",
      payRate: "$25/hour",
      distance: "60 km",
    },
    {
      id: 6,
      name: "Arpan Johnson",
      email: "arpan@example.com",
      license: "CLD-A 123456",
      licenseExp: "02/2026",
      status: "Active",
      payRate: "$25/hour",
      distance: "50 km",
    },
  ]);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="user-details-content">
        <Header onSearch={setSearchQuery} />
        <div
          className="top-section"
          style={{ width: "20%", marginTop: 5, marginLeft: 5 }}
        >
          <div className="card">
            <h3>Total Driver</h3>
            <p>32,875</p>
          </div>
        </div>

        {/* Top Buttons */}
        <div className="search-bar">
          <div className="button-wrapper">
            <div className="dropdown-wrapper">
              <select className="csv-dropdown">
                <option>
                  <b>CSV</b>
                </option>
                <option>Excel</option>
                <option>PDF</option>
              </select>
              <span className="dropdown-arrow">▼</span>
            </div>
            <button className="add-driver-button">Add Driver</button>
            <button className="download-button">Download</button>
            <button className="apply-button">Apply Filters</button>
          </div>
        </div>

        {/* Filter Section and Table wrapped in Fieldset */}
        <fieldset className="custom-fieldset">
          <div className="filter-bar">
            <div className="legend-like search-box-wrapper">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search Drivers..."
                  className="search-driver-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
            <div className="legend-like dropdown-wrapper">
              <select className="filter-dropdown">
                <option>All Categories</option>
                <option>Car</option>
                <option>Bike</option>
              </select>
            </div>
            <div className="legend-like dropdown-wrapper">
              <select className="filter-dropdown">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="legend-like dropdown-wrapper">
              <select className="filter-dropdown">
                <option>Experience Level</option>
                <option>1+ Year</option>
                <option>3+ Years</option>
                <option>5+ Years</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <table>
            <thead>
              <tr>
                <th>Driver</th>
                <th>License</th>
                <th>Status</th>
                <th>Pay Rate</th>
                <th>Distance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    {driver.name}
                    <br />
                    <small>{driver.email}</small>
                  </td>
                  <td>
                    {driver.license}
                    <br />
                    <small>Exp: {driver.licenseExp}</small>
                  </td>
                  <td>
                    <span
                      className={`status ${
                        driver.status.toLowerCase() === "active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {driver.status}
                    </span>
                  </td>
                  <td>{driver.payRate}</td>
                  <td>{driver.distance}</td>
                  <td>
                    <span className="edit-icon">✎</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </fieldset>

        {/* Pagination */}
        <div className="pagination">
          <span>Showing 6 out of 20 results</span>
          <div className="pagination-buttons">
            <button className="pagination-button">«</button>
            <button className="pagination-button active">1</button>
            <button className="pagination-button">2</button>
            <button className="pagination-button">3</button>
            <button className="pagination-button">»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverManagement;
