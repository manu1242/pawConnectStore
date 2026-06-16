import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Check, 
  X, 
  ShieldAlert, 
  Edit, 
  Calendar, 
  TrendingUp, 
  Award, 
  Tag, 
  DollarSign,
  AlertCircle,
  Play
} from "lucide-react";
import { useStore } from "../../context/StoreContext";
import { parseService } from "../../utils/serviceHelper";

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  
  const discount = srv.discountPercentage || 0;
  const statusClass = 
    srv.serviceStatus === "Active" ? "badge-confirmed" : 
    srv.serviceStatus === "Inactive" ? "badge-cancelled" : "badge-pending";

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

  const displayImage = srv.image || srv.photo || getPlaceholderImage(srv.category, srv.name);

  return (
    <div className="page-container animate-fade-in">
      {/* Top action bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <Link to="/services" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={16} />
          Back to Services
        </Link>
        <Link to={`/services/${srv._id}/edit`} className="btn-primary" style={{ width: "auto", margin: 0, padding: "8px 20px", display: "flex", alignItems: "center", gap: 8 }}>
          <Edit size={16} />
          Edit Service details
        </Link>
      </div>

      {/* Hero Banner Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, marginBottom: 32 }}>
        
        {/* Left column - Gallery and Video */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="service-details-hero">
            <img src={displayImage} alt={srv.name} className="service-hero-img" />
            <div className="service-hero-overlay">
              <span className={`badge ${statusClass}`} style={{ padding: "6px 12px", fontSize: 11 }}>
                {srv.serviceStatus || "Active"}
              </span>
              <span className="service-hero-category">{srv.category || "General Pet Care"}</span>
            </div>
          </div>

          {/* Multiple Gallery Images */}
          {srv.images && srv.images.length > 0 && (
            <div className="section-panel" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Service Images Gallery</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 12 }}>
                {srv.images.map((img, idx) => (
                  <a href={img} target="_blank" rel="noopener noreferrer" key={idx} className="gallery-item" style={{ height: 90 }}>
                    <img src={img} alt={`${srv.name} gallery ${idx}`} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Video Presentation */}
          {srv.video && (
            <div className="section-panel" style={{ padding: 24, display: "flex", alignItems: "center", justifyItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <Play size={20} fill="currentColor" />
              </div>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700 }}>Service Video Presentation</h4>
                <a href={srv.video} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", wordBreak: "break-all" }}>
                  {srv.video}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Main Details & Pricing */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="section-panel" style={{ padding: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: "Outfit, sans-serif", color: "#fff", marginBottom: 8 }}>
              {srv.name}
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              {srv.shortDescription || "No short description provided."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "16px 0", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={20} style={{ color: "var(--primary)" }} />
                <div>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block" }}>DURATION</span>
                  <strong style={{ color: "#fff", fontSize: 14 }}>{srv.duration || "60 min"}</strong>
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block" }}>SUITABLE FOR</span>
                <strong style={{ color: "#fff", fontSize: 14 }}>{srv.suitableFor || "All Pets"}</strong>
              </div>
            </div>

            {/* Pricing Panel */}
            <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", borderRadius: 16, padding: 20 }}>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: 0.5 }}>PRICING SCHEDULING</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>₹{srv.offerPrice}</span>
                {discount > 0 && (
                  <>
                    <span style={{ fontSize: 18, color: "var(--text-tertiary)", textDecoration: "line-through" }}>₹{srv.originalPrice}</span>
                    <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 700, background: "var(--success-light)", padding: "2px 8px", borderRadius: 12 }}>
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                {srv.taxIncluded ? "Price includes all applicable taxes." : "Subject to GST and other local taxes."}
              </p>

              {/* Surcharges list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border-color)", marginTop: 16, paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Home Visit Fee:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>₹{srv.homeVisitCharges || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Emergency Fee:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>₹{srv.emergencyCharges || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Weekend Fee:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>₹{srv.weekendCharges || 0}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Festival Fee:</span>
                  <span style={{ color: "#fff", fontWeight: 600 }}>₹{srv.festivalCharges || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings and Analytics Dashboard */}
          <div className="section-panel" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Performance Analytics</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: 12, border: "1px solid var(--border-color)", textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block" }}>TOTAL BOOKINGS</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", display: "block", marginTop: 4 }}>
                  {srv.ratingsAnalytics?.totalBookings || 0}
                </span>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: 12, border: "1px solid var(--border-color)", textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block" }}>RATING</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--warning)", display: "block", marginTop: 4 }}>
                  ★ {srv.ratingsAnalytics?.averageRating || 5.0}
                </span>
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: 14, borderRadius: 12, border: "1px solid var(--border-color)", textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block" }}>REVENUE</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--success)", display: "block", marginTop: 4 }}>
                  ₹{srv.ratingsAnalytics?.revenueGenerated || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Lower Details - Description, Inclusions, Schedules, SEO */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32 }}>
        
        {/* Left Column details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Detailed description */}
          <div className="section-panel" style={{ padding: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Full Service Description</h3>
            <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-line" }}>
              {srv.description || "No detailed description provided."}
            </div>
          </div>

          {/* Inclusions vs Exclusions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div className="section-panel" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--success)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <Check size={16} /> What's Included
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                {srv.includes && srv.includes.length > 0 ? (
                  srv.includes.map((inc, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--success)" }}>✓</span> {inc}
                    </li>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>No specific inclusions set.</p>
                )}
              </ul>
            </div>

            <div className="section-panel" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--danger)", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
                <X size={16} /> What's Not Included
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                {srv.notIncludes && srv.notIncludes.length > 0 ? (
                  srv.notIncludes.map((exc, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--danger)" }}>✗</span> {exc}
                    </li>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>No specific exclusions set.</p>
                )}
              </ul>
            </div>
          </div>

          {/* Requirements & After Care */}
          <div className="section-panel" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Pre-service Requirements & After Care</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <h5 style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginBottom: 10 }}>Before Service Requirements</h5>
                <ul style={{ listStyle: "decimal", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  {srv.requirementsBeforeService && srv.requirementsBeforeService.length > 0 ? (
                    srv.requirementsBeforeService.map((req, i) => <li key={i}>{req}</li>)
                  ) : (
                    <span style={{ color: "var(--text-tertiary)", fontSize: 12, listStyle: "none" }}>None configured.</span>
                  )}
                </ul>
              </div>

              <div>
                <h5 style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginBottom: 10 }}>After Service Instructions</h5>
                <ul style={{ listStyle: "decimal", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--text-secondary)" }}>
                  {srv.afterServiceCareInstructions && srv.afterServiceCareInstructions.length > 0 ? (
                    srv.afterServiceCareInstructions.map((care, i) => <li key={i}>{care}</li>)
                  ) : (
                    <span style={{ color: "var(--text-tertiary)", fontSize: 12, listStyle: "none" }}>None configured.</span>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Availability Details */}
          <div className="section-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Service Mode & Availability</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Store Visits:</span>
                <span style={{ color: srv.availability?.storeVisitAvailable ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>
                  {srv.availability?.storeVisitAvailable ? "YES" : "NO"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Home Service:</span>
                <span style={{ color: srv.availability?.homeServiceAvailable ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>
                  {srv.availability?.homeServiceAvailable ? "YES" : "NO"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>Emergency Booking:</span>
                <span style={{ color: srv.availability?.emergencyBookingAvailable ? "var(--success)" : "var(--danger)", fontWeight: 700 }}>
                  {srv.availability?.emergencyBookingAvailable ? "YES" : "NO"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderTop: "1px solid var(--border-color)", paddingTop: 10 }}>
                <span style={{ color: "var(--text-secondary)" }}>Max Bookings/Day:</span>
                <span style={{ color: "#fff", fontWeight: 700 }}>
                  {srv.availability?.maxBookingsPerDay || 10} bookings
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="section-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Cancellation Terms</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Free Cancellation:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  Before {srv.cancellationPolicy?.freeCancellationBeforeHours || 24} hours
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Charges otherwise:</span>
                <span style={{ color: "var(--danger)", fontWeight: 600 }}>
                  ₹{srv.cancellationPolicy?.cancellationCharges || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Special Offers badges */}
          <div className="section-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Applied Special Offers</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {srv.specialOffers?.limitedTimeOffer && (
                <span className="badge badge-pending">Limited Time</span>
              )}
              {srv.specialOffers?.buyOneGetOne && (
                <span className="badge badge-confirmed">BOGO Offer</span>
              )}
              {srv.specialOffers?.packageDiscounts && (
                <span className="badge badge-completed">Package discount</span>
              )}
              {srv.specialOffers?.membershipDiscounts && (
                <span className="badge badge-completed">Membership Discount</span>
              )}
              {(!srv.specialOffers?.limitedTimeOffer && !srv.specialOffers?.buyOneGetOne && !srv.specialOffers?.packageDiscounts && !srv.specialOffers?.membershipDiscounts) && (
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>No active promotional campaigns.</p>
              )}
            </div>
          </div>

          {/* SEO and Keywords */}
          <div className="section-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>SEO & Search optimization</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>KEYWORDS</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {srv.seoSearch?.keywords && srv.seoSearch.keywords.length > 0 ? (
                    srv.seoSearch.keywords.map((key, i) => (
                      <span key={i} style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-color)", padding: "4px 8px", borderRadius: 8, fontSize: 11, color: "var(--text-secondary)" }}>
                        #{key}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>None added</span>
                  )}
                </div>
              </div>

              <div>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>TAGS</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {srv.seoSearch?.tags && srv.seoSearch.tags.length > 0 ? (
                    srv.seoSearch.tags.map((tag, i) => (
                      <span key={i} style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "4px 8px", borderRadius: 8, fontSize: 11, color: "var(--success)" }}>
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>None added</span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border-color)", paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Featured Service Listing:</span>
                  <span style={{ fontWeight: 700, color: srv.seoSearch?.featuredService ? "var(--success)" : "var(--text-tertiary)" }}>
                    {srv.seoSearch?.featuredService ? "YES" : "NO"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Popular Badge:</span>
                  <span style={{ fontWeight: 700, color: srv.seoSearch?.popularServiceBadge ? "var(--success)" : "var(--text-tertiary)" }}>
                    {srv.seoSearch?.popularServiceBadge ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ServiceDetails;
