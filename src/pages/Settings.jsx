import React, { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Mail, 
  Shield, 
  User, 
  Phone,
  Eye,
  EyeOff
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import axios from "axios";

function Settings() {
  const { user, token, showAlert, API_BASE } = useStore();
  
  // Notification States
  const [pref, setPref] = useState({
    emailAlerts: true,
    bookingReminders: true,
    reviewNotifs: true,
    marketingEmails: false
  });

  // Password States
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passLoading, setPassLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handlePrefChange = (name) => {
    setPref(prev => ({ ...prev, [name]: !prev[name] }));
    showAlert("success", "Preferences updated locally.");
  };

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPassData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      showAlert("danger", "New password and confirmation do not match.");
      return;
    }
    if (passData.newPassword.length < 6) {
      showAlert("danger", "Password must be at least 6 characters long.");
      return;
    }

    setPassLoading(true);
    try {
      const res = await axios.put(
        `${API_BASE}/auth/change-password`,
        {
          currentPassword: passData.currentPassword,
          newPassword: passData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showAlert("success", "Password successfully changed!");
        setPassData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password. Please verify current password.";
      showAlert("danger", msg);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title">
        <h1>Console Settings</h1>
        <p>Manage account security passwords, contact email reminders, and dashboard preferences.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        
        {/* Left Side: General Profile & Notification Toggles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Manager Account Info */}
          <div className="section-panel" style={{ margin: 0, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <User size={20} style={{ color: "var(--primary)" }} />
              Manager Account
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={user?.fullName || ""} 
                  disabled 
                  style={{ opacity: 0.8 }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                  <input 
                    type="email" 
                    className="input-field" 
                    style={{ paddingLeft: 42 }}
                    value={user?.email || ""} 
                    disabled 
                    style={{ opacity: 0.8, paddingLeft: 42 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: 42 }}
                    value={user?.phone || "N/A"} 
                    disabled 
                    style={{ opacity: 0.8, paddingLeft: 42 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Toggles */}
          <div className="section-panel" style={{ margin: 0, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <Bell size={20} style={{ color: "var(--primary)" }} />
              Email & Push Notices
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { key: "emailAlerts", label: "Email Alerts", desc: "Receive summary reports on incoming reservations." },
                { key: "bookingReminders", label: "Booking Reminders", desc: "Get notifications when booking status is updated." },
                { key: "reviewNotifs", label: "New Review Alerts", desc: "Notify me when customers leave store feedback." },
                { key: "marketingEmails", label: "Monthly Newsletters", desc: "Receive business tip newsletters and promo announcements." }
              ].map((item) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", display: "block" }}>{item.label}</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{item.desc}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={pref[item.key]}
                    onChange={() => handlePrefChange(item.key)}
                    style={{ width: 42, height: 20, cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Change Password security panel */}
        <div className="section-panel" style={{ margin: 0, padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
            <Lock size={20} style={{ color: "var(--primary)" }} />
            Security & Password Change
          </h3>

          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Password</label>
              <div style={{ position: "relative" }}>
                <input 
                  type={showPass ? "text" : "password"} 
                  name="currentPassword"
                  className="input-field" 
                  value={passData.currentPassword}
                  onChange={handlePassChange}
                  required
                />
                <button 
                  type="button"
                  style={{ position: "absolute", right: 14, top: 14, background: "transparent", border: "none", color: "var(--text-tertiary)", cursor: "pointer" }}
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password</label>
              <input 
                type="password" 
                name="newPassword"
                className="input-field" 
                value={passData.newPassword}
                onChange={handlePassChange}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className="input-field" 
                value={passData.confirmPassword}
                onChange={handlePassChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, fontSize: 15 }}
              disabled={passLoading}
            >
              <Shield size={18} />
              {passLoading ? "Updating security password..." : "Confirm Password Update"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Settings;
