import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import styles from "./Styles/SalesDashboard.module.css";
import Api from "../Services/Api";
import {
  exportTableToExcel,
  exportTableToPDF,
  exportTableToCSV,
} from "./Utils/download";

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState("CSV");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [periodType, setPeriodType] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalType, setModalType] = useState("");

  // Handler for period type change - clear date inputs when period is selected
  const handlePeriodChange = (value) => {
    setPeriodType(value);
    if (value) {
      setFromDate("");
      setToDate("");
    }
  };

  // Handler for date changes - clear period type when dates are selected
  const handleFromDateChange = (value) => {
    setFromDate(value);
    if (value) {
      setPeriodType("");
    }
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    if (value) {
      setPeriodType("");
    }
  };

  // Handle region breakdown modal
  const handleRegionClick = async (transactionType) => {
    setShowModal(true);
    setModalLoading(true);
    setModalType(transactionType);
    setModalData([]);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("type", transactionType);
      
      // Apply the same filters as the main dashboard
      if (fromDate) queryParams.append("fromDate", fromDate);
      if (toDate) queryParams.append("toDate", toDate);
      if (periodType) queryParams.append("periodType", periodType);

      const res = await Api.get(`admin/get-region-breakdown?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setModalData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching region breakdown:", err);
      setModalData([]);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData([]);
    setModalType("");
  };

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.append("fromDate", fromDate);
        if (toDate) queryParams.append("toDate", toDate);
        if (periodType) queryParams.append("periodType", periodType);

        const res = await Api.get(
          `admin/sales-dashboard?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setSalesData(res.data.data || []);
      } catch (err) {
        console.error("Error fetching sales dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [fromDate, toDate, periodType]);

  return (
    <div className={styles.mainContainer}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <Header />

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <h3 className={styles.filtersTitle}>Filter Sales Data</h3>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                className={styles.dateInput}
                disabled={!!periodType}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                className={styles.dateInput}
                disabled={!!periodType}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Period</label>
              <select
                value={periodType}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className={styles.periodSelect}
                disabled={!!fromDate || !!toDate}
              >
                <option value="">Custom Date Range</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Export Section */}
            <div className={styles.exportSection}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Export Format</label>
                <select
                  className={styles.exportDropdown}
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                >
                  <option value="CSV">CSV</option>
                  <option value="Excel">Excel</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>&nbsp;</label>
                <button
                  className={styles.downloadButton}
                  onClick={() => {
                    if (selectedFormat === "CSV")
                      exportTableToCSV("sales-table", salesData);
                    else if (selectedFormat === "Excel")
                      exportTableToExcel("sales-table", salesData);
                    else if (selectedFormat === "PDF")
                      exportTableToPDF("sales-table", salesData);
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>Sales Dashboard Data</div>

          {loading ? (
            <div className={styles.loader}>Loading...</div>
          ) : salesData.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateText}>No sales data found</div>
              <div className={styles.emptyStateSubtext}>
                Try adjusting your date range or period filter
              </div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table id="sales-table" className={styles.table}>
                <thead>
                  <tr>
                    <th>Total No</th>
                    <th>Transaction Type</th>
                    <th>Amount</th>
                    <th>Region</th>
                    <th>Mode of Travel</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.totalNo}</td>
                      <td>{row.transactionType}</td>
                      <td>Rs {row.amount}</td>
                      <td>
                        <button 
                          className={styles.regionButton}
                          onClick={() => handleRegionClick(row.transactionType)}
                        >
                          Click Here
                        </button>
                      </td>
                      <td>Train / Air / Bus</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* T&E Overall Revenue */}
              {salesData.length >= 2 && (
                <div className={styles.revenueSection}>
                  <div className={styles.revenueLabel}>
                    T&E Overall Revenue:
                  </div>
                  <div className={styles.revenueAmount}>
                    Rs{" "}
                    {(salesData[0]?.amount - salesData[1]?.amount).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal for Region Breakdown */}
        {showModal && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Region Breakdown - {modalType}</h3>
                <button className={styles.closeButton} onClick={closeModal}>
                  ×
                </button>
              </div>
              
              <div className={styles.modalBody}>
                {modalLoading ? (
                  <div className={styles.modalLoader}>Loading region data...</div>
                ) : modalData.length === 0 ? (
                  <div className={styles.modalEmpty}>No region data found</div>
                ) : (
                  <div className={styles.modalTableWrapper}>
                    <table className={styles.modalTable}>
                      <thead>
                        <tr>
                          <th>Region</th>
                          <th>Total Amount</th>
                          {modalType === "Traveller" && <th>Mode of Travel</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {modalData.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.stateWise}</td>
                            <td>Rs {item.totalAmount}</td>
                            {modalType === "Traveller" && <td>{item.modeOfTravel}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
