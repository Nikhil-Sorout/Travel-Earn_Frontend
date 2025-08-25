import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import "./Styles/ManagementCreate.css";
import api from "../Services/Api"

const ManagementCreate = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber:"",
    confirmPassword: "",
    role: "",
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, phoneNumber, confirmPassword, role } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !role || !phoneNumber) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Adjust according to your auth storage
      const response = await api.post(`/admin/signup`, // Replace with your endpoint
        {
          name: `${firstName} ${lastName}`,
          email,
          password,
          phoneNumber,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setError("");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        confirmPassword: "",
        role: "",
      });

      setTimeout(() => navigate("/management"), 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admin.");
      setMessage("");
    }
  };

  const handleCancel = () => {
    navigate("/management"); // Navigate back to /management on cancel
  };

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-wrapper">
        <Header onSearch={setSearchQuery} />
        <div className="form-container">
          <div className="form-wrapper">
            <h2>Create New Admin Role</h2>
            <p>
              Configure new administrator role with specific permissions and
              access levels
            </p>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="user-info">
                <h3>User Information</h3>
                <div className="form-group">
                  <div className="input-pair">
                    <div className="input-field">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                      />
                    </div>
                    <div className="input-field">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  <div className="input-pair">
                    <div className="input-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="input-field">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>
                  <div className="input-pair">
                    <div className="input-field">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                      />
                    </div>
                    <div className="input-field">
                      <label>Phone Number</label>
                      <input
                        type="phone"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                    <div className="input-field">
                      <label>Select Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="">Select Role</option>
                        <option value="superadmin">Super Admin</option>
                      <option value="support">Support</option>
                      <option value="manager">Manager</option>
                      </select>
                    </div>
                </div>
              </div>
              <div className="button-group">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="create-button">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementCreate;
