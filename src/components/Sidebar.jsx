import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingBag, 
  TrendingUp, 
  Bell, 
  Store, 
  Settings, 
  HelpCircle, 
  LogOut,
  Gift,
  Bone,
  Pill,
  Crown,
  HeartPulse,
  Scissors,
  Footprints,
  Home,
  Award,
  AlertOctagon
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function Sidebar() {
  const { user, store, notifications, handleLogout } = useStore();

  // Dynamic modules config
  const MODULES_CONFIG = [
    { id: "toys", label: "Toys Inventory", path: "/toys", icon: Gift },
    { id: "food", label: "Food & Nutrition", path: "/food", icon: Bone },
    { id: "medicines", label: "Medicines Shop", path: "/medicines", icon: Pill },
    { id: "accessories", label: "Accessories Shop", path: "/accessories", icon: Crown },
    { id: "veterinary", label: "Vet Clinic", path: "/veterinary", icon: HeartPulse },
    { id: "grooming", label: "Grooming Spa", path: "/grooming", icon: Scissors },
    { id: "walking", label: "Dog Walking", path: "/dog-walking", icon: Footprints },
    { id: "boarding", label: "Boarding Stay", path: "/boarding", icon: Home },
    { id: "training", label: "Dog Training", path: "/training", icon: Award },
    { id: "emergency", label: "Emergency Dispatch", path: "/emergency", icon: AlertOctagon }
  ];

  // Filter modules based on user permissions
  const allowedModules = MODULES_CONFIG.filter(mod => 
    user?.permissions?.includes(mod.id)
  );

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <aside className="sidebar animate-fade-in">
      <div className="sidebar-brand">
        <span className="brand-logo">🐾</span>
        <div className="brand-text">
          <span className="brand-name">PawConnect</span>
          <span className="brand-badge">Business</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Core Pages always visible */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/bookings"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Calendar size={18} />
          <span>Bookings Console</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <ShoppingBag size={18} />
          <span>Orders Console</span>
        </NavLink>

        <NavLink
          to="/revenue"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <TrendingUp size={18} />
          <span>Revenue Reporting</span>
        </NavLink>

        {/* Dynamic Permission-Based Modules */}
        {allowedModules.length > 0 && (
          <div className="sidebar-section-divider">
            <span className="sidebar-section-title">Store Services</span>
          </div>
        )}

        {allowedModules.map((mod) => {
          const IconComponent = mod.icon;
          return (
            <NavLink
              key={mod.id}
              to={mod.path}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <IconComponent size={18} />
              <span>{mod.label}</span>
            </NavLink>
          );
        })}

        {/* Account Settings always visible */}
        <div className="sidebar-section-divider">
          <span className="sidebar-section-title">Settings & Help</span>
        </div>

        <NavLink
          to="/notifications"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <div style={{ display: "flex", alignItems: "center", justify: "space-between", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Bell size={18} />
              <span>Alert Notices</span>
            </div>
            {unreadNotifsCount > 0 && (
              <span className="badge badge-emergency" style={{ margin: 0, padding: "2px 6px", fontSize: 10, borderRadius: 8 }}>
                {unreadNotifsCount}
              </span>
            )}
          </div>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Store size={18} />
          <span>Store Settings</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Settings size={18} />
          <span>Security Settings</span>
        </NavLink>

        <NavLink
          to="/support"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <HelpCircle size={18} />
          <span>Help & Support</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar-small">👦</div>
          <div className="user-details">
            <span className="user-name-text">{user?.fullName || "Store Owner"}</span>
            <span className="store-name-text">{store?.name || "My Store"}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
