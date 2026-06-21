import React, { useState, useEffect } from "react";
import { 
  Scissors, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search, 
  Clock, 
  CheckCircle, 
  Eye, 
  X,
  Sparkles
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function GroomingManager() {
  const { 
    fetchGroomingPackages, 
    addGroomingPackage, 
    updateGroomingPackage, 
    deleteGroomingPackage, 
    bookings,
    updateBookingStatus
  } = useStore();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("packages"); // "packages" | "appointments"
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "", // in minutes
    availableSlots: [],
    active: true
  });
  const [slotInput, setSlotInput] = useState("");

  const loadPackagesData = async () => {
    setLoading(true);
    const fetched = await fetchGroomingPackages();
    setPackages(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadPackagesData();
  }, []);

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "60",
      availableSlots: ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM"],
      active: true
    });
    setSlotInput("");
    setShowModal(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name || "",
      description: pkg.description || "",
      price: pkg.price || "",
      duration: pkg.duration || "",
      availableSlots: pkg.availableSlots || [],
      active: pkg.active !== undefined ? pkg.active : true
    });
    setSlotInput("");
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const addSlot = () => {
    if (!slotInput.trim()) return;
    if (formData.availableSlots.includes(slotInput.trim())) return;
    setFormData(prev => ({
      ...prev,
      availableSlots: [...prev.availableSlots, slotInput.trim()]
    }));
    setSlotInput("");
  };

  const removeSlot = (slot) => {
    setFormData(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.filter(s => s !== slot)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      duration: Number(formData.duration)
    };

    let result;
    if (editingPkg) {
      result = await updateGroomingPackage(editingPkg._id, payload);
    } else {
      result = await addGroomingPackage(payload);
    }

    if (result.success) {
      setShowModal(false);
      loadPackagesData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grooming package?")) {
      const success = await deleteGroomingPackage(id);
      if (success) {
        loadPackagesData();
      }
    }
  };

  // Filter grooming appointments
  const groomingBookings = bookings.filter(b => 
    b.serviceName.toLowerCase().includes("groom") || 
    b.serviceName.toLowerCase().includes("spa") ||
    b.serviceName.toLowerCase().includes("bath") ||
    b.serviceName.toLowerCase().includes("haircut")
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Grooming Package Services</h1>
          <p>Design custom hygiene packages, configure session durations, and accept style appointments.</p>
        </div>
        <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px" }} onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: 6 }} />
          Add Grooming Package
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 28 }}>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => setActiveTab("packages")}
          >
            Grooming Packages
          </button>
          <button 
            className={`tab ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Spa Appointments ({groomingBookings.length})
          </button>
        </div>
      </div>

      {activeTab === "packages" ? (
        <>
          {loading ? (
            <div className="loading-container" style={{ padding: "60px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)" }} />
              <p>Fetching grooming spa packages...</p>
            </div>
          ) : (
            <div className="section-panel" style={{ padding: 24 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Package Name</th>
                      <th>Description</th>
                      <th>Session Duration</th>
                      <th>Pricing Rate</th>
                      <th>Publish Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                          No grooming spa packages created yet.
                        </td>
                      </tr>
                    ) : (
                      packages.map((pkg) => (
                        <tr key={pkg._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(16,185,129,0.1)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                ✂️
                              </div>
                              <span style={{ fontWeight: 700, color: "#fff" }}>{pkg.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {pkg.description || "No description details."}
                          </td>
                          <td style={{ fontWeight: 600 }}><Clock size={12} style={{ display: "inline", marginRight: 4 }} /> {pkg.duration} Mins</td>
                          <td style={{ fontWeight: 700 }}>₹{pkg.price}</td>
                          <td>
                            <span className={`badge ${pkg.active ? "badge-confirmed" : "badge-cancelled"}`}>
                              {pkg.active ? "Active" : "Hidden"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" onClick={() => handleOpenEdit(pkg)} title="Edit Package">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(pkg._id)} title="Delete Package">
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
        /* Grooming Appointments tab */
        <div className="section-panel" style={{ padding: 24 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Pet / Owner</th>
                  <th>Grooming Service</th>
                  <th>Schedule</th>
                  <th>Price Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groomingBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No grooming booking appointments logged.
                    </td>
                  </tr>
                ) : (
                  groomingBookings.map((b) => (
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
                                title="Confirm Grooming"
                                onClick={() => updateBookingStatus(b._id, "accept")}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger"
                                title="Reject Grooming"
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

      {/* Package Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-lg animate-fade-in" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <Sparkles size={20} style={{ color: "var(--primary)" }} />
                {editingPkg ? "Edit Grooming Package" : "Add Grooming Package"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body-pwc" style={{ padding: 24, gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Package Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Full Bath & Breed-Specific Haircut"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="input-field"
                    style={{ minHeight: 80, resize: "vertical" }}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe grooming bath features, products used, styling details..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price Rate ₹</label>
                    <input
                      type="number"
                      name="price"
                      min="50"
                      className="input-field"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Session Duration (Mins)</label>
                    <input
                      type="number"
                      name="duration"
                      min="15"
                      className="input-field"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Available slots input */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Available Slots</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. 10:00 AM"
                      value={slotInput}
                      onChange={(e) => setSlotInput(e.target.value)}
                    />
                    <button type="button" className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 16px" }} onClick={addSlot}>
                      Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {formData.availableSlots.map((s, idx) => (
                      <span key={idx} style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 14, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                        {s} <X size={10} style={{ cursor: "pointer", color: "var(--danger)" }} onClick={() => removeSlot(s)} />
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
                    Publish Package (Visible to Customers)
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                  {editingPkg ? "Save Details Changes" : "Create Grooming Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroomingManager;
