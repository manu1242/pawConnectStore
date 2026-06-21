import React, { useState, useEffect } from "react";
import axios from "axios";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { StoreProvider, useStore } from "./context/StoreContext";

// Import sidebar component
import Sidebar from "./components/Sidebar";
import OnboardingWizard from "./components/OnboardingWizard";

// Import page components
import Bookings from "./pages/Bookings";
import StoreProfile from "./pages/StoreProfile";
import ServicesList from "./pages/Services/ServicesList";
import ServiceDetails from "./pages/Services/ServiceDetails";
import ServiceForm from "./pages/Services/ServiceForm";
import Promos from "./pages/Promos";
import VetClinic from "./pages/VetClinic";

// New Dashboard & Module Pages
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Revenue from "./pages/Revenue";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import ProductsManager from "./pages/ProductsManager";
import VeterinaryManager from "./pages/VeterinaryManager";
import GroomingManager from "./pages/GroomingManager";
import DogWalkingManager from "./pages/DogWalkingManager";
import BoardingManager from "./pages/BoardingManager";
import TrainingManager from "./pages/TrainingManager";
import EmergencyManager from "./pages/EmergencyManager";

function AppContent() {
  const { 
    token, 
    setToken, 
    dataLoading, 
    alert, 
    showAlert, 
    user, 
    store, 
    handleLogout,
    API_BASE,
    fetchDashboardData
  } = useStore();

  const [viewMode, setViewMode] = useState("login"); // "login" | "register" | "success"
  const [successMessage, setSuccessMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration Form State
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [storeName, setStoreName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [selectedStoreTypes, setSelectedStoreTypes] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // Documents
  const [storeLicense, setStoreLicense] = useState("");
  const [gstCertificate, setGstCertificate] = useState("");
  const [storeImages, setStoreImages] = useState("");
  const [ownerIdProof, setOwnerIdProof] = useState("");
  const [storeLogo, setStoreLogo] = useState("");

  const [registerLoading, setRegisterLoading] = useState(false);

  const STORE_TYPES = [
    "Pet Shop", 
    "Veterinary Clinic", 
    "Grooming Center", 
    "Dog Walking Service", 
    "Pet Boarding", 
    "Pet Training Center", 
    "Pet Pharmacy", 
    "Emergency Pet Care"
  ];

  const PRODUCT_OPTIONS = [
    { id: "toys", label: "Toys" },
    { id: "food", label: "Food" },
    { id: "medicines", label: "Medicines" },
    { id: "accessories", label: "Accessories" }
  ];

  const SERVICE_OPTIONS = [
    { id: "veterinary", label: "Veterinary" },
    { id: "grooming", label: "Grooming" },
    { id: "walking", label: "Dog Walking" },
    { id: "boarding", label: "Boarding" },
    { id: "training", label: "Training" },
    { id: "emergency", label: "Emergency" }
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showAlert("danger", "Please fill in all credentials.");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      if (response.data.success) {
        const { accessToken, user: loggedUser } = response.data.data;
        
        if (loggedUser.role !== "manager" && loggedUser.role !== "store_owner") {
          showAlert("danger", "Access Denied: Only Store Owners/Managers can access the Web Console.");
          return;
        }

        localStorage.setItem("token", accessToken);
        setToken(accessToken);
        showAlert("success", `Welcome back, ${loggedUser.fullName}!`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      showAlert("danger", msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (ownerPassword !== confirmPassword) {
      showAlert("danger", "Passwords do not match.");
      return;
    }

    if (selectedStoreTypes.length === 0) {
      showAlert("danger", "Please select at least one store type.");
      return;
    }

    setRegisterLoading(true);
    try {
      const payload = {
        ownerDetails: {
          fullName: ownerName,
          email: ownerEmail,
          phone: ownerPhone,
          password: ownerPassword
        },
        businessDetails: {
          name: storeName,
          gstNumber,
          businessRegNumber,
          address,
          city,
          state,
          pincode
        },
        storeTypes: selectedStoreTypes,
        requestedProducts: selectedProducts,
        requestedServices: selectedServices,
        documents: {
          storeLicense,
          gstCertificate,
          storeImages: storeImages ? [storeImages] : [],
          ownerIdProof,
          storeLogo
        }
      };

      const res = await axios.post(`${API_BASE}/registration-requests`, payload);
      if (res.data.success) {
        setViewMode("success");
        setSuccessMessage(res.data.message || "Your store registration request has been submitted successfully. Our team will review your application and contact you shortly.");
      }
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Failed to submit registration request.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const toggleStoreType = (type) => {
    if (selectedStoreTypes.includes(type)) {
      setSelectedStoreTypes(prev => prev.filter(t => t !== type));
    } else {
      setSelectedStoreTypes(prev => [...prev, type]);
    }
  };

  const toggleProduct = (prodId) => {
    if (selectedProducts.includes(prodId)) {
      setSelectedProducts(prev => prev.filter(p => p !== prodId));
    } else {
      setSelectedProducts(prev => [...prev, prodId]);
    }
  };

  const toggleService = (srvId) => {
    if (selectedServices.includes(srvId)) {
      setSelectedServices(prev => prev.filter(s => s !== srvId));
    } else {
      setSelectedServices(prev => [...prev, srvId]);
    }
  };

  // Render Login Panel if unauthorized
  if (!token) {
    if (viewMode === "success") {
      return (
        <div className="auth-wrapper">
          <div className="auth-card animate-fade-in" style={{ maxWidth: 550, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>Registration Submitted!</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>
              {successMessage}
            </p>
            <button 
              className="btn-primary" 
              onClick={() => setViewMode("login")}
              style={{ maxWidth: 200, margin: "0 auto" }}
            >
              Back to Login
            </button>
          </div>
        </div>
      );
    }

    if (viewMode === "register") {
      return (
        <div className="auth-wrapper">
          <div className="auth-card animate-fade-in" style={{ maxWidth: 850, width: "95%" }}>
            <div className="auth-logo" style={{ marginBottom: 4 }}>
              <span>🐾</span> PawConnect Partner Registration
            </div>
            <p className="auth-subtitle" style={{ marginBottom: 24 }}>Onboard your pet shop, clinic or care services with us</p>

            {alert && (
              <div className={`alert-banner alert-banner-${alert.type}`} style={{ marginBottom: 20 }}>
                <span>{alert.message}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Owner Details Section */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>1. Owner Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="input-field" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="input-field" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required placeholder="owner@store.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="input-field" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} required placeholder="9876543210" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" className="input-field" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} required placeholder="Min 6 chars" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Repeat password" />
                  </div>
                </div>
              </div>

              {/* Business Details Section */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>2. Business Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Store / Clinic Name</label>
                    <input type="text" className="input-field" value={storeName} onChange={(e) => setStoreName(e.target.value)} required placeholder="Happy Paws Center" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Number (Optional)</label>
                    <input type="text" className="input-field" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="37AAAAA0000A1Z5" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number (Optional)</label>
                    <input type="text" className="input-field" value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} placeholder="Reg / License No." />
                  </div>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Street Address</label>
                    <input type="text" className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} required placeholder="Building, Street, Landmark" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="input-field" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Vijayawada" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" className="input-field" value={state} onChange={(e) => setState(e.target.value)} required placeholder="Andhra Pradesh" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input type="text" className="input-field" value={pincode} onChange={(e) => setPincode(e.target.value)} required placeholder="520010" />
                  </div>
                </div>
              </div>

              {/* Store Types Section */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)", marginBottom: 12 }}>3. Store Type</h3>
                <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 12 }}>Select one or more categories that apply to your business:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {STORE_TYPES.map((type) => (
                    <label key={type} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: "var(--bg-tertiary)",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1.5px solid ${selectedStoreTypes.includes(type) ? "var(--primary)" : "var(--border-color)"}`,
                      cursor: "pointer"
                    }}>
                      <input type="checkbox" checked={selectedStoreTypes.includes(type)} onChange={() => toggleStoreType(type)} style={{ accentColor: "var(--primary)" }} />
                      <span style={{ fontSize: 13, color: selectedStoreTypes.includes(type) ? "#fff" : "var(--text-secondary)" }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Products & Services Section */}
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>4. Requested Modules</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Products Marketplace</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {PRODUCT_OPTIONS.map((prod) => (
                        <label key={prod.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input type="checkbox" checked={selectedProducts.includes(prod.id)} onChange={() => toggleProduct(prod.id)} style={{ accentColor: "var(--primary)" }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{prod.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Services Bookings</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {SERVICE_OPTIONS.map((srv) => (
                        <label key={srv.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                          <input type="checkbox" checked={selectedServices.includes(srv.id)} onChange={() => toggleService(srv.id)} style={{ accentColor: "var(--primary)" }} />
                          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{srv.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Uploads Section */}
              <div style={{ paddingBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--primary)", marginBottom: 16 }}>5. Upload Verification Documents</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Store License Link / Name</label>
                    <input type="text" className="input-field" value={storeLicense} onChange={(e) => setStoreLicense(e.target.value)} placeholder="e.g. license_document.pdf" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Certificate Link / Name</label>
                    <input type="text" className="input-field" value={gstCertificate} onChange={(e) => setGstCertificate(e.target.value)} placeholder="e.g. gst_document.pdf" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store Image Link / Name</label>
                    <input type="text" className="input-field" value={storeImages} onChange={(e) => setStoreImages(e.target.value)} placeholder="e.g. storefront.jpg" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner ID Proof (Aadhaar/PAN)</label>
                    <input type="text" className="input-field" value={ownerIdProof} onChange={(e) => setOwnerIdProof(e.target.value)} placeholder="e.g. id_aadhaar.jpg" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store Logo Link / Name</label>
                    <input type="text" className="input-field" value={storeLogo} onChange={(e) => setStoreLogo(e.target.value)} placeholder="e.g. logo.png" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <button type="submit" className="btn-primary" disabled={registerLoading} style={{ flex: 2 }}>
                  {registerLoading ? "Submitting Registration Request..." : "Submit Request"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setViewMode("login")} style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-wrapper">
        <div className="auth-card animate-fade-in">
          <div className="auth-logo">
            <span>🐾</span> PawConnect
          </div>
          <p className="auth-subtitle">Business Console - Store Manager Portal</p>

          {alert && (
            <div className={`alert-banner alert-banner-${alert.type}`}>
              <span>{alert.message}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="manager@pawconnect.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loginLoading}>
              {loginLoading ? "Verifying Credentials..." : "Access Dashboard"}
            </button>
          </form>

          {/* Become a Partner Link */}
          <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", display: "block", marginBottom: 8 }}>Are you a Pet Store or Service Owner?</span>
            <button 
              type="button" 
              onClick={() => setViewMode("register")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Become a Partner / Register Your Pet Business
            </button>
          </div>

        </div>
      </div>
    );
  }
  
  // Force Onboarding if first login (store exists but onboardingCompleted !== true)
  if (token && store && !store.onboardingCompleted) {
    return (
      <OnboardingWizard 
        user={user}
        store={store}
        token={token}
        onComplete={fetchDashboardData}
        API_BASE={API_BASE}
      />
    );
  }

  // Render Dashboard Layout when authorized
  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content viewport */}
      <main className="content-viewport">
        {/* Floating alerts inside dashboard */}
        {alert && (
          <div className={`alert-banner alert-banner-${alert.type}`} style={{ marginBottom: 20, maxWidth: 600 }}>
            <span>{alert.message}</span>
          </div>
        )}

        <Routes>
          {/* Always Visible Core Pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<StoreProfile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />

          {/* Legacy/Standard Service/Promos Pages */}
          <Route path="/services" element={<ServicesList />} />
          <Route path="/services/new" element={<ServiceForm />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/services/:id/edit" element={<ServiceForm />} />
          <Route path="/promos" element={<Promos />} />
          <Route path="/vet-clinic" element={<VetClinic />} />

          {/* Granular Module Pages Protected by Frontend Permission check */}
          {user?.permissions?.includes("toys") && (
            <Route path="/toys" element={<ProductsManager category="toys" title="Toys Inventory" />} />
          )}
          {user?.permissions?.includes("food") && (
            <Route path="/food" element={<ProductsManager category="food" title="Food & Nutrition" />} />
          )}
          {user?.permissions?.includes("medicines") && (
            <Route path="/medicines" element={<ProductsManager category="medicines" title="Medicines Shop" />} />
          )}
          {user?.permissions?.includes("accessories") && (
            <Route path="/accessories" element={<ProductsManager category="accessories" title="Accessories Shop" />} />
          )}
          {user?.permissions?.includes("veterinary") && (
            <Route path="/veterinary" element={<VeterinaryManager />} />
          )}
          {user?.permissions?.includes("grooming") && (
            <Route path="/grooming" element={<GroomingManager />} />
          )}
          {user?.permissions?.includes("walking") && (
            <Route path="/dog-walking" element={<DogWalkingManager />} />
          )}
          {user?.permissions?.includes("boarding") && (
            <Route path="/boarding" element={<BoardingManager />} />
          )}
          {user?.permissions?.includes("training") && (
            <Route path="/training" element={<TrainingManager />} />
          )}
          {user?.permissions?.includes("emergency") && (
            <Route path="/emergency" element={<EmergencyManager />} />
          )}

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </StoreProvider>
  );
}

export default App;
