import React from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  MessageSquare, 
  Tag, 
  Info, 
  Calendar, 
  Trash2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, dataLoading } = useStore();

  const getNotifIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "booking_created":
      case "booking":
        return <Calendar size={18} style={{ color: "var(--primary)" }} />;
      case "promo":
      case "offer":
        return <Tag size={18} style={{ color: "var(--success)" }} />;
      case "review":
      case "feedback":
        return <MessageSquare size={18} style={{ color: "#3b82f6" }} />;
      case "alert":
      case "emergency":
        return <AlertCircle size={18} style={{ color: "var(--danger)" }} />;
      default:
        return <Info size={18} style={{ color: "var(--text-secondary)" }} />;
    }
  };

  // Sort: Unread first, then newest
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.read === b.read) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return a.read ? 1 : -1;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Alerts & Notifications</h1>
          <p>Review booking appointment notifications, store announcements, and system alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            className="btn-primary" 
            style={{ width: "auto", margin: 0, padding: "10px 24px", display: "flex", alignItems: "center", gap: 8 }}
            onClick={markAllNotificationsRead}
          >
            <CheckCheck size={16} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="section-panel" style={{ padding: 24 }}>
        <div className="panel-header" style={{ marginBottom: 20 }}>
          <h2 className="panel-title">
            <Bell size={20} style={{ color: "var(--primary)" }} />
            Inbox ({notifications.length} notifications, {unreadCount} unread)
          </h2>
        </div>

        {sortedNotifications.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: 60 }}>
            <Bell size={48} style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} />
            <h3>No Notifications Found</h3>
            <p style={{ fontSize: 13, marginTop: 4 }}>You are all caught up! Booking and account notices will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sortedNotifications.map((n) => (
              <div 
                key={n._id} 
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  background: n.read ? "rgba(255,255,255,0.01)" : "rgba(255,107,53,0.03)",
                  border: n.read ? "1px solid var(--border-color)" : "1px solid rgba(255,107,53,0.25)",
                  padding: 16,
                  borderRadius: 16,
                  transition: "var(--transition-smooth)"
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flex: 1 }}>
                  <div style={{ 
                    width: 38, 
                    height: 38, 
                    borderRadius: 10, 
                    backgroundColor: n.read ? "var(--bg-tertiary)" : "var(--primary-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {getNotifIcon(n.type)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: n.read ? "var(--text-primary)" : "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                      {n.title}
                      {!n.read && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--primary)", display: "inline-block" }} />
                      )}
                    </h4>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                      {n.message}
                    </p>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>
                      <Clock size={10} /> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    className="btn-icon"
                    style={{ flexShrink: 0, marginLeft: 12 }}
                    onClick={() => markNotificationRead(n._id)}
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
