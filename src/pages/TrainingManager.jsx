import React, { useState, useEffect } from "react";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Clock, 
  CheckCircle, 
  Eye, 
  X,
  Layers
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function TrainingManager() {
  const { 
    fetchTrainingPrograms, 
    addTrainingProgram, 
    updateTrainingProgram, 
    deleteTrainingProgram, 
    bookings,
    updateBookingStatus
  } = useStore();

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("programs"); // "programs" | "appointments"
  const [showModal, setShowModal] = useState(false);
  const [editingProg, setEditingProg] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "", // e.g. "4 Weeks", "10 Sessions"
    trainerName: "",
    price: "",
    active: true
  });

  const loadProgramsData = async () => {
    setLoading(true);
    const fetched = await fetchTrainingPrograms();
    setPrograms(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadProgramsData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProg(null);
    setFormData({
      name: "",
      description: "",
      duration: "4 Weeks (12 Sessions)",
      trainerName: "Coach Aditya",
      price: "4500",
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (prog) => {
    setEditingProg(prog);
    setFormData({
      name: prog.name || "",
      description: prog.description || "",
      duration: prog.duration || "",
      trainerName: prog.trainerName || "",
      price: prog.price || "",
      active: prog.active !== undefined ? prog.active : true
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price)
    };

    let result;
    if (editingProg) {
      result = await updateTrainingProgram(editingProg._id, payload);
    } else {
      result = await addTrainingProgram(payload);
    }

    if (result.success) {
      setShowModal(false);
      loadProgramsData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this training program?")) {
      const success = await deleteTrainingProgram(id);
      if (success) {
        loadProgramsData();
      }
    }
  };

  // Filter training appointments
  const trainingBookings = bookings.filter(b => 
    b.serviceName.toLowerCase().includes("train") || 
    b.serviceName.toLowerCase().includes("training") ||
    b.serviceName.toLowerCase().includes("obedience") ||
    b.serviceName.toLowerCase().includes("puppy")
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Training Programs</h1>
          <p>Create professional pet training programs, assign expert trainers, and review puppy training slots.</p>
        </div>
        <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px" }} onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: 6 }} />
          Add Training Program
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 28 }}>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "programs" ? "active" : ""}`}
            onClick={() => setActiveTab("programs")}
          >
            Training Programs
          </button>
          <button 
            className={`tab ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Training Bookings ({trainingBookings.length})
          </button>
        </div>
      </div>

      {activeTab === "programs" ? (
        <>
          {loading ? (
            <div className="loading-container" style={{ padding: "60px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)" }} />
              <p>Fetching active training programs...</p>
            </div>
          ) : (
            <div className="section-panel" style={{ padding: 24 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Program name</th>
                      <th>Description</th>
                      <th>Curriculum Duration</th>
                      <th>Coach / Trainer</th>
                      <th>Program Price</th>
                      <th>Publish Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                          No training programs registered yet.
                        </td>
                      </tr>
                    ) : (
                      programs.map((prog) => (
                        <tr key={prog._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                🎓
                              </div>
                              <span style={{ fontWeight: 700, color: "#fff" }}>{prog.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {prog.description || "No description details."}
                          </td>
                          <td style={{ fontWeight: 600 }}>{prog.duration}</td>
                          <td style={{ fontWeight: 600 }}>{prog.trainerName}</td>
                          <td style={{ fontWeight: 700 }}>₹{prog.price}</td>
                          <td>
                            <span className={`badge ${prog.active ? "badge-confirmed" : "badge-cancelled"}`}>
                              {prog.active ? "Active" : "Draft"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" onClick={() => handleOpenEdit(prog)} title="Edit Program">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(prog._id)} title="Delete Program">
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
        /* Training appointments tab */
        <div className="section-panel" style={{ padding: 24 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Pet / Owner</th>
                  <th>Obedience Course</th>
                  <th>Schedule</th>
                  <th>Enroll Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainingBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No training appointments registered.
                    </td>
                  </tr>
                ) : (
                  trainingBookings.map((b) => (
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
                                title="Approve Training Enrollment"
                                onClick={() => updateBookingStatus(b._id, "accept")}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger"
                                title="Reject Training"
                                onClick={() => updateBookingStatus(b._id, "reject")}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <button 
                              className="btn-icon btn-icon-success"
                              title="Confirm Graduation Complete"
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

      {/* Program Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-lg animate-fade-in" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <Award size={20} style={{ color: "var(--primary)" }} />
                {editingProg ? "Edit Training Program" : "Create Training Program"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body-pwc" style={{ padding: 24, gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Program Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Puppy Obedience Training"
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
                    placeholder="Describe commands trained, training style, target pet behaviors..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Program Price ₹</label>
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
                    <label className="form-label">Program Duration</label>
                    <input
                      type="text"
                      name="duration"
                      className="input-field"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 4 Weeks (12 sessions)"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Assigned Coach / Trainer Name</label>
                  <input
                    type="text"
                    name="trainerName"
                    className="input-field"
                    value={formData.trainerName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Coach Aditya"
                  />
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
                    Publish Program (Visible to Customers)
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                  {editingProg ? "Save Details Changes" : "Register Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainingManager;
