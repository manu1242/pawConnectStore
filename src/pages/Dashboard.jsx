import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingBag, 
  IndianRupee, 
  Activity, 
  Star, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Phone,
  Eye,
  MessageSquare
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { getMockOrders } from "../utils/mockData";

function Dashboard() {
  const { bookings, reviews, store, user, dataLoading } = useStore();
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // Get latest mock orders
    const allOrders = getMockOrders();
    setRecentOrders(allOrders.slice(0, 5));
  }, []);

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];

  // Bookings Stats
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed");

  // Orders Stats
  const allOrders = getMockOrders();
  const todayOrders = allOrders.filter(o => o.date === todayStr);
  const pendingOrders = allOrders.filter(o => o.status === "pending");

  // Revenue Stats
  const bookingsRevenue = bookings
    .filter(b => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0);
  
  const ordersRevenue = allOrders
    .filter(o => o.status === "delivered" || o.status === "shipped")
    .reduce((sum, o) => sum + (o.price || 0), 0);

  const totalRevenue = bookingsRevenue + ordersRevenue;

  // Rating Stats
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (store?.rating || "0.0");
  const totalReviews = reviews.length > 0 ? reviews.length : (store?.totalReviews || 0);

  // Today's Stats
  const todayRevenue = todayBookings
    .filter(b => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.price || 0), 0) +
    todayOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + (o.price || 0), 0);

  // Pending Actions
  const totalPendingActions = pendingBookings.length + pendingOrders.length;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title">
        <h1>Store Console Dashboard</h1>
        <p>Welcome back, <strong>{user?.fullName || "Store Owner"}</strong>! Here is your business activity overview for today.</p>
      </div>

      {/* Main Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card" style={{ borderLeft: "4px solid var(--primary)" }}>
          <div className="stat-info">
            <h3>Today's Revenue</h3>
            <div className="stat-value">₹{todayRevenue}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              Combined booking & product sales
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <div className="stat-info">
            <h3>Today's Bookings</h3>
            <div className="stat-value">{todayBookings.length}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              {todayBookings.filter(b => b.status === "pending").length} pending confirmation
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid var(--success)" }}>
          <div className="stat-info">
            <h3>Today's Orders</h3>
            <div className="stat-value">{todayOrders.length}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              {todayOrders.filter(o => o.status === "pending").length} pending delivery
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid var(--warning)" }}>
          <div className="stat-info">
            <h3>Pending Actions</h3>
            <div className="stat-value" style={{ color: totalPendingActions > 0 ? "var(--warning)" : "#fff" }}>
              {totalPendingActions}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              Requires manager response
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <Activity size={24} />
          </div>
        </div>
      </section>

      {/* Grid of details: Recent Bookings & Reviews */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, marginBottom: 40 }}>
        {/* Left Side: Today's / Recent Bookings */}
        <div className="section-panel" style={{ margin: 0 }}>
          <div className="panel-header">
            <h2 className="panel-title">
              <Calendar size={20} style={{ color: "var(--primary)" }} />
              Recent Booking Appointments
            </h2>
            <Link to="/bookings" style={{ fontSize: 13, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, textDecoration: "none" }}>
              View All Console <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Schedule</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 40 }}>
                      No recent bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.slice(0, 5).map((b) => (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: "#fff" }}>{b.userId?.fullName || "Unverified User"}</span>
                        <span style={{ display: "block", fontSize: 11, color: "var(--text-tertiary)" }}>🐶 {b.petDetails?.name || "Buddy"}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.serviceName}</td>
                      <td>
                        <span style={{ display: "block", fontWeight: 600 }}>{b.date}</span>
                        <span style={{ display: "block", fontSize: 11, color: "var(--text-tertiary)" }}>{b.timeSlot}</span>
                      </td>
                      <td>
                        <span className={`badge badge-${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Rating & Review Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Rating Circle panel */}
          <div className="section-panel" style={{ margin: 0, padding: 24, textAlign: "center", background: "radial-gradient(circle at 50% 50%, rgba(255,107,53,0.05) 0%, transparent 100%), var(--bg-secondary)" }}>
            <h4 style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12 }}>Customer Trust Rating</h4>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, margin: "12px 0" }}>
              <Star size={36} fill="var(--warning)" color="var(--warning)" />
              <span style={{ fontSize: 44, fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>{averageRating}</span>
              <span style={{ fontSize: 20, color: "var(--text-tertiary)", alignSelf: "flex-end", marginBottom: 6 }}>/5</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Based on {totalReviews} client reviews</p>
          </div>

          {/* Feedback list */}
          <div className="section-panel" style={{ margin: 0, padding: 24, flex: 1 }}>
            <h4 style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 700, marginBottom: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={16} /> Latest Reviews
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reviews.slice(0, 3).length === 0 ? (
                <p style={{ color: "var(--text-tertiary)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  No customer reviews received yet.
                </p>
              ) : (
                reviews.slice(0, 3).map((r, idx) => (
                  <div key={idx} style={{ background: "var(--bg-tertiary)", padding: 12, borderRadius: 12, border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{r.userId?.fullName || "Verified Owner"}</span>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < r.rating ? "var(--warning)" : "transparent"} color="var(--warning)" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>
                      "{r.reviewText || "No text review left."}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Sales Orders */}
      <div className="section-panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <ShoppingBag size={20} style={{ color: "var(--primary)" }} />
            Recent Sales Orders (Product Delivery)
          </h2>
          <Link to="/orders" style={{ fontSize: 13, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, textDecoration: "none" }}>
            Manage Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product Purchased</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 30 }}>
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{o._id}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#fff", display: "block" }}>{o.customerName}</span>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block" }}>{o.customerPhone}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.productName}</td>
                    <td style={{ fontWeight: 700 }}>{o.quantity}</td>
                    <td style={{ fontWeight: 700 }}>₹{o.price}</td>
                    <td>{o.paymentMethod}</td>
                    <td>
                      <span className={`badge badge-${o.status}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
