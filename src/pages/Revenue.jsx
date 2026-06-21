import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  ArrowUpRight, 
  Download, 
  PieChart, 
  Percent,
  TrendingDown,
  ArrowDownRight,
  ChevronRight,
  Layers,
  Activity
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { getMockOrders } from "../utils/mockData";

function Revenue() {
  const { bookings } = useStore();
  const [filterPeriod, setFilterPeriod] = useState("monthly"); // "daily" | "weekly" | "monthly"
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(getMockOrders());
  }, []);

  // Basic aggregation
  const confirmedBookings = bookings.filter(b => b.status === "confirmed" || b.status === "completed");
  const completedOrders = orders.filter(o => o.status === "shipped" || o.status === "delivered");

  const bookingsRevenueSum = confirmedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const ordersRevenueSum = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  const totalRevenueSum = bookingsRevenueSum + ordersRevenueSum;

  const totalTransactionsCount = confirmedBookings.length + completedOrders.length;
  const avgOrderVal = totalTransactionsCount > 0 ? Math.round(totalRevenueSum / totalTransactionsCount) : 0;

  // Generate breakdown lists based on mock data
  const getDailyBreakdown = () => {
    // Last 7 days
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayBookings = confirmedBookings.filter(b => b.date === dateStr);
      const dayOrders = completedOrders.filter(o => o.date === dateStr);
      
      const bRev = dayBookings.reduce((s, b) => s + b.price, 0);
      const oRev = dayOrders.reduce((s, o) => s + o.price, 0);
      const total = bRev + oRev;

      list.push({
        label: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        bookingsCount: dayBookings.length,
        ordersCount: dayOrders.length,
        bookingsRev: bRev,
        ordersRev: oRev,
        totalRev: total
      });
    }
    return list;
  };

  const getWeeklyBreakdown = () => {
    // Last 4 weeks
    const list = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date();
      start.setDate(start.getDate() - (i * 7) - 6);
      const end = new Date();
      end.setDate(end.getDate() - (i * 7));

      const label = `Week of ${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString([], { day: 'numeric' })}`;
      
      // Filter items within date range
      const rangeBookings = confirmedBookings.filter(b => {
        const bDate = new Date(b.date);
        return bDate >= start && bDate <= end;
      });
      const rangeOrders = completedOrders.filter(o => {
        const oDate = new Date(o.date);
        return oDate >= start && oDate <= end;
      });

      const bRev = rangeBookings.reduce((s, b) => s + b.price, 0);
      const oRev = rangeOrders.reduce((s, o) => s + o.price, 0);
      
      list.push({
        label,
        bookingsCount: rangeBookings.length,
        ordersCount: rangeOrders.length,
        bookingsRev: bRev,
        ordersRev: oRev,
        totalRev: bRev + oRev
      });
    }
    return list;
  };

  const getMonthlyBreakdown = () => {
    // Last 3 months (mocked or aggregated)
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'long' });
    const prevMonth = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleString('default', { month: 'long' });

    // Mock aggregates for demonstration/real parity
    return [
      {
        label: `${currentMonth} 2026`,
        bookingsCount: confirmedBookings.length,
        ordersCount: completedOrders.length,
        bookingsRev: bookingsRevenueSum,
        ordersRev: ordersRevenueSum,
        totalRev: totalRevenueSum
      },
      {
        label: `${lastMonth} 2026`,
        bookingsCount: Math.round(confirmedBookings.length * 0.8) || 3,
        ordersCount: Math.round(completedOrders.length * 0.9) || 4,
        bookingsRev: Math.round(bookingsRevenueSum * 0.8),
        ordersRev: Math.round(ordersRevenueSum * 0.9),
        totalRev: Math.round(bookingsRevenueSum * 0.8) + Math.round(ordersRevenueSum * 0.9)
      },
      {
        label: `${prevMonth} 2026`,
        bookingsCount: Math.round(confirmedBookings.length * 0.75) || 2,
        ordersCount: Math.round(completedOrders.length * 0.85) || 3,
        bookingsRev: Math.round(bookingsRevenueSum * 0.75),
        ordersRev: Math.round(ordersRevenueSum * 0.85),
        totalRev: Math.round(bookingsRevenueSum * 0.75) + Math.round(ordersRevenueSum * 0.85)
      }
    ];
  };

  const breakdownData = 
    filterPeriod === "daily" ? getDailyBreakdown() : 
    filterPeriod === "weekly" ? getWeeklyBreakdown() : 
    getMonthlyBreakdown();

  // Simulated visual chart/bars
  const maxVal = Math.max(...breakdownData.map(d => d.totalRev || 1));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Revenue Reporting</h1>
          <p>Analyze income flows, compare services booking and products sales channels, and export financial summaries.</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ width: "auto", margin: 0, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
          onClick={() => {
            alert("Exporting financial statement report to PDF/CSV...");
          }}
        >
          <Download size={16} />
          Export Statement
        </button>
      </div>

      {/* Main metrics */}
      <section className="stats-grid">
        <div className="stat-card" style={{ borderLeft: "4px solid var(--success)" }}>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <div className="stat-value" style={{ color: "var(--success)" }}>₹{totalRevenueSum}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              Combined booking & product sales
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--success-light)", color: "var(--success)" }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Services Bookings</h3>
            <div className="stat-value">₹{bookingsRevenueSum}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              {confirmedBookings.length} completed appointments
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Product Sales</h3>
            <div className="stat-value">₹{ordersRevenueSum}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              {completedOrders.length} shipped/delivered orders
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "var(--primary-light)", color: "var(--primary)" }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Average Order Value</h3>
            <div className="stat-value">₹{avgOrderVal}</div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
              Gross sales per client check-out
            </p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#fff" }}>
            <Activity size={24} />
          </div>
        </div>
      </section>

      {/* Revenue Breakdown visual simulator */}
      <div className="section-panel" style={{ padding: 28 }}>
        <div className="panel-header">
          <h2 className="panel-title">
            <PieChart size={20} style={{ color: "var(--primary)" }} />
            Earnings Breakdown Chart
          </h2>
          <div className="filter-tabs">
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPeriod(p)}
                className={`filter-tab-btn ${filterPeriod === p ? "active" : ""}`}
                style={{ textTransform: "capitalize" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Bar chart simulator using CSS */}
        <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 16, borderBottom: "2px solid var(--border-color)", paddingBottom: 12, marginBottom: 24, marginTop: 12 }}>
          {breakdownData.map((d, idx) => {
            const pct = Math.max(10, Math.round((d.totalRev / maxVal) * 100));
            const bPct = Math.round((d.bookingsRev / (d.totalRev || 1)) * 100);
            return (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ width: "100%", height: 150, display: "flex", alignItems: "flex-end", background: "rgba(255,255,255,0.02)", borderRadius: 8, overflow: "hidden" }}>
                  <div 
                    style={{ 
                      width: "100%", 
                      height: `${pct}%`, 
                      background: `linear-gradient(to top, var(--primary) ${100 - bPct}%, #3b82f6 ${100 - bPct}%)`,
                      borderRadius: "6px 6px 0 0",
                      transition: "all 0.5s ease",
                      position: "relative"
                    }}
                    title={`Total: ₹${d.totalRev} (Bookings: ₹${d.bookingsRev}, Products: ₹${d.ordersRev})`}
                  />
                </div>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", textAlign: "center", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 20, justifyContent: "flex-end", fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "#3b82f6" }} />
            <span style={{ color: "var(--text-secondary)" }}>Services Revenue</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "var(--primary)" }} />
            <span style={{ color: "var(--text-secondary)" }}>Products Revenue</span>
          </div>
        </div>
      </div>

      {/* Financial Statement table */}
      <div className="section-panel" style={{ padding: 24 }}>
        <h2 className="panel-title" style={{ marginBottom: 20 }}>
          <Layers size={18} style={{ color: "var(--primary)" }} />
          Periodic Statements Table
        </h2>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Duration / Period</th>
                <th>Appointments Confirmed</th>
                <th>Products Sold</th>
                <th>Service revenue</th>
                <th>Product revenue</th>
                <th>Gross Earnings</th>
              </tr>
            </thead>
            <tbody>
              {breakdownData.map((d, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: "#fff" }}>{d.label}</td>
                  <td>{d.bookingsCount} booking(s)</td>
                  <td>{d.ordersCount} order(s)</td>
                  <td style={{ color: "#3b82f6", fontWeight: 600 }}>₹{d.bookingsRev}</td>
                  <td style={{ color: "var(--primary)", fontWeight: 600 }}>₹{d.ordersRev}</td>
                  <td style={{ fontWeight: 800, fontSize: 15, color: "var(--success)" }}>₹{d.totalRev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Revenue;
