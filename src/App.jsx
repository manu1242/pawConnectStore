import React, { useState, useEffect } from "react";
import axios from "axios";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { StoreProvider, useStore } from "./context/StoreContext";

// Import sidebar component
import Sidebar from "./components/Sidebar";

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
    API_BASE 
  } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

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
        
        if (loggedUser.role !== "manager") {
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

  // Render Login Panel if unauthorized
  if (!token) {
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

      
        </div>
      </div>
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
