import React, { useState, useEffect } from "react";
import { 
  Footprints, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Clock, 
  CheckCircle, 
  X,
  Compass
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function DogWalkingManager() {
  const { 
    fetchWalkers, 
    addWalker, 
    updateWalker, 
    deleteWalker, 
    bookings,
    updateBookingStatus
  } = useStore();

  const [walkers, setWalkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("walkers"); // "walkers" | "appointments"
  const [showModal, setShowModal] = useState(false);
  const [editingWalker, setEditingWalker] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    serviceAreas: [],
    pricePerHour: "",
    availabilityStatus: "available", // "available" | "busy"
    active: true
  });
  const [areaInput, setAreaInput] = useState("");

  const loadWalkersData = async () => {
    setLoading(true);
    const fetched = await fetchWalkers();
    setWalkers(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadWalkersData();
  }, []);

  const handleOpenAdd = () => {
    setEditingWalker(null);
    setFormData({
      name: "",
      phone: "",
      serviceAreas: ["Green Park", "Downtown", "Vasant Kunj"],
      pricePerHour: "300",
      availabilityStatus: "available",
      active: true
    });
    setAreaInput("");
    setShowModal(true);
  };

  const handleOpenEdit = (w) => {
    setEditingWalker(w);
    setFormData({
      name: w.name || "",
      phone: w.phone || "",
      serviceAreas: w.serviceAreas || [],
      pricePerHour: w.pricePerHour || "",
      availabilityStatus: w.availabilityStatus || "available",
      active: w.active !== undefined ? w.active : true
    });
    setAreaInput("");
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const addArea = () => {
    if (!areaInput.trim()) return;
    if (formData.serviceAreas.includes(areaInput.trim())) return;
    setFormData(prev => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, areaInput.trim()]
    }));
    setAreaInput("");
  };

  const removeArea = (area) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter(a => a !== area)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      pricePerHour: Number(formData.pricePerHour)
    };

    let result;
    if (editingWalker) {
      result = await updateWalker(editingWalker._id, payload);
    } else {
      result = await addWalker(payload);
    }

    if (result.success) {
      setShowModal(false);
      loadWalkersData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this walker profile?")) {
      const success = await deleteWalker(id);
      if (success) {
        loadWalkersData();
      }
    }
  };

  // Filter dog walking appointments
  const walkingBookings = bookings.filter(b => 
    b.serviceName.toLowerCase().includes("walk") || 
    b.serviceName.toLowerCase().includes("walker") ||
    b.serviceName.toLowerCase().includes("walking")
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Dog Walking Management</h1>
          <p>Register professional dog walkers, map neighborhood service areas, and track walk schedules.</p>
        </div>
        <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px" }} onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: 6 }} />
          Add Walker Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 28 }}>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "walkers" ? "active" : ""}`}
            onClick={() => setActiveTab("walkers")}
          >
            Walker Roster
          </button>
          <button 
            className={`tab ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Walking Appointments ({walkingBookings.length})
          </button>
        </div>
      </div>

      {activeTab === "walkers" ? (
        <>
          {loading ? (
            <div className="loading-container" style={{ padding: "60px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)" }} />
              <p>Fetching active dog walkers...</p>
            </div>
          ) : (
            <div className="section-panel" style={{ padding: 24 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Walker Name</th>
                      <th>Contact Phone</th>
                      <th>Service Neighborhoods</th>
                      <th>Price per Hour</th>
                      <th>Work Status</th>
                      <th>Publish Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walkers.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                          No walker profiles created yet.
                        </td>
                      </tr>
                    ) : (
                      walkers.map((w) => (
                        <tr key={w._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                🚶
                              </div>
                              <span style={{ fontWeight: 700, color: "#fff" }}>{w.name}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{w.phone}</td>
                          <td style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>
                            {w.serviceAreas?.join(", ") || "No areas set."}
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{w.pricePerHour}/hr</td>
                          <td>
                            <span className={`badge ${w.availabilityStatus === "available" ? "badge-confirmed" : "badge-pending"}`}>
                              {w.availabilityStatus === "available" ? "Available" : "Busy"}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${w.active ? "badge-confirmed" : "badge-cancelled"}`}>
                              {w.active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" onClick={() => handleOpenEdit(w)} title="Edit Walker Details">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(w._id)} title="Delete Walker">
                                <Trash2 size={16} />
                              </button>
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
        </>
      ) : (
        /* Walking Appointments tab */
        <div className="section-panel" style={{ padding: 24 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Pet / Owner</th>
                  <th>Walking Service</th>
                  <th>Schedule</th>
                  <th>Price Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {walkingBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No walking booking appointments logged.
                    </td>
                  </tr>
                ) : (
                  walkingBookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{b.bookingId}</td>
                      <td>
                        <div className="details-box">
                          <span className="details-title">{b.userId?.fullName || "Verified Owner"}</span>
                          <span className="details-sub">🐶 {b.petDetails?.name || "Pet"} • {b.petDetails?.breed}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{b.serviceName}</td>
                      <td>
                        <div className="details-box">
                          <span className="details-title">{b.date}</span>
                          <span className="details-sub"><Clock size={11} /> {b.timeSlot}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{b.price}</td>
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
                                title="Confirm Walking"
                                onClick={() => updateBookingStatus(b._id, "accept")}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger"
                                title="Reject Walking"
                                onClick={() => updateBookingStatus(b._id, "reject")}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <button 
                              className="btn-icon btn-icon-success"
                              title="Mark as Completed"
                              onClick={() => updateBookingStatus(b._id, "complete")}
                            >
                              <CheckCircle size={15} />
                            </button>
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

      {/* Walker form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-lg animate-fade-in" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <Compass size={20} style={{ color: "var(--primary)" }} />
                {editingWalker ? "Edit Walker Profile" : "Add Walker Profile"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body-pwc" style={{ padding: 24, gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Walker Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Walker Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      className="input-field"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. +91 9900112233"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price per Hour ₹</label>
                    <input
                      type="number"
                      name="pricePerHour"
                      min="50"
                      className="input-field"
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Duty Availability</label>
                    <select
                      name="availabilityStatus"
                      className="input-field"
                      value={formData.availabilityStatus}
                      onChange={handleInputChange}
                    >
                      <option value="available">Available (On-Call)</option>
                      <option value="busy">Busy (Full/On-Walk)</option>
                    </select>
                  </div>
                </div>

                {/* Service areas input */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Service Neighborhood Areas</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Green Park Extension"
                      value={areaInput}
                      onChange={(e) => setAreaInput(e.target.value)}
                    />
                    <button type="button" className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 16px" }} onClick={addArea}>
                      Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {formData.serviceAreas.map((a, idx) => (
                      <span key={idx} style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 14, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        {a} <X size={10} style={{ cursor: "pointer", color: "var(--danger)" }} onClick={() => removeArea(a)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    style={{ width: 18, height: 18, accentColor: "var(--primary)" }}
                  />
                  <label htmlFor="active" style={{ fontSize: 14, color: "#fff", cursor: "pointer" }}>
                    Walker Profile is Active
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                  {editingWalker ? "Save Details Changes" : "Register Dog Walker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DogWalkingManager;
