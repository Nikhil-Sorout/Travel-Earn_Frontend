import React, { useState } from "react";
import "./Styles/Support.css";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tickets] = useState([
    {
      id: 1234,
      title: "Payment Integration Issue",
      priority: "High",
      time: "2h ago",
      company: "Tech Corp Inc.",
      description:
        "Unable to process payments through the new gateway implementation. Requires immediate attention.",
      reply: "",
      status: "Open",
    },
    {
      id: 1235,
      title: "Dashboard Loading Slow",
      priority: "Medium",
      time: "4h ago",
      company: "Global Solutions Ltd.",
      description:
        "Dashboard performance issues reported across multiple regions.",
      reply: "",
      status: "Open",
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [replyText, setReplyText] = useState("");
  const [filter, setFilter] = useState("Open");

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText("");
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
  };

  const handleMarkAsResolved = () => {
    // console.log("Marked as resolved:", selectedTicket.id);
    // Logic to update ticket status
  };

  const handleSendReply = () => {
    // console.log("Reply sent:", {
    //   ticketId: selectedTicket.id,
    //   reply: replyText,
    // });
    setReplyText("");
  };

  return (
    <div className="main-container">
      <Sidebar />
      <div className="content-wrapper">
        <Header onSearch={setSearchQuery} />
        <div className="support-content">
          <div className="ticket-filters">
            <h2>Support Tickets</h2>
            <div className="filter-buttons">
              <span
                className={filter === "Open" ? "active" : ""}
                onClick={() => setFilter("Open")}
              >
                Open (14)
              </span>
              <span
                className={filter === "Pending" ? "active" : ""}
                onClick={() => setFilter("Pending")}
              >
                Pending (23)
              </span>
              <span
                className={filter === "Resolved" ? "active" : ""}
                onClick={() => setFilter("Resolved")}
              >
                Resolved (58)
              </span>
            </div>
            <div className="search-bar">
              <input type="text" placeholder="Search Ticket id..." />
            </div>
          </div>
          <div className="ticket-section">
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`ticket-item ${
                    selectedTicket.id === ticket.id ? "selected" : ""
                  }`}
                  onClick={() => handleTicketClick(ticket)}
                >
                  <span className={`priority ${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                  <span className="time">{ticket.time}</span>
                  <div className="ticket-details">
                    <h3>
                      #{ticket.id} - {ticket.title}
                    </h3>
                    <p>{ticket.description}</p>
                    <span className="company">{ticket.company}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ticket-details-panel">
              <h3>{selectedTicket.title}</h3>
              <p>
                Ticket #{selectedTicket.id}, Opened {selectedTicket.time} by{" "}
                {selectedTicket.company}.
              </p>
              <button style={{ height: 40, width: 200 }}>
                ✔ Mark as Resolved
              </button>
              <div className="message-section">
                <div className="message">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="User"
                    className="user-image"
                  />
                  <div className="message-content">
                    <p>
                      <strong>John Smith, Tech Corp Inc.</strong>
                      <br />
                      We're experiencing issues with the payment gateway
                      integration. Transactions are failing and customers are
                      unable to complete purchases. This is causing significant
                      revenue loss. Please help resolve this ASAP.
                    </p>
                  </div>
                </div>
                <div className="message">
                  <img
                    src="https://via.placeholder.com/40"
                    alt="Support"
                    className="user-image"
                  />
                  <div className="message-content">
                    <p>
                      <strong>Sarah Johnson, Support Team</strong>
                      <br />
                      I'm looking into this issue now. Could you please provide
                      the following information: 1. Error messages received 2.
                      Transaction IDs of failed payments 3. Browser and device
                      details
                    </p>
                  </div>
                </div>
                <div className="reply-section">
                  <textarea
                    value={replyText}
                    onChange={handleReplyChange}
                    placeholder="Type your reply..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
