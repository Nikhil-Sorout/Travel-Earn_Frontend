import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";

// Pages
import Dashboard from "./pages/Dashboard";
import DriverDetails from "./pages/DriverDetails";
import DriverManagement from "./pages/DriverManagement";
import Header from "./pages/Header";
import LoginPage from "./pages/Login";
import LogisticsDashboard from "./pages/LogisticsDashboard"; // ✅ Fixed import name
import Management from "./pages/Management";
import ManagementCreate from "./pages/ManagementCreate";
import ManagementView from "./pages/ManagementView";
import Payments from "./pages/Payments";
import Support from "./pages/Support";
import UserDetails from "./pages/UserDetails";
import UserManagement from "./pages/UserManagement";
import PriceControl from "./pages/PriceControl";
import ForgotPassword from "./pages/ForgotPassword";
import TravelerReport from "./pages/TravelerReport";
import SenderReport from "./pages/SenderReport";
import Reports from "./pages/Reports";
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/header" element={<Header />} />
        <Route path="/driver-management" element={<DriverManagement />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/management" element={<Management />} />
        <Route path="/user-details" element={<UserDetails />} />
        <Route path="/driver-details" element={<DriverDetails />} />
        <Route path="/management-create" element={<ManagementCreate />} />
        <Route path="/management-view/:id" element={<ManagementView />} />
        <Route path="/logistics-dashboard" element={<LogisticsDashboard />} />
        <Route path="/priceControl" element={<PriceControl />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        {/* Added Support if needed */}
        <Route path="/support" element={<Support />} />
        
        {/* Report Routes */}
        <Route path="/traveler-report" element={<TravelerReport />} />
        <Route path="/sender-report" element={<SenderReport />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  );
}

export default App;
