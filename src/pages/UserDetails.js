import React, { useState } from "react";
import Sidebar from "../Components/Sidebar"; // Make sure the path is correct
// import "./Styles/UserDetails.css"; // Assuming this is the CSS for UserDetails

const UserDetails = () => {
  const [users] = useState([
    { id: 1, name: "Andrew Bojangles", phone: "+79000010101", email: "indra@gmail.com", activity: "Today" },
    { id: 2, name: "Andrew Bojangles", phone: "+79000010101", email: "indra@gmail.com", activity: "Yesterday" },
    { id: 3, name: "Andrew Bojangles", phone: "+79000010101", email: "indra@gmail.com", activity: "Active" },
    { id: 4, name: "Andrew Bojangles", phone: "+79000010101", email: "indra@gmail.com", activity: "Active" },
    { id: 5, name: "Andrew Bojangles", phone: "+79000010101", email: "indra@gmail.com", activity: "3 days ago" },
    // Add more users as needed
  ]);

  return (
    <div className="main-container">
      <Sidebar />
      <div className="user-details-content">
        <div className="search-bar">
          <input type="text" placeholder="Search" />
          <button className="search-button">Search</button>
          <button className="download-button">Download</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone number</th>
              <th>Email</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}. {user.name}</td>
                <td>{user.phone}</td>
                <td>{user.email}</td>
                <td className={user.activity.toLowerCase().includes("active") ? "active" : ""}>{user.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button className="pagination-button">«</button>
          <button className="pagination-button active">1</button>
          <button className="pagination-button">2</button>
          <button className="pagination-button">3</button>
          <button className="pagination-button">4</button>
          <button className="pagination-button">5</button>
          <button className="pagination-button">»</button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
