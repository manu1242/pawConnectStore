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
  DollarSign
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function VetClinic() {
  const { store, user, dataLoading, updateStore, registerStore } = useStore();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    address: "",
    is24x7: false,
    emergencyContact: "",
    emergencyCharges: 0,
    doctors: []
  });

  // Temp state for adding a doctor
  const [newDoc, setNewDoc] = useState({
    name: "",
    specialty: "",
    experience: ""
  });

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        description: store.description || "",
        phone: store.phone || "",
        address: store.address || "",
        is24x7: store.is24x7 || false,
        emergencyContact: store.emergencyContact || "",
        emergencyCharges: store.emergencyCharges || 0,
        doctors: store.doctors || []
      });
    } else if (user) {
      // Initialize with user profile defaults if no store exists yet
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

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDoc.name.trim() || !newDoc.specialty.trim() || !newDoc.experience.trim()) {
      return;
    }
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

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (store) {
      // Update existing store
      const success = await updateStore({
        ...formData,
        category: "Vet Clinic",
        storeTypes: ["Veterinary", "Emergency Care"]
      });
      if (success) {
        setIsEditing(false);
      }
    } else {
      // Register brand new store for the user
      const payload = {
        name: formData.name,
        description: formData.description || "Specialized Veterinary Clinic and emergency services.",
        phone: formData.phone,
        address: formData.address,
        categories: ["Veterinary", "Emergency Care"],
        storeTypes: ["Veterinary", "Emergency Care"],
        category: "Vet Clinic",
        is24x7: formData.is24x7,
        emergencyContact: formData.emergencyContact || formData.phone,
        emergencyCharges: Number(formData.emergencyCharges) || 0,
        doctors: formData.doctors,
        ownerDetails: {
          name: user?.fullName || "Owner",
          fullName: user?.fullName || "Owner",
          email: user?.email || "",
          phone: user?.phone || formData.phone || ""
        },
        addressDetails: {
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          country: "India"
        },
        location: {
          coordinates: [77.5946, 12.9716] // Default Bangalore coords
        },
        services: [
          {
            name: "General Consultation",
            category: "Veterinary",
            description: "Routine health checkup and consultation.",
            price: 500
          }
        ],
        paymentMethods: ["UPI", "Cash", "Card"]
      };

      const success = await registerStore(payload);
      if (success) {
        setIsEditing(false);
      }
    }
  };

  if (dataLoading) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
        <p>Loading your Veterinary Clinic details...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>🏥 Veterinary Clinic Settings</h1>
          <p>Manage clinic details, senior doctors list, and configure real-time emergency services.</p>
        </div>
        <button 
          className={isEditing ? "btn-secondary" : "btn-primary"} 
          style={{ width: "auto", margin: 0, padding: "10px 24px" }}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Edit Clinic Info"}
        </button>
      </div>

      <div className="store-profile-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        
        {/* Left Column: Clinic details and Emergency Info */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* General Vet Clinic Settings */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <Stethoscope size={20} style={{ color: "var(--primary)" }} />
              Clinic Information
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group" style={{ margin: 0 }}>
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

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Clinic Description</label>
                <textarea
                  name="description"
                  className="input-field"
                  style={{ minHeight: 100, resize: "vertical" }}
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Describe your medical specialities, trauma facilities, etc."
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

          {/* Emergency & Live matching */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <HeartPulse size={20} style={{ color: "var(--danger)" }} />
              Emergency & Triage Settings
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
                  🚨 Live 24/7 Emergency Admissions Open
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Emergency Hotline</label>
                  <div style={{ position: "relative" }}>
                    <Phone size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                    <input
                      type="text"
                      name="emergencyContact"
                      className="input-field"
                      style={{ paddingLeft: 42 }}
                      placeholder="e.g. +91 99999 88888"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Emergency Admission Charges (₹)</label>
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
              Save Clinic Settings
            </button>
          )}
        </form>

        {/* Right Column: Senior Veterinary Doctors */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <Activity size={20} style={{ color: "var(--success)" }} />
              Senior Veterinary Doctors
            </h3>

            {/* Doctor list table/cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {formData.doctors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-tertiary)", background: "var(--bg-secondary)", borderRadius: 12, border: "1px dashed var(--border-color)" }}>
                  <ShieldAlert size={36} style={{ margin: "0 auto 10px", color: "var(--text-tertiary)" }} />
                  <p style={{ fontWeight: 600 }}>No Senior Doctors Listed</p>
                  <p style={{ fontSize: 12, marginTop: 4 }}>Add doctors below to show them on the patient app.</p>
                </div>
              ) : (
                formData.doctors.map((doc, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      background: "var(--bg-secondary)", 
                      padding: "14px 18px", 
                      borderRadius: 12, 
                      border: "1px solid var(--border-color)" 
                    }}
                  >
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

            {/* Form to add a new doctor (Only visible in edit mode) */}
            {isEditing && (
              <div style={{ background: "var(--bg-tertiary)", padding: 20, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>Add Senior Doctor</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Doctor's Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Dr. Ananya Sharma, DVM"
                      value={newDoc.name}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Medical Speciality</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. Emergency Surgery & Trauma Specialist"
                      value={newDoc.specialty}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: 11 }}>Experience / Qualifications</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. 12+ Years Experience"
                      value={newDoc.experience}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </div>

                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleAddDoctor}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: 6, 
                      marginTop: 6,
                      fontSize: 13,
                      padding: 10
                    }}
                  >
                    <Plus size={16} /> Add Doctor Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default VetClinic;
