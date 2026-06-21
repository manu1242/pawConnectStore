import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Save, 
  Activity, 
  Clock, 
  Copy, 
  DollarSign
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function EmergencyManager() {
  const { 
    fetchEmergencyDetail, 
    saveEmergencyDetail, 
    bookings, 
    updateBookingStatus,
    showAlert
  } = useStore();

  const [emergencyConfig, setEmergencyConfig] = useState({
    contactNumber: "",
    emergencyFee: "",
    isActive: true,
    responseTimeMinutes: ""
  });
  
  const [configLoading, setConfigLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  const loadEmergencyConfig = async () => {
    setConfigLoading(true);
    const detail = await fetchEmergencyDetail();
    if (detail) {
      setEmergencyConfig({
        contactNumber: detail.contactNumber || "",
        emergencyFee: detail.emergencyFee || "",
        isActive: detail.isActive !== undefined ? detail.isActive : true,
        responseTimeMinutes: detail.responseTimeMinutes || ""
      });
    } else {
      // Default initial local/API states
      setEmergencyConfig({
        contactNumber: "+91 99999 88888",
        emergencyFee: "1500",
        isActive: true,
        responseTimeMinutes: "15"
      });
    }
    setConfigLoading(false);
  };

  useEffect(() => {
    loadEmergencyConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmergencyConfig(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleConfigSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const payload = {
      ...emergencyConfig,
      emergencyFee: Number(emergencyConfig.emergencyFee),
      responseTimeMinutes: Number(emergencyConfig.responseTimeMinutes)
    };
    const result = await saveEmergencyDetail(payload);
    if (result.success) {
      setEmergencyConfig({
        contactNumber: result.emergencyDetail.contactNumber || "",
        emergencyFee: result.emergencyDetail.emergencyFee || "",
        isActive: result.emergencyDetail.isActive !== undefined ? result.emergencyDetail.isActive : true,
        responseTimeMinutes: result.emergencyDetail.responseTimeMinutes || ""
      });
    }
    setSaveLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showAlert("success", "Location coordinates copied to clipboard!");
  };

  // Filter emergency triage bookings
  const emergencyBookings = bookings.filter(b => 
    b.serviceName.toLowerCase().includes("emergency") || 
    b.timeSlot?.toLowerCase().includes("asap") ||
    b.status === "emergency"
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title">
        <h1>Emergency Dispatch Triage</h1>
        <p>Manage real-time critical hospital admissions, patient location coordinates, and dispatch response times.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32 }}>
        
        {/* Left Column: Emergency Console settings */}
        <div className="section-panel" style={{ margin: 0, padding: 28, height: "fit-content" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
            <ShieldAlert size={20} style={{ color: "var(--danger)" }} />
            Duty Settings
          </h3>

          {configLoading ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <Loader2 className="animate-spin" size={32} style={{ color: "var(--danger)", margin: "0 auto" }} />
              <p style={{ marginTop: 10, fontSize: 13 }}>Fetching configurations...</p>
            </div>
          ) : (
            <form onSubmit={handleConfigSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Emergency Phone Number</label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                  <input
                    type="text"
                    name="contactNumber"
                    className="input-field"
                    style={{ paddingLeft: 42 }}
                    value={emergencyConfig.contactNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Triage Consultation Fee ₹</label>
                <input
                  type="number"
                  name="emergencyFee"
                  min="0"
                  className="input-field"
                  value={emergencyConfig.emergencyFee}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Response Guarantee (Minutes)</label>
                <div style={{ position: "relative" }}>
                  <Clock size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                  <input
                    type="number"
                    name="responseTimeMinutes"
                    min="5"
                    className="input-field"
                    style={{ paddingLeft: 42 }}
                    value={emergencyConfig.responseTimeMinutes}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-tertiary)", padding: 14, borderRadius: 12, border: "1px solid var(--border-color)", margin: "8px 0" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", display: "block" }}>Emergency Channel</span>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Visibility on mobile app</span>
                </div>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={emergencyConfig.isActive}
                  onChange={handleInputChange}
                  style={{ width: 42, height: 20, cursor: "pointer", accentColor: "var(--danger)" }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ 
                  margin: 0, 
                  padding: 12, 
                  background: "linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)", 
                  boxShadow: "0 4px 12px rgba(239,68,68,0.25)" 
                }}
                disabled={saveLoading}
              >
                <Save size={16} style={{ marginRight: 6 }} />
                {saveLoading ? "Saving config..." : "Save Config Settings"}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Dispatch cases */}
        <div className="section-panel" style={{ margin: 0, padding: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
            <Activity size={20} style={{ color: "var(--danger)" }} />
            Live Emergency Dispatch Requests ({emergencyBookings.length})
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Pet Owner</th>
                  <th>Symptom / Details</th>
                  <th>Customer coordinates</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emergencyBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No active emergency triage requests found.
                    </td>
                  </tr>
                ) : (
                  emergencyBookings.map((b) => {
                    const coords = b.customerLocation?.coordinates 
                      ? `${b.customerLocation.coordinates[1]?.toFixed(5)}, ${b.customerLocation.coordinates[0]?.toFixed(5)}`
                      : "No coordinates set";
                    
                    return (
                      <tr key={b._id}>
                        <td>
                          <div className="details-box">
                            <span className="details-title">{b.userId?.fullName || "Verified Client"}</span>
                            <span className="details-sub">📞 {b.userId?.phone || "N/A"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="details-box">
                            <span className="details-title" style={{ color: "var(--danger)" }}>{b.serviceName}</span>
                            <span className="details-sub" style={{ maxWidth: 180, display: "inline-block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {b.notes || "Emergency triage required immediately."}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <MapPin size={14} style={{ color: "var(--danger)" }} />
                            <div className="details-box">
                              <span className="details-title" style={{ fontSize: 12, fontFamily: "monospace" }}>{coords}</span>
                              <span className="details-sub" style={{ fontSize: 11, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={b.customerLocation?.address || ""}>
                                {b.customerLocation?.address || "Street Location details"}
                              </span>
                            </div>
                            {b.customerLocation?.coordinates && (
                              <button 
                                className="btn-icon" 
                                style={{ padding: 4, height: "auto" }} 
                                title="Copy Coordinates"
                                onClick={() => copyToClipboard(coords)}
                              >
                                <Copy size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: 800, color: "var(--danger)" }}>CRITICAL (ASAP)</td>
                        <td>
                          <span className={`badge badge-${b.status}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {b.status === "pending" && (
                              <>
                                <button 
                                  className="btn-icon btn-icon-success"
                                  title="Accept Dispatch"
                                  onClick={() => updateBookingStatus(b._id, "accept")}
                                >
                                  <CheckCircle size={15} />
                                </button>
                                <button 
                                  className="btn-icon btn-icon-danger"
                                  title="Reject Dispatch"
                                  onClick={() => updateBookingStatus(b._id, "reject")}
                                >
                                  <XCircle size={15} />
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <button 
                                className="btn-icon btn-icon-success"
                                title="Mark Treatment Completed"
                                onClick={() => updateBookingStatus(b._id, "complete")}
                              >
                                <CheckCircle size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmergencyManager;
