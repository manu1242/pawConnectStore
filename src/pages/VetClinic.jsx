import React, { useState, useEffect } from "react";
import { 
  HeartPulse, 
  Stethoscope, 
  Phone, 
  MapPin, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  Activity,
  DollarSign,
  Image as ImageIcon,
  Compass,
  Briefcase,
  CheckCircle,
  XCircle,
  FileText
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function VetClinic() {
  const { store, user, dataLoading, updateStore, registerStore } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "Vet Clinic",
    logo: "",
    bannerImage: "",
    gallery: [],
    phone: "",
    address: "",
    addressDetails: {
      city: "",
      pincode: "",
      state: "Karnataka",
      country: "India"
    },
    latitude: 12.9716,
    longitude: 77.5946,
    description: "",
    is24x7: false,
    emergencyContact: "",
    emergencyCharges: 0,
    doctors: [],
    services: []
  });

  // Temp states for adding items
  const [galleryInput, setGalleryInput] = useState("");
  const [newDoc, setNewDoc] = useState({ name: "", specialty: "", experience: "" });
  const [newService, setNewService] = useState({
    name: "",
    category: "Veterinary",
    price: 0,
    description: "",
    active: true
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        category: store.category || "Vet Clinic",
        logo: store.logo || "",
        bannerImage: store.bannerImage || store.banner || "",
        gallery: store.gallery || [],
        phone: store.phone || "",
        address: typeof store.address === "string" ? store.address : (store.address?.street || ""),
        addressDetails: {
          city: store.addressDetails?.city || store.address?.city || "",
          pincode: store.addressDetails?.pincode || store.address?.pincode || "",
          state: store.addressDetails?.state || store.address?.state || "Karnataka",
          country: store.addressDetails?.country || store.address?.country || "India"
        },
        latitude: store.latitude || store.location?.coordinates?.[1] || 12.9716,
        longitude: store.longitude || store.location?.coordinates?.[0] || 77.5946,
        description: store.description || "",
        is24x7: store.is24x7 || false,
        emergencyContact: store.emergencyContact || "",
        emergencyCharges: store.emergencyCharges || 0,
        doctors: store.doctors || [],
        services: store.services || []
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: `${user.fullName}'s Veterinary Clinic`,
        phone: user.phone || ""
      }));
    }
  }, [store, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNestedInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      addressDetails: {
        ...prev.addressDetails,
        [name]: value
      }
    }));
  };

  // Gallery Helpers
  const handleAddGalleryUrl = (e) => {
    e.preventDefault();
    if (!galleryInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, galleryInput.trim()]
    }));
    setGalleryInput("");
  };

  const handleRemoveGalleryUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index)
    }));
  };

  // Doctor Helpers
  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim() || !newDoc.specialty.trim() || !newDoc.experience.trim()) return;
    setFormData(prev => ({
      ...prev,
      doctors: [...prev.doctors, { ...newDoc }]
    }));
    setNewDoc({ name: "", specialty: "", experience: "" });
  };

  const handleRemoveDoctor = (index) => {
    setFormData(prev => ({
      ...prev,
      doctors: prev.doctors.filter((_, idx) => idx !== index)
    }));
  };

  // Service Helpers
  const handleAddService = (e) => {
    e.preventDefault();
    if (!newService.name.trim() || !newService.category.trim()) return;
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { ...newService, price: Number(newService.price) || 0 }]
    }));
    setNewService({
      name: "",
      category: "Veterinary",
      price: 0,
      description: "",
      active: true
    });
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, idx) => idx !== index)
    }));
  };

  const handleToggleServiceActive = (index) => {
    setFormData(prev => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], active: !updated[index].active };
      return { ...prev, services: updated };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Prepare complete payload structure matching backend schema
    const payload = {
      name: formData.name,
      category: formData.category,
      logo: formData.logo,
      bannerImage: formData.bannerImage,
      gallery: formData.gallery,
      phone: formData.phone,
      address: formData.address,
      addressDetails: {
        city: formData.addressDetails.city,
        pincode: formData.addressDetails.pincode,
        state: formData.addressDetails.state || "Karnataka",
        country: formData.addressDetails.country || "India"
      },
      latitude: Number(formData.latitude) || 12.9716,
      longitude: Number(formData.longitude) || 77.5946,
      location: {
        type: "Point",
        coordinates: [Number(formData.longitude) || 77.5946, Number(formData.latitude) || 12.9716]
      },
      description: formData.description,
      is24x7: formData.is24x7,
      emergencyContact: formData.emergencyContact || formData.phone,
      emergencyCharges: Number(formData.emergencyCharges) || 0,
      doctors: formData.doctors,
      services: formData.services.map(s => ({
        name: s.name,
        category: s.category || "Veterinary",
        price: Number(s.price) || 0,
        description: s.description || "",
        active: s.active !== undefined ? s.active : true
      })),
      storeTypes: ["Veterinary", "Emergency Care"]
    };

    if (store) {
      const success = await updateStore(payload);
      if (success) setIsEditing(false);
    } else {
      // Create new store with initial manager details
      const registrationPayload = {
        ...payload,
        ownerDetails: {
          name: user?.fullName || "Owner",
          fullName: user?.fullName || "Owner",
          email: user?.email || "",
          phone: user?.phone || formData.phone || ""
        },
        categories: ["Veterinary", "Emergency Care"],
        paymentMethods: ["UPI", "Cash", "Card"]
      };
      const success = await registerStore(registrationPayload);
      if (success) setIsEditing(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
        <p>Fetching Veterinary Clinic settings...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>🏥 Veterinary Clinic Settings</h1>
          <p>Configure emergency triage, list active treatments, manage senior doctors, and set coordinates.</p>
        </div>
        <button 
          className={isEditing ? "btn-secondary" : "btn-primary"} 
          style={{ width: "auto", margin: 0, padding: "10px 24px" }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Clinic Info"}
        </button>
      </div>

      {/* Clinic Status Alert Banner */}
      <div style={{ margin: "16px 0 24px" }}>
        {!store ? (
          <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>ℹ️</span>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#fff" }}>Onboarding Required</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Set up your clinic profile details below. Once registered, it will be sent to the Admin for approval.</p>
            </div>
          </div>
        ) : store.status === "pending" ? (
          <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#fff" }}>Pending Admin Approval</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Your Veterinary Clinic details are under review. Once approved by the PawConnect Admin, it will immediately appear in the Emergency section of the customer mobile app.</p>
            </div>
          </div>
        ) : store.status === "approved" ? (
          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#fff" }}>Clinic Profile Active</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Your clinic is approved and visible in the Emergency section of the customer mobile app.</p>
            </div>
          </div>
        ) : (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>❌</span>
            <div>
              <h4 style={{ margin: 0, fontWeight: 700, color: "#fff" }}>Clinic Profile Suspended / Rejected</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Your clinic details have been suspended or rejected. Please contact support or update your credentials.</p>
              {store.rejectionReason && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}><strong>Reason:</strong> {store.rejectionReason}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: "flex", gap: 10, margin: "20px 0 24px", borderBottom: "1px solid var(--border-color)", paddingBottom: 10 }}>
        {[
          { id: "basic", label: "Basic Info", icon: FileText },
          { id: "location", label: "Location & Contact", icon: MapPin },
          { id: "emergency", label: "Emergency & Triage", icon: HeartPulse },
          { id: "doctors", label: "Senior Doctors", icon: Activity },
          { id: "services", label: "Services Catalog", icon: Stethoscope }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: activeTab === tab.id ? "var(--primary)" : "transparent",
                border: "none",
                color: activeTab === tab.id ? "#fff" : "var(--text-secondary)",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        <div className="section-panel" style={{ padding: 28, marginBottom: 24 }}>
          
          {/* Tab 1: Basic Information */}
          {activeTab === "basic" && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <FileText size={20} style={{ color: "var(--primary)" }} />
                General Clinic Profile
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Clinic Name</label>
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

                <div className="form-group">
                  <label className="form-label">Search Category Identifier</label>
                  <input
                    type="text"
                    name="category"
                    className="input-field"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Vet Clinic"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinic Profile Description</label>
                  <textarea
                    name="description"
                    className="input-field"
                    style={{ minHeight: 120 }}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide information regarding medical equipment, clinic specialities, and general guidelines."
                    disabled={!isEditing}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Logo Image URL</label>
                    <input
                      type="text"
                      name="logo"
                      className="input-field"
                      value={formData.logo}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Banner Image URL</label>
                    <input
                      type="text"
                      name="bannerImage"
                      className="input-field"
                      value={formData.bannerImage}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Facilities / Gallery */}
                <div style={{ marginTop: 10 }}>
                  <label className="form-label">Facilities Gallery URLs</label>
                  {isEditing && (
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Paste image URL here"
                        value={galleryInput}
                        onChange={(e) => setGalleryInput(e.target.value)}
                      />
                      <button type="button" onClick={handleAddGalleryUrl} className="btn-secondary" style={{ width: "auto", margin: 0, whiteSpace: "nowrap" }}>
                        <Plus size={16} /> Add Image
                      </button>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {formData.gallery.length === 0 ? (
                      <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>No gallery photos added yet.</p>
                    ) : (
                      formData.gallery.map((url, idx) => (
                        <div key={idx} style={{ position: "relative", width: 100, height: 100, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                          <img src={url} alt={`Gallery ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryUrl(idx)}
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(239, 68, 68, 0.9)",
                                border: "none",
                                borderRadius: "50%",
                                color: "#fff",
                                width: 20,
                                height: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                              }}
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Location & Contact */}
          {activeTab === "location" && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <MapPin size={20} style={{ color: "var(--primary)" }} />
                Address, Contact & Coordinates
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div className="form-group">
                  <label className="form-label">Hotline Contact Number</label>
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

                <div className="form-group">
                  <label className="form-label">Physical Street Address</label>
                  <input
                    type="text"
                    name="address"
                    className="input-field"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. 742 Evergreen Terrace, Sector 4"
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      className="input-field"
                      value={formData.addressDetails.city}
                      onChange={handleNestedInputChange}
                      placeholder="e.g. Bangalore"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      className="input-field"
                      value={formData.addressDetails.pincode}
                      onChange={handleNestedInputChange}
                      placeholder="e.g. 560001"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "var(--bg-tertiary)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Compass size={14} style={{ color: "var(--primary)" }} /> Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      className="input-field"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Compass size={14} style={{ color: "var(--primary)" }} /> Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      className="input-field"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Emergency & Triage */}
          {activeTab === "emergency" && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <HeartPulse size={20} style={{ color: "var(--danger)" }} />
                Emergency Services & Admission settings
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-tertiary)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <input
                    type="checkbox"
                    id="is24x7"
                    name="is24x7"
                    checked={formData.is24x7}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    style={{ width: 20, height: 20, cursor: isEditing ? "pointer" : "default" }}
                  />
                  <label htmlFor="is24x7" style={{ fontWeight: 700, cursor: isEditing ? "pointer" : "default" }}>
                    🚨 Live 24/7 Emergency Admissions Active
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Dedicated Emergency Line</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      className="input-field"
                      placeholder="e.g. +91 99999 88888"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Emergency Admission / Consultant Charge (₹)</label>
                    <div style={{ position: "relative" }}>
                      <DollarSign size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                      <input
                        type="number"
                        name="emergencyCharges"
                        className="input-field"
                        style={{ paddingLeft: 42 }}
                        value={formData.emergencyCharges}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Senior Doctors */}
          {activeTab === "doctors" && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <Activity size={20} style={{ color: "var(--success)" }} />
                Senior Veterinary Doctors Directory
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {formData.doctors.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-tertiary)", background: "var(--bg-secondary)", borderRadius: 12, border: "1px dashed var(--border-color)" }}>
                    <ShieldAlert size={36} style={{ margin: "0 auto 10px", color: "var(--text-tertiary)" }} />
                    <p style={{ fontWeight: 600 }}>No Senior Doctors Profiled</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Add doctors using the form below to display them to patients.</p>
                  </div>
                ) : (
                  formData.doctors.map((doc, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                      <div>
                        <h4 style={{ fontWeight: 800, color: "#fff" }}>{doc.name}</h4>
                        <p style={{ fontSize: 13, color: "var(--primary)", fontWeight: 600, marginTop: 2 }}>{doc.specialty}</p>
                        <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>🎓 {doc.experience}</p>
                      </div>
                      {isEditing && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveDoctor(idx)}
                          style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 6 }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {isEditing && (
                <div style={{ background: "var(--bg-tertiary)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Register Doctor Details</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Doctor's Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Dr. Rajesh Kumar, DVM"
                        value={newDoc.name}
                        onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Speciality</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. Surgery, Cardiology"
                        value={newDoc.specialty}
                        onChange={(e) => setNewDoc(prev => ({ ...prev, specialty: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Experience & Background</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. 10+ Years Experience"
                      value={newDoc.experience}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </div>

                  <button type="button" className="btn-secondary" onClick={handleAddDoctor} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "auto", margin: 0, padding: "10px 20px" }}>
                    <Plus size={16} /> Add Doctor Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Services Catalog */}
          {activeTab === "services" && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
                <Stethoscope size={20} style={{ color: "var(--primary)" }} />
                Treatments & Veterinary Services List
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {formData.services.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-tertiary)", background: "var(--bg-secondary)", borderRadius: 12, border: "1px dashed var(--border-color)" }}>
                    <ShieldAlert size={36} style={{ margin: "0 auto 10px", color: "var(--text-tertiary)" }} />
                    <p style={{ fontWeight: 600 }}>No Active Services Listed</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Add clinical operations or tests below.</p>
                  </div>
                ) : (
                  formData.services.map((srv, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", padding: "14px 18px", borderRadius: 12, border: "1px solid var(--border-color)", opacity: srv.active === false ? 0.6 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <h4 style={{ fontWeight: 800, color: "#fff" }}>{srv.name}</h4>
                          <span style={{ fontSize: 10, background: "var(--bg-tertiary)", padding: "2px 8px", borderRadius: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{srv.category}</span>
                        </div>
                        {srv.description && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{srv.description}</p>}
                        <p style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700, marginTop: 4 }}>₹{srv.price}</p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button
                          type="button"
                          onClick={() => handleToggleServiceActive(idx)}
                          disabled={!isEditing}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: isEditing ? "pointer" : "default",
                            color: srv.active !== false ? "var(--success)" : "var(--text-tertiary)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          {srv.active !== false ? (
                            <>
                              <CheckCircle size={16} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={16} /> Inactive
                            </>
                          )}
                        </button>

                        {isEditing && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveService(idx)}
                            style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: 6 }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {isEditing && (
                <div style={{ background: "var(--bg-tertiary)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 14 }}>Add Treatment / Service</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Service Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. Rabies Vaccination, Emergency Surgery"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Category Path</label>
                      <select 
                        className="input-field" 
                        value={newService.category}
                        onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="Veterinary">Veterinary (General)</option>
                        <option value="Vet Clinic">Vet Clinic (Emergency)</option>
                        <option value="Emergency Care">Emergency Care</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 16, marginBottom: 16 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Rate / Price (₹)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="0"
                        value={newService.price || ""}
                        onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: 11 }}>Service Details / Description</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="e.g. Includes professional consultation and dosage"
                        value={newService.description}
                        onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button type="button" className="btn-secondary" onClick={handleAddService} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "auto", margin: 0, padding: "10px 20px" }}>
                    <Plus size={16} /> Add Service Entry
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {isEditing && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 32px",
                fontSize: 16,
                width: "auto"
              }}
            >
              <Save size={20} />
              Save Clinic Settings
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default VetClinic;
