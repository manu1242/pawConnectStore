import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Check, 
  FileText, 
  Eye, 
  X, 
  Phone, 
  Loader2, 
  Search,
  MapPin,
  Heart
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function Bookings() {
  const { bookings, dataLoading, updateBookingStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);

  // Compute stats
  const totalBookingsCount = bookings.length;
  const pendingRequestsCount = bookings.filter(b => b.status === "pending").length;
  const confirmedRequestsCount = bookings.filter(b => b.status === "confirmed").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const totalRevenue = bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  // Filter & Search
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const matchesSearch = 
      (b.bookingId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.userId?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.petDetails?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.serviceName || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title">
        <h1>Bookings Dashboard</h1>
        <p>Monitor customer appointments, service scheduling, and request responses.</p>
      </div>

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

      {/* Search and Filters */}
      <div className="table-actions">
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search booking ID, customer, pet name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`filter-tab-btn ${filterStatus === st ? "active" : ""}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {dataLoading ? (
        <div className="loading-container">
          <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
          <p>Fetching booking records from database...</p>
        </div>
      ) : (
        <div className="section-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Calendar size={20} style={{ color: "var(--primary)" }} />
              Live Bookings ({filteredBookings.length})
            </h2>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
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
                    <td colSpan="8" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No booking records found.
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
                            {b.petDetails?.breed || "Breed"} • {b.petDetails?.age || "0 yrs"} • {b.petDetails?.weight || "0 kg"}
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
                    {selectedBookingForDetails.customerLocation && (
                      <div className="info-item-row">
                        <span className="info-item-label">Customer Location</span>
                        <span className="info-item-val" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", maxWidth: "60%" }}>
                          <MapPin size={12} style={{ color: "var(--primary)" }} />
                          {selectedBookingForDetails.customerLocation.address || "Coordinates Set"}
                        </span>
                      </div>
                    )}
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

export default Bookings;
