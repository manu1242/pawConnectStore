import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, Store, Sparkles, LogOut, Shield, Tag } from "lucide-react";
import { useStore } from "../context/StoreContext";

function Sidebar() {
  const { user, store, handleLogout } = useStore();

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
        <NavLink
          to="/bookings"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Calendar size={20} />
          <span>Bookings Console</span>
        </NavLink>

        <NavLink
          to="/services"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Sparkles size={20} />
          <span>Service Management</span>
        </NavLink>

        <NavLink
          to="/promos"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Tag size={20} />
          <span>Promo Codes</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
        >
          <Store size={20} />
          <span>Store Settings</span>
        </NavLink>

        {(user?.businessType === "vet_clinic" || user?.businessType === "both") && (
          <NavLink
            to="/vet-clinic"
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Shield size={20} />
            <span>Vet Clinic Details</span>
          </NavLink>
        )}
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
