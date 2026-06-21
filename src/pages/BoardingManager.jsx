import React, { useState, useEffect } from "react";
import { 
  Home, 
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

function BoardingManager() {
  const { 
    fetchBoardingPackages, 
    addBoardingPackage, 
    updateBoardingPackage, 
    deleteBoardingPackage, 
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
    capacity: "", // number of pets
    pricePerDay: "",
    active: true
  });

  const loadPackagesData = async () => {
    setLoading(true);
    const fetched = await fetchBoardingPackages();
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
      capacity: "10",
      pricePerDay: "800",
      active: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setFormData({
      name: pkg.name || "",
      description: pkg.description || "",
      capacity: pkg.capacity || "0",
      pricePerDay: pkg.pricePerDay || "",
      active: pkg.active !== undefined ? pkg.active : true
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
      capacity: Number(formData.capacity),
      pricePerDay: Number(formData.pricePerDay)
    };

    let result;
    if (editingPkg) {
      result = await updateBoardingPackage(editingPkg._id, payload);
    } else {
      result = await addBoardingPackage(payload);
    }

    if (result.success) {
      setShowModal(false);
      loadPackagesData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this boarding stay package?")) {
      const success = await deleteBoardingPackage(id);
      if (success) {
        loadPackagesData();
      }
    }
  };

  // Filter boarding stay appointments
  const boardingBookings = bookings.filter(b => 
    b.serviceName.toLowerCase().includes("board") || 
    b.serviceName.toLowerCase().includes("boarding") ||
    b.serviceName.toLowerCase().includes("stay") ||
    b.serviceName.toLowerCase().includes("hostel")
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Boarding Hostel Stays</h1>
          <p>Configure overnight lodging stay rates, maximum kennel capacity, and view guest check-in reservations.</p>
        </div>
        <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px" }} onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: 6 }} />
          Add Boarding Package
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 28 }}>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "packages" ? "active" : ""}`}
            onClick={() => setActiveTab("packages")}
          >
            Boarding Packages
          </button>
          <button 
            className={`tab ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            Stay Reservations ({boardingBookings.length})
          </button>
        </div>
      </div>

      {activeTab === "packages" ? (
        <>
          {loading ? (
            <div className="loading-container" style={{ padding: "60px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)" }} />
              <p>Fetching boarding lodging rates...</p>
            </div>
          ) : (
            <div className="section-panel" style={{ padding: 24 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Stay Package</th>
                      <th>Description</th>
                      <th>Max Kennel Capacity</th>
                      <th>Price per Day</th>
                      <th>Publish Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                          No boarding packages created yet.
                        </td>
                      </tr>
                    ) : (
                      packages.map((pkg) => (
                        <tr key={pkg._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(59,130,246,0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                                🏨
                              </div>
                              <span style={{ fontWeight: 700, color: "#fff" }}>{pkg.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {pkg.description || "No description details."}
                          </td>
                          <td style={{ fontWeight: 600 }}>{pkg.capacity} Pet(s) Max</td>
                          <td style={{ fontWeight: 700 }}>₹{pkg.pricePerDay}/day</td>
                          <td>
                            <span className={`badge ${pkg.active ? "badge-confirmed" : "badge-cancelled"}`}>
                              {pkg.active ? "Active" : "Disabled"}
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
        /* Boarding appointments tab */
        <div className="section-panel" style={{ padding: 24 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Pet / Owner</th>
                  <th>Lodging Stay Option</th>
                  <th>Date Check-in</th>
                  <th>Bill Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {boardingBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No boarding stay reservations logged.
                    </td>
                  </tr>
                ) : (
                  boardingBookings.map((b) => (
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
                                title="Approve Check-in"
                                onClick={() => updateBookingStatus(b._id, "accept")}
                              >
                                <CheckCircle size={15} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger"
                                title="Reject Check-in"
                                onClick={() => updateBookingStatus(b._id, "reject")}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <button 
                              className="btn-icon btn-icon-success"
                              title="Confirm Check-out Completed"
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
                <Home size={20} style={{ color: "var(--primary)" }} />
                {editingPkg ? "Edit Boarding Stay details" : "Add Boarding Stay option"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body-pwc" style={{ padding: 24, gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Stay Package Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Deluxe AC Kennel Suite"
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
                    placeholder="Describe suite features, play timings, food plans included..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price per Day ₹</label>
                    <input
                      type="number"
                      name="pricePerDay"
                      min="50"
                      className="input-field"
                      value={formData.pricePerDay}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Lodger Capacity Limit</label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      className="input-field"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                    />
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
                    Publish Lodging option (Visible to Customers)
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                  {editingPkg ? "Save Details Changes" : "Create Boarding Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardingManager;
