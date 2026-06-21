import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  IndianRupee, 
  Loader2, 
  Eye, 
  User, 
  Phone, 
  Mail,
  Calendar
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { getMockOrders, updateOrderStatus } from "../utils/mockData";

function Orders() {
  const { showAlert } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  const loadOrders = () => {
    setLoading(true);
    const fetched = getMockOrders();
    setOrders(fetched);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = updateOrderStatus(orderId, newStatus);
    setOrders(updated);
    if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
      setSelectedOrderDetails(prev => ({ ...prev, status: newStatus }));
    }
    showAlert("success", `Order #${orderId} status successfully marked as ${newStatus}!`);
  };

  // Filter & Search
  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesSearch = 
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Stats
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const shippedCount = orders.filter(o => o.status === "shipped").length;
  const deliveredCount = orders.filter(o => o.status === "delivered").length;
  const totalRevenue = orders
    .filter(o => o.status === "delivered" || o.status === "shipped")
    .reduce((sum, o) => sum + (o.price || 0), 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title">
        <h1>Product Orders Console</h1>
        <p>Monitor product purchases, package shipping dispatches, and delivery status logs.</p>
      </div>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Orders</h3>
            <div className="stat-value">{totalCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#fff" }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <div className="stat-value">{pendingCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Dispatched / Shipped</h3>
            <div className="stat-value">{shippedCount}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Product Revenue</h3>
            <div className="stat-value">₹{totalRevenue}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <IndianRupee size={24} />
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <div className="table-actions">
        <div className="search-bar-container" style={{ maxWidth: 400 }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search order ID, product name, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {["all", "pending", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`filter-tab-btn ${filterStatus === st ? "active" : ""}`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Loader2 className="animate-spin" size={48} style={{ color: "var(--primary)" }} />
          <p>Loading products purchase order logs...</p>
        </div>
      ) : (
        <div className="section-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <ShoppingBag size={20} style={{ color: "var(--primary)" }} />
              Live Product Orders ({filteredOrders.length})
            </h2>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product Details</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No orders matching query found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{o._id}</td>
                      <td>
                        <div className="details-box">
                          <span className="details-title">{o.customerName}</span>
                          <span className="details-sub">
                            <Phone size={11} /> {o.customerPhone}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{o.productName}</td>
                      <td style={{ textTransform: "capitalize" }}>{o.category}</td>
                      <td style={{ fontWeight: 700 }}>{o.quantity}</td>
                      <td style={{ fontWeight: 700 }}>₹{o.price}</td>
                      <td>
                        <span className={`badge badge-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            style={{ backgroundColor: "rgba(255,107,53,0.1)", color: "var(--primary)" }}
                            title="Order Details"
                            onClick={() => setSelectedOrderDetails(o)}
                          >
                            <Eye size={16} />
                          </button>
                          {o.status === "pending" && (
                            <>
                              <button 
                                className="btn-icon btn-icon-success" 
                                title="Ship Package"
                                onClick={() => handleUpdateStatus(o._id, "shipped")}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger" 
                                title="Cancel Order"
                                onClick={() => handleUpdateStatus(o._id, "cancelled")}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {o.status === "shipped" && (
                            <>
                              <button 
                                className="btn-icon btn-icon-success" 
                                title="Mark as Delivered"
                                onClick={() => handleUpdateStatus(o._id, "delivered")}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                className="btn-icon btn-icon-danger" 
                                title="Cancel Order"
                                onClick={() => handleUpdateStatus(o._id, "cancelled")}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="modal-content-lg animate-fade-in" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <span>📦</span> Order Invoice details: {selectedOrderDetails._id}
              </h3>
              <button onClick={() => setSelectedOrderDetails(null)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            
            <div className="modal-body-pwc" style={{ padding: 24, gap: 20 }}>
              <div className="modal-section-card" style={{ margin: 0 }}>
                <h4 className="modal-section-title"><User size={14} style={{ marginRight: 6 }} /> Customer Information</h4>
                <div className="info-item-row">
                  <span className="info-item-label">Customer Name</span>
                  <span className="info-item-val">{selectedOrderDetails.customerName}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Email Address</span>
                  <span className="info-item-val">{selectedOrderDetails.customerEmail}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Phone Number</span>
                  <span className="info-item-val">{selectedOrderDetails.customerPhone}</span>
                </div>
              </div>

              <div className="modal-section-card" style={{ margin: 0 }}>
                <h4 className="modal-section-title"><ShoppingBag size={14} style={{ marginRight: 6 }} /> Order Specifications</h4>
                <div className="info-item-row">
                  <span className="info-item-label">Product Name</span>
                  <span className="info-item-val" style={{ color: "var(--primary)" }}>{selectedOrderDetails.productName}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Product Category</span>
                  <span className="info-item-val" style={{ textTransform: "capitalize" }}>{selectedOrderDetails.category}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Order Date</span>
                  <span className="info-item-val">{selectedOrderDetails.date}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Quantity Selected</span>
                  <span className="info-item-val">{selectedOrderDetails.quantity} unit(s)</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Payment Gateway</span>
                  <span className="info-item-val">{selectedOrderDetails.paymentMethod}</span>
                </div>
                <div className="info-item-row">
                  <span className="info-item-label">Status Logs</span>
                  <span className={`badge badge-${selectedOrderDetails.status}`}>{selectedOrderDetails.status}</span>
                </div>
                <div className="info-item-row" style={{ marginTop: 12, borderTop: "1px dashed var(--border-color)", paddingTop: 10 }}>
                  <span className="info-item-label" style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Grand Total Amount</span>
                  <span className="info-item-val" style={{ fontSize: 16, color: "var(--primary)", fontWeight: 900 }}>₹{selectedOrderDetails.price}</span>
                </div>
              </div>

              {selectedOrderDetails.status !== "delivered" && selectedOrderDetails.status !== "cancelled" && (
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  {selectedOrderDetails.status === "pending" && (
                    <button 
                      className="btn-primary" 
                      style={{ margin: 0, padding: 12 }} 
                      onClick={() => handleUpdateStatus(selectedOrderDetails._id, "shipped")}
                    >
                      Ship Order Package
                    </button>
                  )}
                  {selectedOrderDetails.status === "shipped" && (
                    <button 
                      className="btn-primary" 
                      style={{ margin: 0, padding: 12, background: "linear-gradient(135deg, var(--success) 0%, #0d9488 100%)", boxShadow: "0 4px 12px rgba(16,185,129,0.25)" }} 
                      onClick={() => handleUpdateStatus(selectedOrderDetails._id, "delivered")}
                    >
                      Confirm Successful Delivery
                    </button>
                  )}
                  <button 
                    className="btn-secondary" 
                    style={{ margin: 0, padding: 12, color: "var(--danger)", border: "1px solid rgba(239,68,68,0.2)" }} 
                    onClick={() => handleUpdateStatus(selectedOrderDetails._id, "cancelled")}
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
