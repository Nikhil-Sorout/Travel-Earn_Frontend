import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "./Header";
import styles from './Styles/Management.module.css';
import Api from '../Services/Api';

const Management = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(()=>{
    const delayDebounce = setTimeout(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      try{
        const response = await Api.get((`/admin/getAllAdmins?search=${searchQuery}`),{
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        } );
        console.log(response.data);
        setAdmins(response.data.admins);
      }
      catch(error){
        console.error("Error fetching admins:", error);
      }
      finally {
        setLoading(false); // 👈 end loading
      }
    }
    fetchAdmins();
  }
    , 400); // Delay in ms
    return () => clearTimeout(delayDebounce);
  },[searchQuery]);

  const handleAddNewClick = () => {
    navigate("/management-create");
  };

  const handleViewClick = (adminId) => {
    navigate(`/management-view/${adminId}`); // Pass the admin ID in the URL
  };

  return (
    <div className={styles.mainContainer}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <Header onSearch={setSearchQuery} />
        <div className={styles.userDetailsContent}>
          <div className={styles.searchBar}>
            <div className={styles.buttonWrapper}>
              <div className={styles.dropdownWrapper}>
                <select className={styles.csvDropdown}>
                  <option><b>CSV</b></option>
                </select>
                <span className={styles.dropdownArrow}>▼</span>
              </div>
              <button className={styles.downloadButton}>Download</button>
              <button className={styles.addNewButton} onClick={handleAddNewClick}>
                Add New
              </button>
            </div>
          </div>

          {loading ? (
            <div className={styles.loader}>Loading...</div> // 👈 loader placeholder
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableTh}>Admin Name</th>
                  <th className={styles.tableTh}>Role</th>
                  <th className={styles.tableTh}>Phone Number</th>
                  <th className={styles.tableTh}>Email</th>
                  <th className={styles.tableTh}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id} className={styles.tableTr}>
                    <td className={styles.tableTd}>{admin.name}</td>
                    <td className={styles.tableTd}>{admin.role}</td>
                    <td className={styles.tableTd}>{admin.phoneNumber}</td>
                    <td className={styles.tableTd}>{admin.email}</td>
                    <td className={styles.tableTd}>
                      <span
                        className={styles.viewIcon}
                        onClick={() => handleViewClick(admin._id)}
                      >
                        View
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Management;
