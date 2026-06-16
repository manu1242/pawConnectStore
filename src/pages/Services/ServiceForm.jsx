import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Loader2, 
  Sparkles,
  Info,
  DollarSign,
  FileText,
  Clock,
  Shield,
  Search
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { parseService, serializeService } from "../../utils/serviceHelper";

function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { store, updateStore } = useStore();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "Pet Grooming",
    description: "",
    shortDescription: "",
    photo: "",
    images: [],
    video: "",
    originalPrice: "",
    offerPrice: "",
    discountPercentage: 0,
    taxIncluded: true,
    homeVisitCharges: 0,
    emergencyCharges: 0,
    weekendCharges: 0,
    festivalCharges: 0,
    duration: "60 min",
    suitableFor: "All Pets",
    petTypes: ["All Pets"],
    suitableBreeds: "",
    suitableAgeGroups: [],
    minWeight: 0,
    maxWeight: 0,
    includes: [""],
    notIncludes: [""],
    specialOffers: {
      limitedTimeOffer: false,
      buyOneGetOne: false,
      packageDiscounts: false,
      membershipDiscounts: false,
      couponCodes: []
    },
    availability: {
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      availableTimeSlots: ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"],
      maxBookingsPerDay: 10,
      homeServiceAvailable: false,
      storeVisitAvailable: true,
      emergencyBookingAvailable: false
    },
    requirementsBeforeService: [""],
    afterServiceCareInstructions: [""],
    cancellationPolicy: {
      freeCancellationBeforeHours: 24,
      cancellationCharges: 0
    },
    serviceStatus: "Active",
    ratingsAnalytics: {
      totalBookings: 0,
      averageRating: 5,
      reviewsCount: 0,
      revenueGenerated: 0
    },
    seoSearch: {
      keywords: [],
      tags: [],
      featuredService: false,
      popularServiceBadge: false
    }
  });

  // Load existing service if in edit mode
  useEffect(() => {
    if (isEditMode && store) {
      const rawServices = store.services || [];
      const foundRaw = rawServices.find(s => s._id === id);
      if (foundRaw) {
        const parsed = parseService(foundRaw);
        setFormData({
          ...parsed,
          originalPrice: parsed.originalPrice || parsed.price || "",
          offerPrice: parsed.offerPrice || parsed.price || "",
          includes: parsed.includes?.length ? parsed.includes : [""],
          notIncludes: parsed.notIncludes?.length ? parsed.notIncludes : [""],
          requirementsBeforeService: parsed.requirementsBeforeService?.length ? parsed.requirementsBeforeService : [""],
          afterServiceCareInstructions: parsed.afterServiceCareInstructions?.length ? parsed.afterServiceCareInstructions : [""],
        });
      }
    }
  }, [id, isEditMode, store]);

  // Auto-calculate discount percentage when original or offer price changes
  useEffect(() => {
    const orig = parseFloat(formData.originalPrice);
    const offer = parseFloat(formData.offerPrice);
    if (orig && offer && orig > offer) {
      const disc = Math.round(((orig - offer) / orig) * 100);
      setFormData(prev => ({ ...prev, discountPercentage: disc }));
    } else {
      setFormData(prev => ({ ...prev, discountPercentage: 0 }));
    }
  }, [formData.originalPrice, formData.offerPrice]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // List field helpers (inclusions, exclusions, requirements, care instructions)
  const handleListChange = (field, index, value) => {
    setFormData(prev => {
      const list = [...prev[field]];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeListItem = (field, index) => {
    setFormData(prev => {
      const list = prev[field].filter((_, idx) => idx !== index);
      return { ...prev, [field]: list.length ? list : [""] };
    });
  };

  // Checkbox groups (Days, Age Groups, Pet Types)
  const toggleCheckboxInArray = (field, item) => {
    setFormData(prev => {
      const list = [...prev[field]];
      const isSelected = list.includes(item);
      const updated = isSelected ? list.filter(i => i !== item) : [...list, item];
      return { ...prev, [field]: updated };
    });
  };

  const toggleAvailabilityDay = (day) => {
    const list = [...formData.availability.availableDays];
    const isSelected = list.includes(day);
    const updated = isSelected ? list.filter(d => d !== day) : [...list, day];
    handleNestedChange("availability", "availableDays", updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.offerPrice) {
      alert("Please enter a service name and price.");
      return;
    }

    setLoading(true);
    try {
      const rawServices = store?.services || [];
      
      // Clean lists from empty values
      const cleanedForm = {
        ...formData,
        price: Number(formData.offerPrice), // sync price with offer price
        includes: formData.includes.filter(i => i.trim() !== ""),
        notIncludes: formData.notIncludes.filter(i => i.trim() !== ""),
        requirementsBeforeService: formData.requirementsBeforeService.filter(i => i.trim() !== ""),
        afterServiceCareInstructions: formData.afterServiceCareInstructions.filter(i => i.trim() !== ""),
        suitableFor: formData.suitableFor || "All Pets"
      };

      const serialized = serializeService(cleanedForm);

      let updatedServices;
      if (isEditMode) {
        updatedServices = rawServices.map(s => s._id === id ? serialized : s);
      } else {
        updatedServices = [...rawServices, { ...serialized, _id: undefined }]; // backend creates ID
      }

      const success = await updateStore({ services: updatedServices });
      if (success) {
        navigate("/services");
      }
    } catch (err) {
      console.error(err);
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
    "Emergency Pet Care"
  ];

  const ageGroups = ["Puppy", "Kitten", "Adult", "Senior"];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/services" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={16} />
          Back to List
        </Link>
        <h1>{isEditMode ? "Edit Service details" : "Create New Service"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="service-form-layout">
        
        {/* Horizontal tabs */}
        <div className="tabs-container" style={{ marginBottom: 24 }}>
          <div className="tabs">
            {[
              { id: "basic", label: "Basic Info & Media" },
              { id: "pricing", label: "Pricing & Details" },
              { id: "inclusions", label: "Inclusions & Care" },
              { id: "availability", label: "Availability & Offers" },
              { id: "seo", label: "SEO & Search Optimization" }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`tab ${activeTab === t.id ? "active" : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab contents */}
        <div className="section-panel" style={{ padding: 32, minHeight: 450 }}>

          {/* TAB 1: BASIC INFO */}
          {activeTab === "basic" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
                <div className="form-group">
                  <label className="form-label">Service Name*</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    placeholder="e.g. Premium Dog Grooming Package"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Category*</label>
                  <select
                    name="category"
                    className="input-field"
                    style={{ background: "var(--bg-tertiary)", color: "#fff" }}
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Description*</label>
                <input
                  type="text"
                  name="shortDescription"
                  className="input-field"
                  placeholder="Short 1-sentence tagline describing the service."
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  name="description"
                  className="input-field"
                  style={{ minHeight: 120, resize: "vertical" }}
                  placeholder="Full detailed description outlining the service features."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
                <div className="form-group">
                  <label className="form-label">Featured Image URL</label>
                  <input
                    type="url"
                    name="photo"
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.photo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Status</label>
                  <select
                    name="serviceStatus"
                    className="input-field"
                    style={{ background: "var(--bg-tertiary)", color: "#fff" }}
                    value={formData.serviceStatus}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Temporarily Unavailable">Temporarily Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Video Presentation URL (Optional)</label>
                <input
                  type="url"
                  name="video"
                  className="input-field"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & DETAILS */}
          {activeTab === "pricing" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>Pricing Breakdown</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)*</label>
                  <input
                    type="number"
                    name="originalPrice"
                    className="input-field"
                    placeholder="899"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Offer Price (₹)*</label>
                  <input
                    type="number"
                    name="offerPrice"
                    className="input-field"
                    placeholder="699"
                    value={formData.offerPrice}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={`${formData.discountPercentage}%`}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tax Included?</label>
                  <select
                    name="taxIncluded"
                    className="input-field"
                    style={{ background: "var(--bg-tertiary)", color: "#fff" }}
                    value={formData.taxIncluded ? "true" : "false"}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxIncluded: e.target.value === "true" }))}
                  >
                    <option value="true">Yes, Tax Included</option>
                    <option value="false">No, Plus Taxes</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Home Visit Charges (₹)</label>
                  <input
                    type="number"
                    name="homeVisitCharges"
                    className="input-field"
                    value={formData.homeVisitCharges}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Charges (₹)</label>
                  <input
                    type="number"
                    name="emergencyCharges"
                    className="input-field"
                    value={formData.emergencyCharges}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weekend Surcharge (₹)</label>
                  <input
                    type="number"
                    name="weekendCharges"
                    className="input-field"
                    value={formData.weekendCharges}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Festival Surcharge (₹)</label>
                  <input
                    type="number"
                    name="festivalCharges"
                    className="input-field"
                    value={formData.festivalCharges}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 8, marginTop: 12 }}>Service Suitability Details</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
                <div className="form-group">
                  <label className="form-label">Suitable Pet Types</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {["Dogs", "Cats", "Birds", "Rabbits", "All Pets"].map(pt => {
                      const isSelected = formData.petTypes.includes(pt);
                      return (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => toggleCheckboxInArray("petTypes", pt)}
                          style={{
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--bg-tertiary)",
                            color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                            border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                            borderRadius: 16,
                            padding: "6px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {pt}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Suitable Age Groups</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {ageGroups.map(ag => {
                      const isSelected = formData.suitableAgeGroups.includes(ag);
                      return (
                        <button
                          key={ag}
                          type="button"
                          onClick={() => toggleCheckboxInArray("suitableAgeGroups", ag)}
                          style={{
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--bg-tertiary)",
                            color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                            border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                            borderRadius: 16,
                            padding: "6px 14px",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {ag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Service Duration (e.g. 60 min)</label>
                  <input
                    type="text"
                    name="duration"
                    className="input-field"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Weight Allowed (kg)</label>
                  <input
                    type="number"
                    name="minWeight"
                    className="input-field"
                    value={formData.minWeight}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Weight Allowed (kg)</label>
                  <input
                    type="number"
                    name="maxWeight"
                    className="input-field"
                    value={formData.maxWeight}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Suitable Breeds (e.g. German Shepherd, Persian Cat)</label>
                <input
                  type="text"
                  name="suitableBreeds"
                  className="input-field"
                  placeholder="Leave blank for all breeds"
                  value={formData.suitableBreeds}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          {/* TAB 3: INCLUSIONS & CARE */}
          {activeTab === "inclusions" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Inclusions & Exclusions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Includes */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--success)" }}>What's Included</h4>
                  {formData.includes.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="✓ Bathing & Blowdry"
                        value={item}
                        onChange={(e) => handleListChange("includes", idx, e.target.value)}
                      />
                      <button type="button" className="btn-icon btn-icon-danger" style={{ height: 48, width: 48 }} onClick={() => removeListItem("includes", idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12, marginTop: 4, width: "auto" }} onClick={() => addListItem("includes")}>
                    + Add Included Item
                  </button>
                </div>

                {/* Excludes */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--danger)" }}>What's Not Included</h4>
                  {formData.notIncludes.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="✗ Vet Consultation"
                        value={item}
                        onChange={(e) => handleListChange("notIncludes", idx, e.target.value)}
                      />
                      <button type="button" className="btn-icon btn-icon-danger" style={{ height: 48, width: 48 }} onClick={() => removeListItem("notIncludes", idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12, marginTop: 4, width: "auto" }} onClick={() => addListItem("notIncludes")}>
                    + Add Excluded Item
                  </button>
                </div>
              </div>

              {/* Requirements & Care instructions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
                {/* Requirements */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Requirements Before Service</h4>
                  {formData.requirementsBeforeService.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Pet must be fully vaccinated"
                        value={item}
                        onChange={(e) => handleListChange("requirementsBeforeService", idx, e.target.value)}
                      />
                      <button type="button" className="btn-icon btn-icon-danger" style={{ height: 48, width: 48 }} onClick={() => removeListItem("requirementsBeforeService", idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12, marginTop: 4, width: "auto" }} onClick={() => addListItem("requirementsBeforeService")}>
                    + Add Requirement
                  </button>
                </div>

                {/* Care instructions */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>After Service Care Instructions</h4>
                  {formData.afterServiceCareInstructions.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Avoid bath for 24 hours"
                        value={item}
                        onChange={(e) => handleListChange("afterServiceCareInstructions", idx, e.target.value)}
                      />
                      <button type="button" className="btn-icon btn-icon-danger" style={{ height: 48, width: 48 }} onClick={() => removeListItem("afterServiceCareInstructions", idx)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" style={{ padding: "8px 16px", fontSize: 12, marginTop: 4, width: "auto" }} onClick={() => addListItem("afterServiceCareInstructions")}>
                    + Add Instruction
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: AVAILABILITY & OFFERS */}
          {activeTab === "availability" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>Service Modes & Booking Volume</h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={formData.availability.storeVisitAvailable}
                      onChange={(e) => handleNestedChange("availability", "storeVisitAvailable", e.target.checked)}
                    />
                    Store Visit Available
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={formData.availability.homeServiceAvailable}
                      onChange={(e) => handleNestedChange("availability", "homeServiceAvailable", e.target.checked)}
                    />
                    Home Service Available
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={formData.availability.emergencyBookingAvailable}
                      onChange={(e) => handleNestedChange("availability", "emergencyBookingAvailable", e.target.checked)}
                    />
                    Emergency Booking Available
                  </label>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="form-group">
                  <label className="form-label">Available Days</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                    {daysOfWeek.map(day => {
                      const isSelected = formData.availability.availableDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleAvailabilityDay(day)}
                          style={{
                            backgroundColor: isSelected ? "var(--primary-light)" : "var(--bg-tertiary)",
                            color: isSelected ? "var(--primary)" : "var(--text-secondary)",
                            border: isSelected ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                            borderRadius: 16,
                            padding: "6px 12px",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Bookings Per Day</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.availability.maxBookingsPerDay}
                    onChange={(e) => handleNestedChange("availability", "maxBookingsPerDay", Number(e.target.value))}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 8, marginTop: 12 }}>Cancellation Policy</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="form-group">
                  <label className="form-label">Free Cancellation Before (Hours)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.cancellationPolicy.freeCancellationBeforeHours}
                    onChange={(e) => handleNestedChange("cancellationPolicy", "freeCancellationBeforeHours", Number(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Late Cancellation Fee (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.cancellationPolicy.cancellationCharges}
                    onChange={(e) => handleNestedChange("cancellationPolicy", "cancellationCharges", Number(e.target.value))}
                  />
                </div>
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 8, marginTop: 12 }}>Special Promotional Campaigns</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={formData.specialOffers.limitedTimeOffer}
                    onChange={(e) => handleNestedChange("specialOffers", "limitedTimeOffer", e.target.checked)}
                  />
                  Limited Time Offer
                </label>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={formData.specialOffers.buyOneGetOne}
                    onChange={(e) => handleNestedChange("specialOffers", "buyOneGetOne", e.target.checked)}
                  />
                  Buy One Get One (BOGO)
                </label>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={formData.specialOffers.packageDiscounts}
                    onChange={(e) => handleNestedChange("specialOffers", "packageDiscounts", e.target.checked)}
                  />
                  Package Discounts
                </label>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={formData.specialOffers.membershipDiscounts}
                    onChange={(e) => handleNestedChange("specialOffers", "membershipDiscounts", e.target.checked)}
                  />
                  Membership Discounts
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & SEARCH */}
          {activeTab === "seo" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>SEO and Discoverability</h3>
              
              <div className="form-group">
                <label className="form-label">Search Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="grooming, dog wash, haircut, premium care"
                  value={formData.seoSearch.keywords.join(", ")}
                  onChange={(e) => {
                    const keys = e.target.value.split(",").map(k => k.trim()).filter(k => k !== "");
                    handleNestedChange("seoSearch", "keywords", keys);
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Listing tags (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Popular, Best Seller, New"
                  value={formData.seoSearch.tags.join(", ")}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(t => t !== "");
                    handleNestedChange("seoSearch", "tags", tags);
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={formData.seoSearch.featuredService}
                    onChange={(e) => handleNestedChange("seoSearch", "featuredService", e.target.checked)}
                  />
                  Feature this Service (Display at top of client listings)
                </label>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={formData.seoSearch.popularServiceBadge}
                    onChange={(e) => handleNestedChange("seoSearch", "popularServiceBadge", e.target.checked)}
                  />
                  Enable Popular Service Badge (Display trending flame tag)
                </label>
              </div>

              <div style={{ background: "rgba(255, 107, 53, 0.08)", padding: 16, borderRadius: 12, border: "1px solid var(--primary-light)", marginTop: 24, display: "flex", gap: 12 }}>
                <Info size={20} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Configuring rich search tags and featured highlights significantly increases your store's click-through rates and booking conversions on the PawConnect client app.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Submit action bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, marginTop: 20 }}>
          <Link to="/services" className="btn-secondary" style={{ width: "auto", margin: 0, padding: "12px 28px" }}>
            Discard Changes
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
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditMode ? "Save Service Changes" : "Publish Service"}
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

export default ServiceForm;
