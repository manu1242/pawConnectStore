import React, { useState, useEffect } from "react";
import { 
  Store, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldAlert, 
  Loader2, 
  Save, 
  Plus, 
  Trash2,
  Check
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function StoreProfile() {
  const { store, dataLoading, updateStore, API_BASE } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    availableDays: [],
    availableTimes: [],
    facilities: []
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        description: store.description || "",
        phone: store.phone || "",
        address: store.address || "",
        availableDays: store.availableDays || [],
        availableTimes: store.availableTimes || [],
        facilities: store.facilities || []
      });
    }
  }, [store]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const isSelected = prev.availableDays.includes(day);
      const updated = isSelected 
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const success = await updateStore(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
        <p>Loading your store profile...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="page-container animate-fade-in">
        <div className="section-panel" style={{ padding: 60, textAlign: "center" }}>
          <ShieldAlert size={64} style={{ color: "var(--warning)", marginBottom: 20 }} />
          <h2>No Store Profile Found</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8, maxWidth: 460, margin: "8px auto 24px" }}>
            It looks like this account hasn't completed business onboarding. Please use the mobile application onboarding flow to register your store first.
          </p>
        </div>
      </div>
    );
  }

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Store Profile Settings</h1>
          <p>Configure your business information, hours of operation, and details visible to clients.</p>
        </div>
        <button 
          className={isEditing ? "btn-secondary" : "btn-primary"} 
          style={{ width: "auto", margin: 0, padding: "10px 24px" }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel Editing" : "Edit Details"}
        </button>
      </div>

      <div className="store-profile-layout">
        {/* Left column - Logo, Gallery, Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="store-logo-box">
            {store.logo ? (
              <img src={store.logo} alt="Store Logo" className="store-logo-img" />
            ) : (
              <div className="store-logo-placeholder">🏥</div>
            )}
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{store.name}</h3>
            <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>ID: {store._id}</p>
          </div>

          <div className="section-panel" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Store Gallery</h4>
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
        </div>

        {/* Right column - Editable Form */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* General Information */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <Store size={20} style={{ color: "var(--primary)" }} />
              General Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  name="name"
                  className="input-field"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Business Description</label>
                <textarea
                  name="description"
                  className="input-field"
                  style={{ minHeight: 120, resize: "vertical" }}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Describe your store services, staff experience, atmosphere, etc."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Contact Number</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                    <input
                      type="text"
                      name="phone"
                      className="input-field"
                      style={{ paddingLeft: 42 }}
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Address</label>
                  <div style={{ position: "relative" }}>
                    <MapPin size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                    <input
                      type="text"
                      name="address"
                      className="input-field"
                      style={{ paddingLeft: 42 }}
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <Clock size={20} style={{ color: "var(--primary)" }} />
              Schedule & Availability
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <span className="form-label" style={{ marginBottom: 12 }}>Available Days</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {daysOfWeek.map((day) => {
                    const isSelected = formData.availableDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => isEditing && toggleDay(day)}
                        style={{
                          backgroundColor: isSelected ? "var(--primary-light)" : "var(--bg-tertiary)",
                          color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                          border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                          borderRadius: 20,
                          padding: "8px 16px",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: isEditing ? "pointer" : "default",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="form-label" style={{ marginBottom: 12 }}>Available Time Slots</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formData.availableTimes.map((time, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        background: "var(--bg-tertiary)", 
                        color: "var(--text-secondary)", 
                        border: "1px solid var(--border-color)", 
                        padding: "6px 14px", 
                        borderRadius: "20px", 
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                      }}
                    >
                      <Clock size={12} /> {time}
                    </span>
                  ))}
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic", alignSelf: "center" }}>
                    Configure hourly slots in mobile app settings.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              type="submit"
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 16,
                fontSize: 16
              }}
            >
              <Save size={20} />
              Save Settings Changes
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default StoreProfile;
