import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Clock, 
  Trash2, 
  Edit, 
  Eye, 
  Plus, 
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { parseService } from "../../utils/serviceHelper";

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
    
    const nextStatus = serviceToUpdate.serviceStatus === "Active" ? "Inactive" : "Active";
    const updatedServices = services.map(s => {
      if (s._id === serviceId) {
        return {
          ...s,
          serviceStatus: nextStatus,
          active: nextStatus === "Active"
        };
      }
      return s;
    });

    // Re-serialize for store updating
    const { serializeService } = await import("../../utils/serviceHelper");
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
          <p>Configure pricing, details, policies, and inclusions for store services.</p>
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
            const displayImage = srv.image || srv.photo || getPlaceholderImage(srv.category, srv.name);
            const discount = srv.discountPercentage || 0;
            const statusClass = 
              srv.serviceStatus === "Active" ? "badge-confirmed" : 
              srv.serviceStatus === "Inactive" ? "badge-cancelled" : "badge-pending";

            return (
              <div className="service-card" key={srv._id}>
                <div className="service-card-image">
                  <img src={displayImage} alt={srv.name} />
                  {discount > 0 && (
                    <span className="service-discount-badge">{discount}% OFF</span>
                  )}
                  <div className="service-status-floating">
                    <span className={`badge ${statusClass}`} style={{ fontSize: "10px" }}>
                      {srv.serviceStatus || "Active"}
                    </span>
                  </div>
                </div>

                <div className="service-card-body">
                  <div className="service-card-category">{srv.category || "General Pet Care"}</div>
                  <h3 className="service-card-title">{srv.name}</h3>
                  <p className="service-card-desc">
                    {srv.shortDescription || srv.description || "No description set."}
                  </p>

                  <div className="service-card-meta">
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={14} style={{ color: "var(--text-tertiary)" }} />
                      <span>{srv.duration || "60 min"}</span>
                    </div>
                    <div>
                      Suitable: <strong style={{ color: "#fff" }}>{srv.suitableFor || "All Pets"}</strong>
                    </div>
                  </div>

                  {/* Pricing row */}
                  <div className="service-card-pricing">
                    <div className="price-tag-wrapper">
                      {srv.originalPrice > srv.offerPrice ? (
                        <>
                          <span className="price-offer">₹{srv.offerPrice}</span>
                          <span className="price-original">₹{srv.originalPrice}</span>
                        </>
                      ) : (
                        <span className="price-offer">₹{srv.price || srv.offerPrice}</span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                      {srv.taxIncluded ? "Tax Included" : "+ GST"}
                    </span>
                  </div>

                  {/* Analytics brief */}
                  <div className="service-card-analytics">
                    <div className="analytics-mini-item">
                      <TrendingUp size={12} style={{ color: "var(--success)" }} />
                      <span>{srv.ratingsAnalytics?.totalBookings || 0} Bookings</span>
                    </div>
                    <div className="analytics-mini-item">
                      <Award size={12} style={{ color: "var(--warning)" }} />
                      <span>{srv.ratingsAnalytics?.averageRating || 5.0} ★</span>
                    </div>
                  </div>
                </div>

                {/* Card footer buttons */}
                <div className="service-card-actions">
                  <button 
                    className="btn-card-action"
                    onClick={() => toggleStatus(srv._id)}
                    title={srv.serviceStatus === "Active" ? "Set Inactive" : "Set Active"}
                    style={{ fontSize: 11 }}
                  >
                    {srv.serviceStatus === "Active" ? "Pause" : "Activate"}
                  </button>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link to={`/services/${srv._id}`} className="btn-icon" title="Preview Details">
                      <Eye size={15} />
                    </Link>
                    <Link to={`/services/${srv._id}/edit`} className="btn-icon btn-icon-success" title="Edit Service">
                      <Edit size={15} />
                    </Link>
                    <button 
                      className="btn-icon btn-icon-danger" 
                      onClick={() => handleDelete(srv._id)}
                      title="Delete Service"
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
