import React, { useState, useEffect } from "react";
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Search, 
  ShoppingBag, 
  AlertTriangle,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { getMockOrders, updateOrderStatus } from "../utils/mockData";

function ProductsManager({ category, title }) {
  const { 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    dataLoading,
    showAlert
  } = useStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" or "orders"
  const [orders, setOrders] = useState([]);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: category,
    stock: "",
    image: "",
    active: true
  });

  const loadData = async () => {
    setLoading(true);
    const fetched = await fetchProducts(category);
    setProducts(fetched);
    
    // Load category-specific mock orders
    const allOrders = getMockOrders();
    const categoryOrders = allOrders.filter(o => o.category.toLowerCase() === category.toLowerCase());
    setOrders(categoryOrders);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Prefill category on change
    setFormData(prev => ({ ...prev, category }));
  }, [category]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      category: category,
      stock: "10",
      image: "",
      active: true
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      originalPrice: p.originalPrice || "",
      category: p.category || category,
      stock: p.stock || "0",
      image: p.image || "",
      active: p.active !== undefined ? p.active : true
    });
    setShowFormModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      stock: Number(formData.stock)
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, payload);
    } else {
      result = await addProduct(payload);
    }

    if (result.success) {
      setShowFormModal(false);
      loadData();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(id);
      if (success) {
        loadData();
      }
    }
  };

  const handleUpdateStock = async (product, newStock) => {
    const stockVal = parseInt(newStock);
    if (isNaN(stockVal) || stockVal < 0) return;
    
    const result = await updateProduct(product._id, {
      ...product,
      stock: stockVal
    });
    if (result.success) {
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, stock: stockVal } : p));
    }
  };

  const handleOrderAction = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    // Reload orders
    const allOrders = getMockOrders();
    const categoryOrders = allOrders.filter(o => o.category.toLowerCase() === category.toLowerCase());
    setOrders(categoryOrders);
    showAlert("success", `Order ${orderId} status updated to ${newStatus}`);
  };

  // Filter products by search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const totalProducts = products.length;
  const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
  const totalCategoryOrders = orders.length;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>{title}</h1>
          <p>Manage product listings, inventory stock levels, and category sales orders.</p>
        </div>
        <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "10px 24px" }} onClick={handleOpenAdd}>
          <Plus size={18} style={{ marginRight: 6 }} />
          Add Product
        </button>
      </div>

      {/* Metrics Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Items</h3>
            <div className="stat-value">{totalProducts}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#fff" }}>
            <Layers size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Out of Stock</h3>
            <div className="stat-value" style={{ color: outOfStock > 0 ? "var(--danger)" : "#fff" }}>{outOfStock}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: outOfStock > 0 ? "var(--danger-light)" : "rgba(255,255,255,0.05)", color: outOfStock > 0 ? "var(--danger)" : "var(--text-secondary)" }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Inventory Value</h3>
            <div className="stat-value">₹{totalValue}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Sales Orders</h3>
            <div className="stat-value">{totalCategoryOrders}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <ShoppingBag size={24} />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: 28 }}>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            Manage Inventory
          </button>
          <button 
            className={`tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            View Orders ({totalCategoryOrders})
          </button>
        </div>
      </div>

      {activeTab === "inventory" ? (
        <>
          {/* Action Bar */}
          <div className="table-actions" style={{ marginBottom: 20 }}>
            <div className="search-bar-container" style={{ maxWidth: 400 }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search products by name or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-container" style={{ padding: "60px 0" }}>
              <Loader2 className="animate-spin" size={40} style={{ color: "var(--primary)" }} />
              <p>Fetching inventory from database...</p>
            </div>
          ) : (
            <div className="section-panel" style={{ padding: 24 }}>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Original Price</th>
                      <th>Stock Level</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                          No products found in this category.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                              {p.image ? (
                                <img src={p.image} alt={p.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", backgroundColor: "var(--bg-tertiary)" }} />
                              ) : (
                                <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", justify: "center", fontSize: 20 }}>
                                  📦
                                </div>
                              )}
                              <div>
                                <span style={{ fontWeight: 700, color: "#fff", display: "block" }}>{p.name}</span>
                                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {p.description || "No description provided."}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                          <td style={{ color: "var(--text-tertiary)", textDecoration: "line-through" }}>
                            {p.originalPrice ? `₹${p.originalPrice}` : "-"}
                          </td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <input
                                type="number"
                                min="0"
                                value={p.stock}
                                onChange={(e) => handleUpdateStock(p, e.target.value)}
                                style={{
                                  width: 70,
                                  background: "var(--bg-tertiary)",
                                  border: "1px solid var(--border-color)",
                                  color: "#fff",
                                  padding: "6px 8px",
                                  borderRadius: 8,
                                  fontWeight: 600,
                                  textAlign: "center"
                                }}
                              />
                              {p.stock === 0 && (
                                <span style={{ color: "var(--danger)", fontSize: 11, fontWeight: 700 }}>OUT</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${p.active ? "badge-confirmed" : "badge-cancelled"}`}>
                              {p.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-icon" onClick={() => handleOpenEdit(p)} title="Edit Details">
                                <Edit size={16} />
                              </button>
                              <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(p._id)} title="Delete Product">
                                <Trash2 size={16} />
                              </button>
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
        </>
      ) : (
        /* Orders Tab */
        <div className="section-panel" style={{ padding: 24 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product Purchased</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
                      No sales orders found for this product category.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--primary)" }}>{o._id}</td>
                      <td>
                        <div className="details-box">
                          <span className="details-title">{o.customerName}</span>
                          <span className="details-sub">{o.customerPhone}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{o.productName}</td>
                      <td style={{ fontWeight: 700 }}>{o.quantity}</td>
                      <td style={{ fontWeight: 700 }}>₹{o.price}</td>
                      <td>{o.paymentMethod}</td>
                      <td>
                        <span className={`badge badge-${o.status}`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {o.status === "pending" && (
                            <button 
                              className="btn-icon btn-icon-success"
                              title="Mark as Shipped"
                              onClick={() => handleOrderAction(o._id, "shipped")}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {o.status === "shipped" && (
                            <button 
                              className="btn-icon btn-icon-success"
                              title="Mark as Delivered"
                              onClick={() => handleOrderAction(o._id, "delivered")}
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {o.status !== "delivered" && o.status !== "cancelled" && (
                            <button 
                              className="btn-icon btn-icon-danger"
                              title="Cancel Order"
                              onClick={() => handleOrderAction(o._id, "cancelled")}
                            >
                              <XCircle size={15} />
                            </button>
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

      {/* Add/Edit Product Modal */}
      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content-lg animate-fade-in" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pwc">
              <h3 className="modal-title-pwc">
                <Package size={20} style={{ color: "var(--primary)" }} />
                {editingProduct ? "Edit Product Details" : "Add New Product"}
              </h3>
              <button onClick={() => setShowFormModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-pwc" style={{ padding: 24, gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Premium Rubber Tug Toy"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="input-field"
                    style={{ minHeight: 80, resize: "vertical" }}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of product features..."
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price (Sale) ₹</label>
                    <input
                      type="number"
                      name="price"
                      min="1"
                      className="input-field"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      placeholder="Price"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Original Price (MRP) ₹</label>
                    <input
                      type="number"
                      name="originalPrice"
                      min="1"
                      className="input-field"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Initial Stock</label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      className="input-field"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.category}
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Product Image URL</label>
                  <div style={{ position: "relative" }}>
                    <ImageIcon size={16} style={{ position: "absolute", left: 14, top: 16, color: "var(--text-tertiary)" }} />
                    <input
                      type="text"
                      name="image"
                      className="input-field"
                      style={{ paddingLeft: 42 }}
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    style={{ width: 18, height: 18, accentColor: "var(--primary)" }}
                  />
                  <label htmlFor="active" style={{ fontSize: 14, color: "#fff", cursor: "pointer" }}>
                    Publish Product (Visible to Customers)
                  </label>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: 12 }}>
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsManager;
