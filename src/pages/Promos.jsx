import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tag, Search, Plus, Trash2, Edit2, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { useStore } from "../context/StoreContext";

function Promos() {
  const { token, showAlert, API_BASE } = useStore();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState("");
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [displayOnHome, setDisplayOnHome] = useState(false);
  const [active, setActive] = useState(true);

  // Edit states
  const [editingPromoId, setEditingPromoId] = useState(null);

  const fetchStorePromos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/promos/store`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data?.promos) {
        setPromos(res.data.data.promos);
      }
    } catch (err) {
      console.error("Failed to load store promos", err);
      showAlert("danger", "Failed to fetch promo codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStorePromos();
    }
  }, [token]);

  const resetForm = () => {
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue(0);
    setMaxDiscount("");
    setMinOrderValue(0);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setUsageLimit("");
    setBannerImage("");
    setDisplayOnHome(false);
    setActive(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE}/promos/store`,
        {
          code,
          title,
          description,
          discountType,
          discountValue: Number(discountValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          minOrderValue: Number(minOrderValue),
          startDate,
          endDate: endDate || undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          bannerImage,
          displayOnHome,
          active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showAlert("success", "Promo code created successfully!");
        fetchStorePromos();
        setShowCreateModal(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      showAlert("danger", err.response?.data?.message || "Failed to create promo code.");
    }
  };

  const handleEditClick = (p) => {
    setEditingPromoId(p._id);
    setCode(p.code);
    setTitle(p.title);
    setDescription(p.description);
    setDiscountType(p.discountType);
    setDiscountValue(p.discountValue);
    setMaxDiscount(p.maxDiscount || "");
    setMinOrderValue(p.minOrderValue || 0);
    setStartDate(p.startDate ? p.startDate.split("T")[0] : "");
    setEndDate(p.endDate ? p.endDate.split("T")[0] : "");
    setUsageLimit(p.usageLimit || "");
    setBannerImage(p.bannerImage || "");
    setDisplayOnHome(p.displayOnHome || false);
    setActive(p.active);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${API_BASE}/promos/store/${editingPromoId}`,
        {
          code,
          title,
          description,
          discountType,
          discountValue: Number(discountValue),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          minOrderValue: Number(minOrderValue),
          startDate,
          endDate: endDate || undefined,
          usageLimit: usageLimit ? Number(usageLimit) : undefined,
          bannerImage,
          displayOnHome,
          active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showAlert("success", "Promo code updated successfully!");
        fetchStorePromos();
        setShowEditModal(false);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      showAlert("danger", err.response?.data?.message || "Failed to update promo code.");
    }
  };

  const handleTogglePromoActive = async (id) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/promos/store/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showAlert("success", res.data.message || "Promo status toggled!");
        fetchStorePromos();
      }
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to toggle promo status.");
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this promo code?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/promos/store/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Promo code deleted successfully.");
        fetchStorePromos();
      }
    } catch (err) {
      console.error(err);
      showAlert("danger", "Failed to delete promo code.");
    }
  };

  const filteredPromos = promos.filter(p =>
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && promos.length === 0) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
        <p>Loading promo codes...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Header and Controls */}
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Promo Code Management</h1>
          <p>Configure custom coupons and banners exclusive to your store.</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--text-tertiary)" }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search promos..."
              style={{ paddingLeft: 36, width: 220, margin: 0, height: 40 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="btn-primary" 
            style={{ width: "auto", margin: 0, height: 40, padding: "0 18px", display: "flex", alignItems: "center", gap: 8 }}
            onClick={() => { resetForm(); setShowCreateModal(true); }}
          >
            <Plus size={16} /> Create Promo
          </button>
        </div>
      </div>

      {/* Promos Table Panel */}
      <div className="section-panel" style={{ padding: "20px 0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Promo Code</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Campaign Info</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Discount Value</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Home Banner</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Usage Stats</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Validity</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Status</th>
              <th style={{ padding: "12px 24px", color: "var(--text-secondary)", fontSize: 13, fontWeight: 700 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromos.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 40 }}>
                  No promo codes defined yet. Click "Create Promo" to get started!
                </td>
              </tr>
            ) : (
              filteredPromos.map(p => {
                const isExpired = p.endDate && new Date(p.endDate) < new Date();
                const discountDisplay = p.discountType === "percentage" ? `${p.discountValue}%` : `₹${p.discountValue}`;
                return (
                  <tr key={p._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "18px 24px", fontWeight: 800, color: "var(--primary)", fontSize: 14 }}>{p.code}</td>
                    <td style={{ padding: "18px 24px" }}>
                      <div>
                        <strong style={{ color: "#fff" }}>{p.title}</strong>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                          {p.description}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "18px 24px", fontWeight: 700, color: "#fff" }}>
                      {discountDisplay}
                      {p.minOrderValue > 0 && (
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 400 }}>
                          Min Order: ₹{p.minOrderValue}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: p.displayOnHome ? "rgba(74, 222, 128, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: p.displayOnHome ? "#4ade80" : "#ef4444"
                      }}>
                        {p.displayOnHome ? "YES" : "NO"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px", color: "var(--text-secondary)", fontSize: 13 }}>
                      <strong>{p.usedCount}</strong> / {p.usageLimit || "∞"}
                    </td>
                    <td style={{ padding: "18px 24px", fontSize: 11, color: "var(--text-secondary)" }}>
                      <div>Start: {p.startDate ? p.startDate.split("T")[0] : "N/A"}</div>
                      {p.endDate && (
                        <div style={{ color: isExpired ? "#ef4444" : "var(--text-tertiary)", marginTop: 2 }}>
                          End: {p.endDate.split("T")[0]} {isExpired && "(Expired)"}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        background: p.active && !isExpired ? "rgba(74, 222, 128, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: p.active && !isExpired ? "#4ade80" : "#ef4444"
                      }}>
                        {p.active && !isExpired ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 10px", width: "auto", margin: 0 }}
                          title="Edit Details"
                          onClick={() => handleEditClick(p)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-secondary"
                          style={{
                            padding: "6px 10px",
                            width: "auto",
                            margin: 0,
                            color: p.active ? "var(--danger)" : "var(--success)"
                          }}
                          title={p.active ? "Deactivate" : "Activate"}
                          onClick={() => handleTogglePromoActive(p._id)}
                        >
                          {p.active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px 10px", width: "auto", margin: 0, color: "var(--danger)" }}
                          title="Delete"
                          onClick={() => handleDeletePromo(p._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div className="section-panel animate-fade-in" style={{ width: "100%", maxWidth: "580px", margin: 20, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Tag size={22} style={{ color: "var(--primary)" }} /> Create New Promo Offer
            </h3>
            
            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Promo Code *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. PAW20"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Offer Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Get 20% Off"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
                  <label className="form-label">Offer Description *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Valid on first service booking on the app"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="input-field"
                    style={{ background: "var(--bg-secondary)", color: "#fff" }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Price (₹)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Min Order Value (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Discount (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Optional limit"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Total Usage Limit</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 100 uses"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
                  <label className="form-label">Banner Image URL (optional)</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "span 2", marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="displayOnHome"
                    checked={displayOnHome}
                    onChange={(e) => setDisplayOnHome(e.target.checked)}
                    style={{ cursor: "pointer", width: 18, height: 18 }}
                  />
                  <label htmlFor="displayOnHome" style={{ fontSize: "13px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                    Display as Banner on Customer App Home Screen
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn-secondary" style={{ width: "auto", margin: 0 }} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: "auto", margin: 0 }}>
                  Create Promo Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <div className="section-panel animate-fade-in" style={{ width: "100%", maxWidth: "580px", margin: 20, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <Edit2 size={22} style={{ color: "var(--primary)" }} /> Modify Promo Offer Details
            </h3>
            
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Promo Code *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Offer Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
                  <label className="form-label">Offer Description *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="input-field"
                    style={{ background: "var(--bg-secondary)", color: "#fff" }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Price (₹)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Discount Value *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Min Order Value (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Discount (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Total Usage Limit</label>
                  <input
                    type="number"
                    className="input-field"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
                  <label className="form-label">Banner Image URL (optional)</label>
                  <input
                    type="url"
                    className="input-field"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "span 2", marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="editDisplayOnHome"
                    checked={displayOnHome}
                    onChange={(e) => setDisplayOnHome(e.target.checked)}
                    style={{ cursor: "pointer", width: 18, height: 18 }}
                  />
                  <label htmlFor="editDisplayOnHome" style={{ fontSize: "13px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                    Display as Banner on Customer App Home Screen
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn-secondary" style={{ width: "auto", margin: 0 }} onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: "auto", margin: 0 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Promos;
