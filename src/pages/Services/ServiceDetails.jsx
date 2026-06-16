import React from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Check, 
  ShieldAlert, 
  Edit, 
  Sparkles,
  Percent,
  Home,
  AlertTriangle
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { parseService } from "../../utils/serviceHelper";

function ServiceDetails() {
  const { id } = useParams();
  const { store } = useStore();

  const rawServices = store?.services || [];
  const foundRaw = rawServices.find(s => s._id === id);
  
  if (!foundRaw) {
    return (
      <div className="page-container animate-fade-in">
        <div className="section-panel" style={{ padding: 60, textAlign: "center" }}>
          <ShieldAlert size={64} style={{ color: "var(--danger)", marginBottom: 20 }} />
          <h2>Service Not Found</h2>
          <p style={{ color: "var(--text-secondary)", margin: "8px 0 24px" }}>
            The service you are looking for does not exist or has been deleted.
          </p>
          <Link to="/services" className="btn-primary" style={{ width: "auto", margin: "0 auto", padding: "12px 28px" }}>
            Back to Services List
          </Link>
        </div>
      </div>
    );
  }

  const srv = parseService(foundRaw);
  const statusClass = srv.active ? "badge-confirmed" : "badge-cancelled";
  const savedAmount = srv.offerEnabled ? (srv.price - srv.finalPrice) : 0;

  const getPlaceholderImage = (category, srvName) => {
    const name = (srvName || "").toLowerCase();
    const cat = (category || "").toLowerCase();
    if (name.includes("groom") || cat.includes("groom")) {
      return "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80";
    }
    if (name.includes("vet") || cat.includes("vet") || name.includes("clinic") || name.includes("health")) {
      return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80";
    }
    if (name.includes("board") || cat.includes("board") || name.includes("stay") || name.includes("hotel")) {
      return "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=800&q=80";
    }
    return "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80";
  };

  const displayImage = srv.image || getPlaceholderImage(srv.category, srv.name);

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Top action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/services" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={16} />
          Back to Services
        </Link>
        <Link to={`/services/${srv._id}/edit`} className="btn-primary" style={{ width: "auto", margin: 0, padding: "8px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <Edit size={16} />
          Edit Service Details
        </Link>
      </div>

      {/* Hero Banner Section */}
      <div className="service-details-hero" style={{ height: 350, position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 32, border: "1px solid var(--border-color)" }}>
        <img src={displayImage} alt={srv.name} className="service-hero-img" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="service-hero-overlay" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)", padding: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span className="service-hero-category" style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "var(--primary)", display: "inline-block", marginBottom: 8 }}>
              {srv.category || "General Pet Care"}
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: 0 }}>{srv.name}</h1>
          </div>
          <span className={`badge ${statusClass}`} style={{ padding: "8px 16px", fontSize: 12, fontWeight: 700 }}>
            {srv.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* 2-Column Info Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32 }}>
        
        {/* Left column - Description & Includes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Description */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} />
              Description
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
              {srv.description || "No description set."}
            </p>
          </div>

          {/* Includes / What We Offer */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
              <Check size={18} style={{ color: "var(--primary)" }} />
              What We Offer
            </h3>
            {srv.includes && srv.includes.filter(i => i.trim() !== "").length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {srv.includes.filter(i => i.trim() !== "").map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontStyle: "italic" }}>No details specified.</span>
            )}
          </div>

        </div>

        {/* Right column - Price & Meta Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Pricing Panel */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
              <Percent size={18} style={{ color: "var(--primary)" }} />
              Pricing & Offers
            </h3>

            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Final Price:</span>
                <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>₹{srv.finalPrice}</span>
              </div>

              {srv.offerEnabled && savedAmount > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Original Price:</span>
                    <span style={{ fontSize: 16, color: "var(--text-tertiary)", textDecoration: "line-through" }}>₹{srv.price}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Offer Applied:</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", backgroundColor: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: 8 }}>
                      {srv.offerTitle || srv.offerType || "Discount"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Savings:</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#10b981" }}>Save ₹{savedAmount}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
              <Clock size={18} style={{ color: "var(--primary)" }} />
              Service Details
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Duration:</span>
                <strong style={{ color: "#fff" }}>{srv.duration || "60 min"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Suitable For:</span>
                <strong style={{ color: "#fff" }}>{srv.petTypes?.join(", ") || "All Pets"}</strong>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="section-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}>
              <Home size={18} style={{ color: "var(--primary)" }} />
              Availability
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Home Service:</span>
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: srv.homeServiceAvailable ? "#10b981" : "#ef4444", 
                  backgroundColor: srv.homeServiceAvailable ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  padding: "4px 10px",
                  borderRadius: 8
                }}>
                  {srv.homeServiceAvailable ? "Available" : "Not Available"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Emergency Booking:</span>
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: 700, 
                  color: srv.emergencyAvailable ? "#10b981" : "#ef4444", 
                  backgroundColor: srv.emergencyAvailable ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                  padding: "4px 10px",
                  borderRadius: 8
                }}>
                  {srv.emergencyAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ServiceDetails;
