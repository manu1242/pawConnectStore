import React, { useState, useEffect } from "react";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  AlertOctagon, 
  Send, 
  Clock, 
  ChevronRight,
  LifeBuoy,
  FileText
} from "lucide-react";
import { useStore } from "../context/StoreContext";

function Support() {
  const { submitSupportFeedback, showAlert } = useStore();
  const [supportType, setSupportType] = useState("general");
  const [supportMessage, setSupportMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketHistory, setTicketHistory] = useState([]);

  // Load ticket history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("pwc_support_tickets");
    if (stored) {
      try {
        setTicketHistory(JSON.parse(stored));
      } catch (e) {
        setTicketHistory([]);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setLoading(true);
    const success = await submitSupportFeedback(supportType, supportMessage);
    setLoading(false);

    if (success) {
      const newTicket = {
        id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        type: supportType,
        message: supportMessage,
        date: new Date().toLocaleDateString(),
        status: "Open"
      };

      const updatedHistory = [newTicket, ...ticketHistory];
      setTicketHistory(updatedHistory);
      localStorage.setItem("pwc_support_tickets", JSON.stringify(updatedHistory));
      
      setSupportMessage("");
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-title">
        <h1>Help & Support center</h1>
        <p>Submit bug requests, ask onboarding questions, and connect with the PawConnect help desk.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        {/* Left Column: Support Form & History */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Submit ticket Form */}
          <div className="section-panel" style={{ margin: 0, padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--border-color)", paddingBottom: 12 }}>
              <LifeBuoy size={20} style={{ color: "var(--primary)" }} />
              Submit Support Query
            </h3>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Support Category</label>
                <select
                  className="input-field"
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="general">General Question / Inquiry</option>
                  <option value="booking">Customer Booking Appointment Issue</option>
                  <option value="payout">Store Payout / Financial Queries</option>
                  <option value="bug">Technical System Bug / Glitch</option>
                  <option value="onboarding">Business Onboarding Profile Issue</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Explain your Issue details</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: 140, resize: "vertical" }}
                  placeholder="Describe your issue with booking IDs, customer names, or actions taken..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, fontSize: 15 }}
                disabled={loading}
              >
                <Send size={16} />
                {loading ? "Sending ticket details..." : "Submit Support Request"}
              </button>
            </form>
          </div>

          {/* Ticket history */}
          <div className="section-panel" style={{ margin: 0, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} /> Support Request History
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ticketHistory.length === 0 ? (
                <p style={{ color: "var(--text-tertiary)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                  No open or closed support tickets found.
                </p>
              ) : (
                ticketHistory.map((t) => (
                  <div 
                    key={t.id}
                    style={{
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-color)",
                      padding: 16,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{t.id}</span>
                        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", padding: "2px 8px", borderRadius: 10, textTransform: "capitalize" }}>
                          {t.type}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#fff" }}>{t.message}</p>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginTop: 8 }}>
                        Submitted on {t.date}
                      </span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: t.status === "Open" ? "var(--warning)" : "var(--text-tertiary)",
                        background: t.status === "Open" ? "var(--warning-light)" : "rgba(255,255,255,0.05)",
                        padding: "4px 8px",
                        borderRadius: 6
                      }}
                    >
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contact Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Operations Contact */}
          <div className="section-panel" style={{ margin: 0, padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Helpdesk Contacts</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={16} />
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "block" }}>Toll-Free Phone Hotline</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>+91 1800 555 8899</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(59,130,246,0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={16} />
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "block" }}>Helpdesk Email</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>partners@pawconnect.in</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={16} />
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "block" }}>Response Guarantee</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Within 4 Operating Hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alert Hotline */}
          <div 
            className="section-panel" 
            style={{ 
              margin: 0, 
              padding: 24, 
              border: "1px solid rgba(239,68,68,0.2)", 
              background: "radial-gradient(circle at 10% 10%, rgba(239,68,68,0.05) 0%, transparent 100%), var(--bg-secondary)" 
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--danger)", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <AlertOctagon size={18} /> Emergency Incidents
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
              If you need immediate assistance with critical emergency booking operations or patient triage safety concerns, contact the 24/7 Priority Desk.
            </p>
            <a 
              href="tel:+919999988888"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "linear-gradient(135deg, var(--danger) 0%, #dc2626 100%)",
                color: "#fff",
                fontWeight: 700,
                textDecoration: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(239,68,68,0.2)"
              }}
            >
              <Phone size={14} /> Call Priority Desk
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;
