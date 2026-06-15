import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  LogOut, 
  Store, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings, 
  AlertCircle, 
  Search, 
  Sparkles, 
  Phone, 
  MapPin, 
  Activity, 
  ShieldAlert,
  Loader2,
  Check,
  FileText,
  Eye,
  X
} from "lucide-react";

const BACKEND_URL = "https://paw-connect-store.vercel.app";
const API_BASE = `${BACKEND_URL}/api/v1`;

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("bookings");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  
  // Form / loading / error states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Auto-close alert after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Auto-login on mount for dev environment if token is not present
  useEffect(() => {
    const autoLogin = async () => {
      if (!token) {
        setDataLoading(true);
        try {
          const res = await axios.get(`${API_BASE}/auth/dev-token`);
          if (res.data.success && res.data.data?.accessToken) {
            const { accessToken } = res.data.data;
            localStorage.setItem("token", accessToken);
            setToken(accessToken);
          }
        } catch (err) {
          console.error("Failed to automatically acquire dev token:", err);
        } finally {
          setDataLoading(false);
        }
      }
    };
    autoLogin();
  }, []);

  // Load profile and data if token exists
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setUser(null);
      setStore(null);
      setBookings([]);
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch profile
      const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.data.success && profileRes.data.data?.user) {
        const currentUser = profileRes.data.data.user;
        if (currentUser.role !== "manager") {
          // Deny access
          handleLogout();
          showAlert("danger", "Access Denied: The business console is only for Store Owners.");
          return;
        }
        setUser(currentUser);
      } else {
        throw new Error("Invalid profile response");
      }

      // 2. Fetch Store Details
      try {
        const storeRes = await axios.get(`${API_BASE}/stores`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (storeRes.data.success && storeRes.data.data?.store) {
          setStore(storeRes.data.data.store);
        }
      } catch (err) {
        console.warn("No store registered for this manager yet.", err);
      }

      // 3. Fetch Bookings
      try {
        const bookingsRes = await axios.get(`${API_BASE}/bookings/store-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.data.success && bookingsRes.data.data?.bookings) {
          setBookings(bookingsRes.data.data.bookings);
        }
      } catch (err) {
        console.error("Failed to load store bookings", err);
      }

    } catch (err) {
      console.error("Error fetching dashboard details:", err);
      handleLogout();
      showAlert("danger", "Session expired or database connection failed. Please log in again.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showAlert("danger", "Please fill in all credentials.");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (response.data.success) {
        const { accessToken, user: loggedUser } = response.data.data;
        
        if (loggedUser.role !== "manager") {
          showAlert("danger", "Access Denied: Only Store Owners/Managers can access the Web Console.");
          return;
        }

        localStorage.setItem("token", accessToken);
        setToken(accessToken);
        showAlert("success", `Welcome back, ${loggedUser.fullName}!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      showAlert("danger", msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setStore(null);
    setBookings([]);
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const updateBookingStatus = async (bookingId, action) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/bookings/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showAlert("success", `Booking successfully marked as ${action}ed!`);
        // Refresh bookings
        const bookingsRes = await axios.get(`${API_BASE}/bookings/store-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.data.success && bookingsRes.data.data?.bookings) {
          setBookings(bookingsRes.data.data.bookings);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${action} booking.`;
      showAlert("danger", msg);
    }
  };

  // Stats computation
  const totalBookingsCount = bookings.length;
  const pendingRequestsCount = bookings.filter(b => b.status === "pending").length;
  const confirmedRequestsCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const totalRevenue = bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  if (!token) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card animate-fade-in">
          <div className="auth-logo">
            <span>🐾</span> PawConnect
          </div>
          <p className="auth-subtitle">Business Console - Store Manager Portal</p>

          {alert && (
            <div className={`alert-banner alert-banner-${alert.type}`}>
              <span>{alert.message}</span>
              <button className="alert-close" onClick={() => setAlert(null)}>×</button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="manager@pawconnect.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loginLoading}>
              {loginLoading ? "Verifying Credentials..." : "Access Dashboard"}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border-color)" }}>
            <span className="form-label" style={{ marginBottom: 12, display: "block", fontSize: "11px" }}>Quick Access Manager Accounts</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Janu", email: "yallajnaneswari@gmail.com" },
                { name: "Manu", email: "yallamanohar77@gmail.com" },
                { name: "Rajesh", email: "raajeshande@gmail.com" }
              ].map((m) => (
                <button
                  key={m.email}
                  type="button"
                  onClick={() => {
                    setEmail(m.email);
                    setPassword("123456");
                  }}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "var(--transition-smooth)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.8 }}>{m.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Navigation bar */}
      <header className="navbar">
        <a href="#" className="nav-brand">
          <span>🐾</span> PawConnect Business
        </a>

        {alert && (
          <div className={`alert-banner alert-banner-${alert.type}`} style={{ margin: 0, padding: "8px 16px" }}>
            <span>{alert.message}</span>
            <button className="alert-close" style={{ marginLeft: 10 }} onClick={() => setAlert(null)}>×</button>
          </div>
        )}

        <div className="nav-user">
          <div className="user-profile-info">
            <div className="user-avatar">👦</div>
            <div>
              <div className="user-name">{user?.fullName || "Store Owner"}</div>
              <div className="user-role">{store ? store.name : "Store Manager"}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="main-content animate-fade-in">
        
        {/* Statistics grid */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Total Bookings</h3>
              <div className="stat-value">{totalBookingsCount}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#fff" }}>
              <FileText size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Pending Requests</h3>
              <div className="stat-value">{pendingRequestsCount}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
              <Clock size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Confirmed Bookings</h3>
              <div className="stat-value">{confirmedRequestsCount}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}>
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Completed Services</h3>
              <div className="stat-value">{completedCount}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
              <Check size={24} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <div className="stat-value">₹{totalRevenue}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
              <DollarSign size={24} />
            </div>
          </div>
        </section>

        {/* Tab Controls */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === "bookings" ? "active" : ""}`}
              onClick={() => setActiveTab("bookings")}
            >
              Bookings Console
            </button>
            <button 
              className={`tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              My Store Profile & Settings
            </button>
          </div>

          {activeTab === "bookings" && (
            <div style={{ display: "flex", gap: 8 }}>
              {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    backgroundColor: filterStatus === st ? "var(--primary)" : "var(--bg-tertiary)",
                    color: filterStatus === st ? "#fff" : "var(--text-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {dataLoading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16 }}>
            <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
            <p style={{ color: "var(--text-secondary)" }}>Fetching live database files...</p>
          </div>
        ) : (
          <>
            {activeTab === "bookings" && (
              <div className="section-panel animate-fade-in">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <Calendar size={20} style={{ color: "var(--primary)" }} />
                    Live Booking Database Management
                  </h2>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Showing {filteredBookings.length} booking records
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer / Pet Owner</th>
                        <th>Pet Details</th>
                        <th>Service</th>
                        <th>Schedule</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 40 }}>
                            No booking records found for the filter "{filterStatus}".
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b) => (
                          <tr key={b._id}>
                            <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>
                              {b.bookingId}
                            </td>
                            <td>
                              <div className="details-box">
                                <span className="details-title">{b.userId?.fullName || "Unverified User"}</span>
                                <span className="details-sub">
                                  <Phone size={12} /> {b.userId?.phone || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="details-box">
                                <span className="details-title" style={{ color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                                  🐶 {b.petDetails?.name || "Buddy"}
                                </span>
                                <span className="details-sub">
                                  {b.petDetails?.breed || "Pet Breed"} • {b.petDetails?.age || "0 years"} • {b.petDetails?.weight || "0 kg"} ({b.petDetails?.gender || "Male"})
                                </span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{b.serviceName}</td>
                            <td>
                              <div className="details-box">
                                <span className="details-title">{b.date}</span>
                                <span className="details-sub">
                                  <Clock size={12} /> {b.timeSlot}
                                </span>
                              </div>
                            </td>
                            <td style={{ fontWeight: 700, fontSize: 15 }}>₹{b.price}</td>
                            <td>
                              <span className={`badge badge-${b.status}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-icon" 
                                  style={{ backgroundColor: "rgba(255,107,53,0.1)", color: "var(--primary)" }}
                                  title="View Details"
                                  onClick={() => setSelectedBookingForDetails(b)}
                                >
                                  <Eye size={16} />
                                </button>
                                {b.status === "pending" && (
                                  <>
                                    <button 
                                      className="btn-icon btn-icon-success" 
                                      title="Confirm Booking"
                                      onClick={() => updateBookingStatus(b._id, "accept")}
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button 
                                      className="btn-icon btn-icon-danger" 
                                      title="Reject Booking"
                                      onClick={() => updateBookingStatus(b._id, "reject")}
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                                {b.status === "confirmed" && (
                                  <>
                                    <button 
                                      className="btn-icon btn-icon-success" 
                                      title="Mark as Completed"
                                      onClick={() => updateBookingStatus(b._id, "complete")}
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button 
                                      className="btn-icon btn-icon-danger" 
                                      title="Cancel Booking"
                                      onClick={() => updateBookingStatus(b._id, "cancel")}
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="section-panel animate-fade-in">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <Store size={20} style={{ color: "var(--primary)" }} />
                    Store Profile Info & Schedule
                  </h2>
                </div>

                {!store ? (
                  <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>
                    <ShieldAlert size={48} style={{ color: "var(--warning)", marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>No Store Registered Yet</p>
                    <p>Please use the mobile application onboarding flow to register your store and setup details.</p>
                  </div>
                ) : (
                  <div className="store-profile-layout">
                    <div>
                      <div className="store-logo-box">
                        {store.logo ? (
                          <img src={store.logo} alt="Store Logo" className="store-logo-img" />
                        ) : (
                          <div className="store-logo-placeholder">🏥</div>
                        )}
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{store.name}</h3>
                        <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Store ID: {store._id}</p>
                      </div>

                      <h4 style={{ fontSize: 14, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>Gallery Images</h4>
                      <div className="store-gallery">
                        {[0, 1, 2, 3].map((idx) => {
                          const imgUrl = store.gallery?.[idx];
                          return imgUrl ? (
                            <div key={idx} className="gallery-item">
                              <img src={imgUrl} alt={`Gallery ${idx}`} />
                            </div>
                          ) : (
                            <div key={idx} className="gallery-item empty-gallery-item">
                              Empty
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      <div style={{ background: "var(--bg-tertiary)", padding: 24, borderRadius: 16, border: "1px solid var(--border-color)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                          General Details
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div>
                            <span style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block" }}>Description</span>
                            <span style={{ fontSize: 14, color: "#fff" }}>{store.description || "No description set."}</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block" }}>Store Phone</span>
                            <span style={{ fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                              <Phone size={14} style={{ color: "var(--primary)" }} /> {store.phone || "No phone added."}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block" }}>Store Address</span>
                            <span style={{ fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                              <MapPin size={14} style={{ color: "var(--primary)" }} /> {store.address || "No address set."}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-tertiary)", padding: 24, borderRadius: 16, border: "1px solid var(--border-color)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                          Services & Pricing Configured
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                          {store.services && store.services.length > 0 ? (
                            store.services.map((srv, idx) => {
                              const srvName = typeof srv === "object" ? srv.name : srv;
                              const srvPrice = store.servicePrices?.[srvName] || 0;
                              return (
                                <div key={idx} style={{ background: "var(--bg-secondary)", padding: 14, borderRadius: 10, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 4 }}>
                                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>{srvName}</span>
                                  <span style={{ fontSize: 16, fontWeight: 700 }}>₹{srvPrice}</span>
                                </div>
                              );
                            })
                          ) : (
                            <p style={{ color: "var(--text-tertiary)", gridColumn: "1/-1" }}>No services selected yet.</p>
                          )}
                        </div>
                      </div>

                      <div style={{ background: "var(--bg-tertiary)", padding: 24, borderRadius: 16, border: "1px solid var(--border-color)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
                          Weekly Available Days & Working Slots
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <span style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Active Days</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {(store.availableDays || []).map((day, idx) => (
                                <span key={idx} style={{ background: "rgba(255,107,53,0.15)", color: "var(--primary)", border: "1px solid var(--primary)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}>
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>Active Hourly Slots</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {(store.availableTimes || []).map((time, idx) => (
                                <span key={idx} style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: "20px", fontSize: "11px" }}>
                                  {time}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <div className="modal-overlay" onClick={() => setSelectedBookingForDetails(null)}>
          <div className="modal-content-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <span>🐾</span> Booking Details: {selectedBookingForDetails.bookingId}
              </h3>
              <button 
                onClick={() => setSelectedBookingForDetails(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body-pwc">
              <div className="modal-grid-pwc">
                
                {/* 1. Customer & Payment Details */}
                <div className="modal-section-card">
                  <h4 className="modal-section-title">👤 Customer & Payment</h4>
                  <div className="info-item-row">
                    <span className="info-item-label">Owner Name</span>
                    <span className="info-item-val">{selectedBookingForDetails.userId?.fullName || "Unverified User"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Email Address</span>
                    <span className="info-item-val">{selectedBookingForDetails.userId?.email || "N/A"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Phone Number</span>
                    <span className="info-item-val">{selectedBookingForDetails.userId?.phone || "N/A"}</span>
                  </div>
                  <div style={{ marginTop: 16, borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
                    <div className="info-item-row">
                      <span className="info-item-label">Service Booked</span>
                      <span className="info-item-val" style={{ color: "var(--primary)" }}>{selectedBookingForDetails.serviceName}</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-item-label">Schedule Date</span>
                      <span className="info-item-val">{selectedBookingForDetails.date}</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-item-label">Time Slot</span>
                      <span className="info-item-val">{selectedBookingForDetails.timeSlot}</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-item-label">Service Mode</span>
                      <span className="info-item-val" style={{ textTransform: "capitalize" }}>{selectedBookingForDetails.serviceMode || "Store"}</span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-item-label">Payment Method</span>
                      <span className="info-item-val" style={{ color: "#10b981", fontWeight: 700 }}>
                        {selectedBookingForDetails.paymentMethod || "Cash"}
                      </span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-item-label">Total Amount</span>
                      <span className="info-item-val" style={{ fontSize: 16, color: "#fff", fontWeight: 800 }}>
                        ₹{selectedBookingForDetails.price}
                      </span>
                    </div>
                    <div className="info-item-row">
                      <span className="info-item-label">Booking Status</span>
                      <span className={`badge badge-${selectedBookingForDetails.status}`}>
                        {selectedBookingForDetails.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Pet Basic Details */}
                <div className="modal-section-card">
                  <h4 className="modal-section-title">🐶 Pet Information</h4>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center" }}>
                    {selectedBookingForDetails.petDetails?.image ? (
                      <img 
                        src={selectedBookingForDetails.petDetails.image} 
                        alt="Pet Profile" 
                        className="avatar-preview-box"
                      />
                    ) : (
                      <div className="avatar-preview-box" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                        🐾
                      </div>
                    )}
                    <div>
                      <h5 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                        {selectedBookingForDetails.petDetails?.name || "N/A"}
                      </h5>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {selectedBookingForDetails.petDetails?.petType || "Dog"} • {selectedBookingForDetails.petDetails?.breed || "Breed Unspecified"}
                      </p>
                    </div>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Gender</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.gender || "Male"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Age</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.age || "0 Years"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Weight</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.weight || "0 Kg"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Microchip No.</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.microchipNumber || "Not Microchipped"}</span>
                  </div>
                </div>

              </div>

              {/* 3. Physical & Behavioral specs */}
              <div className="modal-grid-pwc">
                
                <div className="modal-section-card">
                  <h4 className="modal-section-title">🩺 Health & Vaccinations</h4>
                  <div className="info-item-row">
                    <span className="info-item-label">Vaccination Status</span>
                    <span className="info-item-val" style={{ color: selectedBookingForDetails.petDetails?.vaccinated ? "#10b981" : "#ef4444" }}>
                      {selectedBookingForDetails.petDetails?.vaccinated ? "Fully Vaccinated" : "Not Vaccinated"}
                    </span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Neutered / Spayed</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.neutered ? "Yes" : "No"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Allergies</span>
                    <span className="info-item-val" style={{ color: selectedBookingForDetails.petDetails?.allergies ? "#f59e0b" : "#fff" }}>
                      {selectedBookingForDetails.petDetails?.allergies || "None"}
                    </span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Medical Conditions</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.medicalConditions || "None"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Medications</span>
                    <span className="info-item-val">{selectedBookingForDetails.petDetails?.medications || "None"}</span>
                  </div>
                  {selectedBookingForDetails.petDetails?.vaccinationRecords && selectedBookingForDetails.petDetails.vaccinationRecords.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <span className="info-item-label" style={{ display: "block", marginBottom: 8 }}>Vaccination & Health Certificates:</span>
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {selectedBookingForDetails.petDetails.vaccinationRecords.map((url, idx) => (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="document-badge"
                          >
                            📄 Certificate #{idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-section-card">
                  <h4 className="modal-section-title">🧠 Behavioral Log</h4>
                  <div className="info-item-row">
                    <span className="info-item-label">Temperament</span>
                    <span className="info-item-val" style={{ textTransform: "capitalize" }}>{selectedBookingForDetails.petDetails?.temperament || "Calm"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Training Level</span>
                    <span className="info-item-val" style={{ textTransform: "capitalize" }}>{selectedBookingForDetails.petDetails?.trainingStatus || "Basic"}</span>
                  </div>
                  <div className="info-item-row">
                    <span className="info-item-label">Special Instructions</span>
                    <span className="info-item-val" style={{ whiteSpace: "pre-line", display: "inline-block", maxWidth: "70%" }}>
                      {selectedBookingForDetails.petDetails?.specialInstructions || "No instructions provided."}
                    </span>
                  </div>
                </div>

              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
