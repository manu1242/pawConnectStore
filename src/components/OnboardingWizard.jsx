import React, { useState } from 'react';
import axios from 'axios';
import { 
  KeyRound, 
  User, 
  Store, 
  Image, 
  ArrowRight, 
  Check, 
  Lock, 
  AlertCircle 
} from 'lucide-react';

function OnboardingWizard({ user, store, token, onComplete, API_BASE }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Password State
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Profile State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  // Step 3: Store Details
  const [description, setDescription] = useState(store?.description || "");

  // Step 4: Images
  const [logo, setLogo] = useState(store?.logo || "");
  const [bannerImage, setBannerImage] = useState(store?.bannerImage || "");

  const handleNext = async () => {
    setError("");

    if (step === 1) {
      if (!tempPassword || !newPassword || !confirmPassword) {
        setError("Please fill in all password fields.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      setLoading(true);
      try {
        await axios.put(
          `${API_BASE}/auth/change-password`, 
          { oldPassword: tempPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Password changed successfully! Proceed to next step
        setStep(2);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update password. Verify current password.");
      } finally {
        setLoading(false);
      }
    } else if (step === 2) {
      if (!fullName || !phone) {
        setError("Please fill in your name and phone number.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!description || description.length < 10) {
        setError("Please provide a descriptive store bio (min 10 characters).");
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Update Profile (Name & Phone)
      await axios.put(
        `${API_BASE}/auth/profile`,
        { fullName, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Update Store details & set onboardingCompleted = true
      await axios.patch(
        `${API_BASE}/stores`,
        { 
          description,
          logo: logo || 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=150',
          bannerImage: bannerImage || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
          onboardingCompleted: true
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Trigger parent context reload
      await onComplete();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div className="auth-card animate-fade-in" style={{ maxWidth: 650, width: "100%", padding: 32 }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Complete Onboarding</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            Set up your manager account and unlock your store dashboard.
          </p>
        </div>

        {/* Progress Tracker */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, padding: "0 10px" }}>
          {[
            { num: 1, label: "Security", icon: KeyRound },
            { num: 2, label: "Profile", icon: User },
            { num: 3, label: "About Store", icon: Store },
            { num: 4, label: "Branding", icon: Image }
          ].map((s) => {
            const isCompleted = step > s.num;
            const isActive = step === s.num;
            const Icon = s.icon;

            return (
              <div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: isCompleted ? "var(--primary)" : isActive ? "var(--primary-light)" : "var(--bg-tertiary)",
                  border: `2px solid ${isActive || isCompleted ? "var(--primary)" : "var(--border-color)"}`,
                  color: isCompleted || isActive ? "#fff" : "var(--text-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 12,
                  zIndex: 2
                }}>
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span style={{ fontSize: 11, color: isActive ? "#fff" : "var(--text-tertiary)", marginTop: 6, fontWeight: isActive ? 600 : 400 }}>
                  {s.label}
                </span>

                {s.num < 4 && (
                  <div style={{
                    position: "absolute",
                    top: 18,
                    left: "50%",
                    right: "-50%",
                    height: 2,
                    backgroundColor: isCompleted ? "var(--primary)" : "var(--border-color)",
                    zIndex: 1
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-banner alert-banner-danger" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Step Forms */}
        <form onSubmit={step === 4 ? handleSubmit : (e) => e.preventDefault()}>
          
          {/* Step 1: Change Password */}
          {step === 1 && (
            <div className="animate-slide-in">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={18} style={{ color: "var(--primary)" }} /> Change Temporary Password
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Temporary Password (received in email)</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={tempPassword} 
                    onChange={(e) => setTempPassword(e.target.value)} 
                    placeholder="Enter welcome temporary password" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Enter your new secure password" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Repeat new password" 
                    required 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Complete Profile */}
          {step === 2 && (
            <div className="animate-slide-in">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                Update Contact Profile
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Manager Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manager Direct Mobile</label>
                  <input 
                    type="tel" 
                    className="input-field" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Store Description */}
          {step === 3 && (
            <div className="animate-slide-in">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                About Your Store / Clinic
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Store Description / Bio</label>
                  <textarea 
                    className="input-field" 
                    rows={5}
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Tell pet parents about your facilities, experience, and services..."
                    required 
                    style={{ resize: "vertical", minHeight: 100 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Logos and Banners */}
          {step === 4 && (
            <div className="animate-slide-in">
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                Store Assets & Branding
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Store Logo Image URL</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={logo} 
                    onChange={(e) => setLogo(e.target.value)} 
                    placeholder="e.g. https://images.unsplash.com/... or logo.png" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Storefront Banner URL</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={bannerImage} 
                    onChange={(e) => setBannerImage(e.target.value)} 
                    placeholder="e.g. https://images.unsplash.com/... or banner.jpg" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 30 }}>
            {step > 1 && (
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setStep(prev => prev - 1)}
                disabled={loading}
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleNext}
                disabled={loading}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                {loading ? "Processing..." : "Next Step"} <ArrowRight size={15} />
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? "Completing Onboarding..." : "Unlock Dashboard"}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}

export default OnboardingWizard;
