import React, { useState, useEffect } from "react";
import { 
  HeartPulse, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search, 
  Calendar, 
  Clock, 
  Stethoscope,
  CheckCircle,
  Eye,
  X
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function VeterinaryManager() {
  const { 
    fetchDoctors, 
    addDoctor, 
    updateDoctor, 
    deleteDoctor, 
    bookings,
    updateBookingStatus
  } = useStore();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("doctors"); // "doctors" | "appointments"
  
  // Doctor form state
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    consultationFee: "",
    clinicTimings: "",
    availableSlots: [],
    active: true
  });

  const [slotInput, setSlotInput] = useState("");

  const loadDoctorsData = async () => {
    setLoading(true);
    const fetched = await fetchDoctors();
    setDoctors(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadDoctorsData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({
      name: "",
      specialization: "",
      experience: "",
      consultationFee: "",
      clinicTimings: "9:00 AM - 6:00 PM",
      availableSlots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM"],
      active: true
    });
    setSlotInput("");
    setShowModal(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name || "",
      specialization: doc.specialization || "",
      experience: doc.experience || "",
      consultationFee: doc.consultationFee || "",
      clinicTimings: doc.clinicTimings || "",
      availableSlots: doc.availableSlots || [],
      active: doc.active !== undefined ? doc.active : true
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
      consultationFee: Number(formData.consultationFee),
      experience: Number(formData.experience)
    };

    let result;
    if (editingDoc) {
      result = await updateDoctor(editingDoc._id, payload);
    } else {
      result = await addDoctor(payload);
    }

    if (result.success) {
      setShowModal(false);
      loadDoctorsData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this doctor profile?")) {
      const success = await deleteDoctor(id);
      if (success) {
        loadDoctorsData();
      }
    }
  };

  // Filter veterinary appointments
  const vetBookings = bookings.filter(b => 
    b.serviceName.toLowerCase().includes("vet") || 
    b.serviceName.toLowerCase().includes("doctor") ||
    b.serviceName.toLowerCase().includes("clinic") ||
    b.serviceName.toLowerCase().includes("consultation")
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Veterinary Management</h1>
          <p>Configure doctor lists, consultation hours, scheduling slots, and patient booking inquiries.</p>
        </div>
        <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px" }} onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: 6 }} />
          Add Doctor Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 28 }}>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            Doctor Roster
          </button>
          <button 
            className={`tab ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Vet Consultations ({vetBookings.length})
          </button>
        </div>
      </div>

      {activeTab === "doctors" ? (
        <>
          {loading ? (
            <div className="loading-container" style={{ padding: "60px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)" }} />
              <p>Loading clinic doctor roster...</p>
            </div>
          ) : (
            <div className="section-panel" style={{ padding: 24 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Specialization</th>
                      <th>Experience</th>
                      <th>Consultation Fee</th>
                      <th>Clinic Timings</th>
                      <th>Availability Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                          No doctor profiles created yet. Please register your veterinary staff.
                        </td>
                      </tr>
                    ) : (
                      doctors.map((d) => (
                        <tr key={d._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                👨‍⚕️
                              </div>
                              <span style={{ fontWeight: 700, color: "#fff" }}>{d.name}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{d.specialization}</td>
                          <td>{d.experience} Years</td>
                          <td style={{ fontWeight: 700 }}>₹{d.consultationFee}</td>
                          <td>{d.clinicTimings}</td>
                          <td>
                            <span className={`badge ${d.active ? "badge-confirmed" : "badge-cancelled"}`}>
                              {d.active ? "On Duty" : "Off Duty"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" onClick={() => handleOpenEdit(d)} title="Edit Doctor Details">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(d._id)} title="Delete Doctor">
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
        /* Vet Appointments tab */
        <div className="section-panel" style={{ padding: 24 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Pet / Owner</th>
                  <th>Consultation Service</th>
                  <th>Appointment Schedule</th>
                  <th>Fee Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vetBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No vet clinic bookings logged.
                    </td>
                  </tr>
                ) : (
                  vetBookings.map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{b.bookingId}</td>
                      <td>
                        <div className="details-box">
                          <span className="details-title">{b.userId?.fullName || "Verified Client"}</span>
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
                                title="Confirm Consultation"
                                onClick={() => updateBookingStatus(b._id, "accept")}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger"
                                title="Cancel consultation"
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

      {/* Form modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-lg animate-fade-in" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <HeartPulse size={20} style={{ color: "var(--primary)" }} />
                {editingDoc ? "Edit Doctor Profile" : "Register Doctor Profile"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body-pwc" style={{ padding: 24, gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Doctor Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Dr. Harish Rao"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      className="input-field"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Surgery, Orthopedics"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      min="1"
                      className="input-field"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Consultation Fee ₹</label>
                    <input
                      type="number"
                      name="consultationFee"
                      min="50"
                      className="input-field"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Clinic Operating Hours</label>
                    <input
                      type="text"
                      name="clinicTimings"
                      className="input-field"
                      value={formData.clinicTimings}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 10:00 AM - 7:00 PM"
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
                      placeholder="e.g. 11:30 AM"
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
                    Doctor is Active and On-Duty
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                  {editingDoc ? "Save Details Changes" : "Register Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VeterinaryManager;
