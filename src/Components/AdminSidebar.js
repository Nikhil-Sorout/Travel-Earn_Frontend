import React from "react";
import {
  FaMoneyBillWave,
  FaUserCog,
  FaChartLine,
  FaCogs,
  FaSignOutAlt
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import styles from "../pages/Styles/Sidebar.module.css"; // Import CSS module

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <div className={styles.logo}>Admin Panel</div>
      </div>
      <ul className={styles.sidebarMenu}>
        <li className={styles.sidebarMenuItem}>
          <Link
            to="/admin/priceControl"
            className={`${styles.sidebarLink} ${
              location.pathname === "/admin/priceControl" ? styles.sidebarLinkActive : ""
            }`}
          >
            <FaMoneyBillWave className={styles.sidebarIcon} /> Pricing Control
          </Link>
        </li>
        <li className={styles.sidebarMenuItem}>
          <Link
            to="/admin/userManagement"
            className={`${styles.sidebarLink} ${
              location.pathname === "/admin/userManagement" ? styles.sidebarLinkActive : ""
            }`}
          >
            <FaUserCog className={styles.sidebarIcon} /> User Management
          </Link>
        </li>
        <li className={styles.sidebarMenuItem}>
          <Link
            to="/admin/roleManagement"
            className={`${styles.sidebarLink} ${
              location.pathname === "/admin/roleManagement" ? styles.sidebarLinkActive : ""
            }`}
          >
            <FaChartLine className={styles.sidebarIcon} /> Role Management
          </Link>
        </li>
        <li className={styles.sidebarMenuItem}>
          <Link
            to="/admin/settings"
            className={`${styles.sidebarLink} ${
              location.pathname === "/admin/settings" ? styles.sidebarLinkActive : ""
            }`}
          >
            <FaCogs className={styles.sidebarIcon} /> Settings
          </Link>
        </li>
        <li className={styles.sidebarMenuItem}>
          <Link
            to="/logout"
            className={`${styles.sidebarLink} ${
              location.pathname === "/logout" ? styles.sidebarLinkActive : ""
            }`}
          >
            <FaSignOutAlt className={styles.sidebarIcon} /> Logout
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
