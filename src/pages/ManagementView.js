import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import api from "../Services/Api";
import "./Styles/ManagementCreate.css";

const ManagementUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const [status, setStatus] = useState({ message: "", type: "" }); // success / error

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await api.get(`/admin/${id}`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        const [firstName, ...lastParts] = res.data.name.split(" ");
        const lastName = lastParts.join(" ");

        setFormData({
          firstName: firstName || "",
          lastName: lastName || "",
          email: res.data.email,
          phoneNumber: res.data.phoneNumber || "",
          role: res.data.role,
        });
      } catch (err) {
        console.error("Failed to fetch admin data", err);
        setStatus({ message: "Failed to load admin data", type: "error" });
      }
    };

    fetchAdmin();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    navigate("/management");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      role: formData.role,
    };

    try {
      await api.put(`/admin/update/${id}`, updatedData, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setStatus({ message: "Admin updated successfully", type: "success" });
      setTimeout(() => navigate("/management"), 1500);
    } catch (error) {
      console.error("Update failed", error);
      setStatus({ message: "Failed to update admin", type: "error" });
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this admin?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setStatus({ message: "Admin deleted successfully", type: "success" });
      setTimeout(() => navigate("/management"), 1500);
    } catch (error) {
      console.error("Error deleting admin:", error);
      setStatus({ message: "Failed to delete admin", type: "error" });
    }
  };

  // Auto-clear status messages
  useEffect(() => {
    if (status.message) {
      const timeout = setTimeout(() => setStatus({ message: "", type: "" }), 3000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-wrapper">
        <Header />
        <div className="form-container">
          <div className="form-wrapper">
            <h2>Update Admin Role</h2>
            <p>Update administrator role, permissions, and contact info.</p>

            {/* Status message */}
            {status.message && (
              <div
                style={{
                  padding: "10px",
                  marginBottom: "15px",
                  borderRadius: "4px",
                  color: status.type === "success" ? "#155724" : "#721c24",
                  backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
                  border: `1px solid ${status.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
                }}
              >
                {status.message}
              </div>
            )}

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
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                      />
                    </div>
                    <div className="input-field">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                  <div className="input-field full-width">
                    <label>Select Role</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                      <option value="">Select Role</option>
                      <option value="superadmin">Super Admin</option>
                      <option value="support">Support</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="button-group">
                <button type="button" onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                >
                  Delete Admin
                </button>
                <button type="submit" className="create-button">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementUpdate;
