import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Clock, 
  Trash2, 
  Edit, 
  Eye, 
  Plus
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { parseService, serializeService } from "../../utils/serviceHelper";

function ServicesList() {
  const { store, updateStore } = useStore();
  const navigate = useNavigate();

  // Parse services
  const rawServices = store?.services || [];
  const services = rawServices.map(parseService);

  const handleDelete = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }
    const updatedServices = rawServices.filter(s => s._id !== serviceId);
    await updateStore({ services: updatedServices });
  };

  const toggleStatus = async (serviceId) => {
    const serviceToUpdate = services.find(s => s._id === serviceId);
    if (!serviceToUpdate) return;
    
    const nextActive = !serviceToUpdate.active;
    const updatedServices = services.map(s => {
      if (s._id === serviceId) {
        return {
          ...s,
          active: nextActive
        };
      }
      return s;
    });

    const serialized = updatedServices.map(serializeService);
    await updateStore({ services: serialized });
  };

  const getPlaceholderImage = (category, srvName) => {
    const name = (srvName || "").toLowerCase();
    const cat = (category || "").toLowerCase();
    if (name.includes("groom") || cat.includes("groom")) {
      return "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=400&q=80";
    }
    if (name.includes("vet") || cat.includes("vet") || name.includes("clinic") || name.includes("health")) {
      return "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80";
    }
    if (name.includes("board") || cat.includes("board") || name.includes("stay") || name.includes("hotel")) {
      return "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=400&q=80";
    }
    return "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80";
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Service Management</h1>
          <p>Configure pricing, details, and inclusions for store services.</p>
        </div>
        <Link to="/services/new" className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}>
          <Plus size={18} />
          Create New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="section-panel" style={{ padding: 60, textAlign: "center" }}>
          <Sparkles size={64} style={{ color: "var(--primary)", marginBottom: 20 }} />
          <h2>No Services Configured</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 8, maxWidth: 460, margin: "8px auto 24px" }}>
            Add your grooming packages, veterinary consultations, or daycare services to receive client bookings.
          </p>
          <Link to="/services/new" className="btn-primary" style={{ width: "auto", margin: "0 auto", padding: "12px 28px" }}>
            Create First Service
          </Link>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((srv) => {
            const displayImage = srv.image || getPlaceholderImage(srv.category, srv.name);
            const savedAmount = srv.offerEnabled ? (srv.price - srv.finalPrice) : 0;
            const statusClass = srv.active ? "badge-confirmed" : "badge-cancelled";

            return (
              <div className="service-card" key={srv._id} style={{ width: "100%", margin: 0, overflow: "hidden", background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
                <div className="service-card-image" style={{ height: 200, position: "relative" }}>
                  <img 
                    src={displayImage} 
                    alt={srv.name} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                  
                  {srv.offerEnabled && srv.offerTitle && (
                    <span className="service-discount-badge" style={{ backgroundColor: "#10b981", color: "#fff", position: "absolute", top: 12, left: 12, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                      {srv.offerTitle}
                    </span>
                  )}
                  
                  <div className="service-status-floating" style={{ position: "absolute", top: 12, right: 12 }}>
                    <span className={`badge ${statusClass}`} style={{ fontSize: "10px" }}>
                      {srv.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="service-card-body" style={{ padding: 24, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <span className="service-card-category" style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "var(--primary)", display: "block", marginBottom: 6 }}>
                    {srv.category || "General Pet Care"}
                  </span>

                  <h3 className="service-card-title" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px 0", color: "#fff" }}>
                    {srv.name}
                  </h3>

                  <p className="service-card-desc" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px 0", minHeight: 40 }}>
                    {srv.description || "No description set."}
                  </p>

                  <div className="service-card-meta" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-tertiary)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "12px 0", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} />
                      <span>Duration: <strong style={{ color: "#fff" }}>{srv.duration || "60 min"}</strong></span>
                    </div>
                    <div>
                      Suitable For: <strong style={{ color: "#fff" }}>{srv.petTypes?.join(", ") || "All Pets"}</strong>
                    </div>
                  </div>

                  {/* Inclusions List */}
                  {srv.includes && srv.includes.filter(i => i.trim() !== "").length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", display: "block", marginBottom: 6, textTransform: "uppercase" }}>
                        Includes:
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {srv.includes.filter(i => i.trim() !== "").map((item, idx) => (
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
                    {srv.homeServiceAvailable && (
                      <span style={{ fontSize: 10, background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        Home Service Available
                      </span>
                    )}
                    {srv.emergencyAvailable && (
                      <span style={{ fontSize: 10, background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                        Emergency Service Available
                      </span>
                    )}
                  </div>

                  {/* Pricing & Booking Section */}
                  <div className="service-card-pricing" style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border-color)", paddingTop: 14, marginTop: "auto" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span className="price-offer" style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
                          ₹{srv.finalPrice}
                        </span>
                        {srv.offerEnabled && savedAmount > 0 && (
                          <span className="price-original" style={{ fontSize: 14, color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                            ₹{srv.price}
                          </span>
                        )}
                      </div>
                      {srv.offerEnabled && savedAmount > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>
                          Save ₹{savedAmount}
                        </span>
                      )}
                    </div>

                    <button type="button" className="btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={() => navigate(`/services/${srv._id}`)}>
                      Book Now
                    </button>
                  </div>
                </div>

                {/* Card footer buttons for managers */}
                <div className="service-card-actions" style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid var(--border-color)" }}>
                  <button 
                    className="btn-card-action"
                    onClick={() => toggleStatus(srv._id)}
                    title={srv.active ? "Set Inactive" : "Set Active"}
                    style={{ fontSize: 12, background: "none", border: "none", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}
                  >
                    {srv.active ? "Pause" : "Activate"}
                  </button>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Link to={`/services/${srv._id}`} className="btn-icon" title="Preview Details" style={{ color: "var(--text-secondary)" }}>
                      <Eye size={15} />
                    </Link>
                    <Link to={`/services/${srv._id}/edit`} className="btn-icon btn-icon-success" title="Edit Service" style={{ color: "var(--success)" }}>
                      <Edit size={15} />
                    </Link>
                    <button 
                      className="btn-icon btn-icon-danger" 
                      onClick={() => handleDelete(srv._id)}
                      title="Delete Service"
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ServicesList;
