// Dashboard.js
import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import styles from "./Styles/Dashboard.module.css"; // <-- updated import
import api from '../Services/Api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");


  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const fetchStats = async () => {
        // console.log(localStorage.getItem('token'))
        try {
          const [statsRes, usersRes, totalEarningsRes, transactionRes] = await Promise.all([
            api.get("/admin/getDashboardStats", config),
            api.get("/admin/getTotalUsers", config),
            api.get("/admin/getTotalEarnings", config),
            api.get(`/admin/getTransactionHistory?page=${currentPage}&limit=${transactionsPerPage}&search=${searchQuery}`, config)
          ]);

          setTotalTransactions(transactionRes.data.total);
          setStats(statsRes.data);
          setTotalUsers(usersRes.data);
          setTotalEarnings(totalEarningsRes.data);
          setTransactionHistory(transactionRes.data.data);
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }
      };

      fetchStats();
    }, 40); // Delay in ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentPage]);

  const {
    totalTravel = 0,
    totalRequests = 0,
    totalAccepted = 0,
    totalCancelled = 0,
    totalDelivered = 0,
    totalConsignments = 0,
    daily = {},
    monthly = {}
  } = stats ?? {};

  const allCards = [
    { title: "Total Travel", value: totalTravel },
    { title: "Total Requests", value: totalRequests },
    { title: "Accepted Requests", value: totalAccepted },
    { title: "Cancelled Requests", value: totalCancelled },
    { title: "Delivered", value: totalDelivered },
    { title: "Total Consignments", value: totalConsignments },
    { title: "Daily Requests", value: daily.totalRequests ?? 0 },
    { title: "Daily Accepted", value: daily.accepted ?? 0 },
    { title: "Daily Cancelled", value: daily.cancelled ?? 0 },
    { title: "Daily Delivered", value: daily.delivered ?? 0 },
    { title: "Daily Consignments", value: daily.totalConsignments ?? 0 },
    { title: "Daily Travel", value: daily.totalTravel ?? 0 },
    { title: "Monthly Requests", value: monthly.totalRequests ?? 0 },
    { title: "Monthly Accepted", value: monthly.accepted ?? 0 },
    { title: "Monthly Cancelled", value: monthly.cancelled ?? 0 },
    { title: "Monthly Delivered", value: monthly.delivered ?? 0 },
    { title: "Monthly Consignments", value: monthly.totalConsignments ?? 0 },
    { title: "Monthly Travel", value: monthly.totalTravel ?? 0 },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <div className={styles.dashboardContent}>
        <Header onSearch={setSearchQuery} />

        <div className={styles.topSection}>
          <div className={styles.card}>
            <h3>Total Users</h3>
            <p>{totalUsers.total}</p>
          </div>
          <div className={styles.card}>
            <h3>Total Earnings</h3>
            <p>{totalEarnings?.totalEarnings?.toFixed(2)}</p>
          </div>
          {allCards.map((card, idx) => (
            <div className={styles.card} key={idx}>
              <h3>{card.title}</h3>
              <p>{card.value ?? 0}</p>
            </div>
          ))}
        </div>

        <div className={styles.transactionSection}>
          <h3>Recent Transactions</h3>
          <div className={styles.transactions}>
            <div className={styles.transactionHeader}>
              <p><strong>Customer Name</strong></p>
              <p><strong>Transaction ID</strong></p>
              <p><strong>Payment Mode</strong></p>
              <p><strong>Amount</strong></p>
            </div>
            {transactionHistory.map((transaction, index) => (
              <div key={index} className={styles.transactionItem}>
                <p>{transaction.customerName}</p>
                <p>{transaction.transactionId}</p>
                <p>{transaction.paymentMode}</p>
                <p>{transaction.amount}</p>
              </div>
            ))}
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Dashboard;
