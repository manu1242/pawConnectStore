import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Clock,
  Check,
  Home,
  Shield,
  Percent,
  Sparkles
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { parseService, serializeService } from "../../utils/serviceHelper";

function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, updateStore } = useStore();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "Pet Grooming",
    image: "",
    description: "",
    price: "",
    offerEnabled: false,
    offerType: "",
    offerTitle: "",
    discountAmount: "",
    duration: "60 min",
    petTypes: ["All Pets"],
    includes: [""],
    homeServiceAvailable: false,
    emergencyAvailable: false,
    active: true
  });

  // Load existing service if in edit mode
  useEffect(() => {
    if (isEditMode && store) {
      const rawServices = store.services || [];
      const foundRaw = rawServices.find(s => s._id === id);
      if (foundRaw) {
        const parsed = parseService(foundRaw);
        setFormData({
          _id: parsed._id,
          name: parsed.name || "",
          category: parsed.category || "Pet Grooming",
          image: parsed.image || parsed.photo || "",
          description: parsed.description || "",
          price: parsed.price || "",
          offerEnabled: parsed.offerEnabled || false,
          offerType: parsed.offerType || "",
          offerTitle: parsed.offerTitle || "",
          discountAmount: parsed.discountAmount || "",
          duration: parsed.duration || "60 min",
          petTypes: parsed.petTypes?.length ? parsed.petTypes : ["All Pets"],
          includes: parsed.includes?.length ? parsed.includes : [""],
          homeServiceAvailable: parsed.homeServiceAvailable || false,
          emergencyAvailable: parsed.emergencyAvailable || false,
          active: parsed.active !== undefined ? parsed.active : true,
        });
      }
    }
  }, [id, isEditMode, store]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handlePetTypeToggle = (type) => {
    setFormData(prev => {
      let updatedList;
      if (type === "All Pets") {
        updatedList = ["All Pets"];
      } else {
        const withoutAll = prev.petTypes.filter(t => t !== "All Pets");
        if (withoutAll.includes(type)) {
          updatedList = withoutAll.filter(t => t !== type);
          if (updatedList.length === 0) {
            updatedList = ["All Pets"];
          }
        } else {
          updatedList = [...withoutAll, type];
        }
      }
      return { ...prev, petTypes: updatedList };
    });
  };

  // List field helpers (What We Offer)
  const handleListChange = (index, value) => {
    setFormData(prev => {
      const list = [...prev.includes];
      list[index] = value;
      return { ...prev, includes: list };
    });
  };

  const addListItem = () => {
    setFormData(prev => ({ ...prev, includes: [...prev.includes, ""] }));
  };

  const removeListItem = (index) => {
    setFormData(prev => {
      const list = prev.includes.filter((_, idx) => idx !== index);
      return { ...prev, includes: list.length ? list : [""] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please enter a service name.");
      return;
    }
    if (!formData.category) {
      alert("Please select a service category.");
      return;
    }
    if (!formData.description) {
      alert("Please enter a service description.");
      return;
    }
    if (!formData.price) {
      alert("Please enter the price.");
      return;
    }
    if (!formData.duration) {
      alert("Please enter the duration.");
      return;
    }
    if (!formData.petTypes || formData.petTypes.length === 0) {
      alert("Please select at least one suitable pet type.");
      return;
    }

    setLoading(true);
    try {
      const rawServices = store?.services || [];
      
      const priceNum = Number(formData.price);
      const oe = formData.offerEnabled;
      const da = oe ? Number(formData.discountAmount || 0) : 0;
      const finalPrice = oe ? Math.max(0, priceNum - da) : priceNum;

      const cleanedForm = {
        ...formData,
        price: priceNum,
        offerEnabled: oe,
        discountAmount: da,
        finalPrice,
        includes: formData.includes.filter(i => i.trim() !== ""),
        petTypes: formData.petTypes
      };

      const serialized = serializeService(cleanedForm);

      let updatedServices;
      if (isEditMode) {
        updatedServices = rawServices.map(s => s._id === id ? serialized : s);
      } else {
        updatedServices = [...rawServices, { ...serialized, _id: undefined }];
      }

      const success = await updateStore({ services: updatedServices });
      if (success) {
        navigate("/services");
      }
    } catch (err) {
      console.error("Failed to save service:", err);
      alert("An error occurred while saving the service.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "Pet Grooming",
    "Veterinary Clinic",
    "Pet Boarding",
    "Pet Day Care",
    "Pet Training",
    "Pet Walking",
    "Pet Sitting",
    "Pet Taxi",
    "Emergency Pet Care",
    "Others"
  ];

  const offerTypes = [
    "Discount",
    "Festival Offer",
    "Summer Special",
    "Winter Special",
    "Weekend Offer",
    "New Customer Offer"
  ];

  const petTypesOptions = [
    "Dogs",
    "Cats",
    "Birds",
    "Fish",
    "Rabbits",
    "All Pets"
  ];

  // Calculated values for UI
  const origPrice = parseFloat(formData.price) || 0;
  const discAmount = formData.offerEnabled ? (parseFloat(formData.discountAmount) || 0) : 0;
  const finalPrice = Math.max(0, origPrice - discAmount);

  const getPlaceholderImage = (category, srvName) => {
    const name = (srvName || "").toLowerCase();
    const cat = (category || "").toLowerCase();
    if (name.includes("groom") || cat.includes("groom")) {
      return "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("vet") || cat.includes("vet") || name.includes("clinic") || name.includes("health")) {
      return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80";
    }
    if (name.includes("board") || cat.includes("board") || name.includes("stay") || name.includes("hotel")) {
      return "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=600&q=80";
    }
    return "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80";
  };

  const previewImage = formData.image || getPlaceholderImage(formData.category, formData.name);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <Link to="/services" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={16} />
          Back to Services
        </Link>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
          {isEditMode ? "Edit Service" : "Add New Service"}
        </h1>
      </div>

      {/* Grid Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, alignItems: "start" }}>
        
        {/* Form Column */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Card 1: Service Information */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 12, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} />
              Service Information
            </h3>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Service Name *</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="e.g., Premium Dog Grooming"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Service Category *</label>
                <select
                  name="category"
                  className="input-field"
                  style={{ background: "var(--bg-tertiary)", color: "#fff" }}
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Duration (required) *</label>
                <input
                  type="text"
                  name="duration"
                  className="input-field"
                  placeholder="e.g., 60 Minutes"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Service Image URL (optional)</label>
              <input
                type="url"
                name="image"
                className="input-field"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Service Description *</label>
              <textarea
                name="description"
                className="input-field"
                style={{ minHeight: 100, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Describe what this service entails and any important details for pet parents..."
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Card 2: Pricing */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 12, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <Percent size={18} style={{ color: "var(--primary)" }} />
              Pricing & Offers
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20, alignItems: "center" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Original Price *</label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span style={{ position: "absolute", left: 16, color: "var(--text-secondary)", fontWeight: 700 }}>₹</span>
                  <input
                    type="number"
                    name="price"
                    className="input-field"
                    style={{ paddingLeft: 32 }}
                    placeholder="500"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Enable Offer</label>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, offerEnabled: true }))}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: formData.offerEnabled ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                      backgroundColor: formData.offerEnabled ? "var(--primary-light)" : "var(--bg-tertiary)",
                      color: formData.offerEnabled ? "var(--primary)" : "var(--text-secondary)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, offerEnabled: false }))}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      border: !formData.offerEnabled ? "1px solid var(--border-color)" : "1px solid var(--border-color)",
                      backgroundColor: !formData.offerEnabled ? "rgba(239, 68, 68, 0.15)" : "var(--bg-tertiary)",
                      color: !formData.offerEnabled ? "#ef4444" : "var(--text-secondary)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {formData.offerEnabled && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20, backgroundColor: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px dashed var(--border-color)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Offer Type *</label>
                    <select
                      name="offerType"
                      className="input-field"
                      style={{ background: "var(--bg-tertiary)", color: "#fff" }}
                      value={formData.offerType}
                      onChange={handleInputChange}
                      required={formData.offerEnabled}
                    >
                      <option value="">Select type...</option>
                      {offerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Discount Amount *</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <span style={{ position: "absolute", left: 16, color: "var(--text-secondary)", fontWeight: 700 }}>₹</span>
                      <input
                        type="number"
                        name="discountAmount"
                        className="input-field"
                        style={{ paddingLeft: 32 }}
                        placeholder="100"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                        required={formData.offerEnabled}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Offer Title *</label>
                  <input
                    type="text"
                    name="offerTitle"
                    className="input-field"
                    placeholder="e.g., Festival Offer"
                    value={formData.offerTitle}
                    onChange={handleInputChange}
                    required={formData.offerEnabled}
                  />
                </div>

                {/* Final Calculation Summary */}
                {origPrice > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(16, 185, 129, 0.08)", padding: "12px 18px", borderRadius: 12, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>Calculated Client Price:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, color: "var(--text-tertiary)", textDecoration: "line-through" }}>₹{origPrice}</span>
                      <span style={{ fontSize: 18, color: "#10b981", fontWeight: 900 }}>₹{finalPrice}</span>
                      <span style={{ fontSize: 11, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 6px", borderRadius: 6, fontWeight: 700 }}>
                        Save ₹{discAmount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card 3: Suitable Pet Types */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 12, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={18} style={{ color: "var(--primary)" }} />
              Suitable Pet Types (required) *
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {petTypesOptions.map(option => {
                const isSelected = formData.petTypes.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handlePetTypeToggle(option)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                      backgroundColor: isSelected ? "var(--primary-light)" : "var(--bg-tertiary)",
                      color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                      transition: "all 0.2s ease",
                      textAlign: "center"
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: What We Offer */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 12, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <Check size={18} style={{ color: "var(--primary)" }} />
              What We Offer
            </h3>
            
            <p style={{ margin: "-8px 0 4px 0", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              List the specific features or items included in this service package (e.g. Bath, Nail Trimming, Ear Cleaning).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {formData.includes.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: 14 }}>{idx + 1}.</span>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Nail Trimming"
                    value={item}
                    onChange={(e) => handleListChange(idx, e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="btn-icon btn-icon-danger" 
                    style={{ height: 48, width: 48, flexShrink: 0 }} 
                    onClick={() => removeListItem(idx)}
                    disabled={formData.includes.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              className="btn-secondary" 
              style={{ width: "auto", alignSelf: "flex-start", padding: "8px 18px", fontSize: 12 }} 
              onClick={addListItem}
            >
              <Plus size={14} style={{ marginRight: 6 }} />
              Add Item
            </button>
          </div>

          {/* Card 5: Service Options & Status */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 16, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 12, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <Home size={18} style={{ color: "var(--primary)" }} />
              Availability & Status
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {/* Home Service Available */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Home Service Available</label>
                <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, homeServiceAvailable: true }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: formData.homeServiceAvailable ? "var(--primary-light)" : "var(--bg-tertiary)",
                      color: formData.homeServiceAvailable ? "var(--primary)" : "var(--text-secondary)"
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, homeServiceAvailable: false }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: !formData.homeServiceAvailable ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                      color: !formData.homeServiceAvailable ? "var(--text-secondary)" : "var(--text-tertiary)"
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Emergency Service Available */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Emergency Available</label>
                <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, emergencyAvailable: true }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: formData.emergencyAvailable ? "var(--primary-light)" : "var(--bg-tertiary)",
                      color: formData.emergencyAvailable ? "var(--primary)" : "var(--text-secondary)"
                    }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, emergencyAvailable: false }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: !formData.emergencyAvailable ? "var(--bg-secondary)" : "var(--bg-tertiary)",
                      color: !formData.emergencyAvailable ? "var(--text-secondary)" : "var(--text-tertiary)"
                    }}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Active Status */}
              <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>Status</label>
                <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, active: true }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: formData.active ? "var(--success-light)" : "var(--bg-tertiary)",
                      color: formData.active ? "var(--success)" : "var(--text-secondary)"
                    }}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, active: false }))}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "none",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: !formData.active ? "rgba(239, 68, 68, 0.15)" : "var(--bg-tertiary)",
                      color: !formData.active ? "#ef4444" : "var(--text-secondary)"
                    }}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, marginTop: 8 }}>
            <Link to="/services" className="btn-secondary" style={{ width: "auto", margin: 0, padding: "12px 28px" }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "auto", margin: 0, padding: "12px 28px", display: "flex", alignItems: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Service
                </>
              )}
            </button>
          </div>

        </form>

        {/* Live Preview Column */}
        <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: 12, background: "rgba(255, 107, 53, 0.08)", border: "1px solid var(--primary-light)", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>Live Client Card Preview</span>
          </div>

          <div className="service-card" style={{ width: "100%", margin: 0, overflow: "hidden", background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)" }}>
            <div className="service-card-image" style={{ height: 200, position: "relative" }}>
              <img 
                src={previewImage} 
                alt="Service Preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80";
                }}
              />
              
              {formData.offerEnabled && formData.offerTitle && (
                <span className="service-discount-badge" style={{ backgroundColor: "#10b981", color: "#fff", position: "absolute", top: 12, left: 12, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                  {formData.offerTitle}
                </span>
              )}
              
              <div className="service-status-floating" style={{ position: "absolute", top: 12, right: 12 }}>
                <span className={`badge ${formData.active ? "badge-confirmed" : "badge-cancelled"}`} style={{ fontSize: "10px" }}>
                  {formData.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="service-card-body" style={{ padding: 24 }}>
              <span className="service-card-category" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--primary)", display: "block", marginBottom: 6 }}>
                {formData.category || "General Pet Care"}
              </span>

              <h3 className="service-card-title" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px 0", color: "#fff" }}>
                {formData.name || "Service Name Placeholder"}
              </h3>

              <p className="service-card-desc" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px 0", minHeight: 40 }}>
                {formData.description || "Enter a description on the left to see it update here in real-time."}
              </p>

              <div className="service-card-meta" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-tertiary)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "12px 0", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} />
                  <span>Duration: <strong style={{ color: "#fff" }}>{formData.duration || "60 Minutes"}</strong></span>
                </div>
                <div>
                  Suitable For: <strong style={{ color: "#fff" }}>{formData.petTypes.join(", ")}</strong>
                </div>
              </div>

              {/* Inclusions List */}
              {formData.includes.filter(i => i.trim() !== "").length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                    Includes:
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {formData.includes.filter(i => i.trim() !== "").map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                        <span style={{ color: "#10b981" }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {formData.homeServiceAvailable && (
                  <span style={{ fontSize: 10, background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                    Home Service Available
                  </span>
                )}
                {formData.emergencyAvailable && (
                  <span style={{ fontSize: 10, background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                    Emergency Service Available
                  </span>
                )}
              </div>

              {/* Pricing Section */}
              <div className="service-card-pricing" style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border-color)", paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="price-offer" style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                      ₹{finalPrice}
                    </span>
                    {formData.offerEnabled && discAmount > 0 && (
                      <span className="price-original" style={{ fontSize: 14, color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                        ₹{origPrice}
                      </span>
                    )}
                  </div>
                  {formData.offerEnabled && discAmount > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                      Save ₹{discAmount}
                    </span>
                  )}
                </div>

                <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 8, pointerEvents: "none", cursor: "default" }}>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ServiceForm;
