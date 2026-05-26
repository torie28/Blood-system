import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext.jsx";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const API = "http://localhost:8000/api";
const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

const STATUS_CLASSES = {
  pending: "recipient-status-pending",
  approved: "recipient-status-approved",
  rejected: "recipient-status-rejected",
  fulfilled: "recipient-status-fulfilled",
};

const emptyForm = () => ({
  from_hospital_id: "",
  to_hospital_id: "",
  location_id: "",
  blood_group: "",
  units_requested: "",
  request_date: new Date().toISOString().split("T")[0],
  contact_person: "",
  phone_number: "",
  email: "",
  patient_name: "",
  patient_age: "",
  patient_gender: "",
  reason: "",
  medical_history: "",
});

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
const ResipientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Determine the hospital linked to the logged-in user (hospital role)
  const myHospitalId = user?.hospital_id ?? null;
  const myHospitalName = user?.hospital?.name ?? null;
  const isHospitalUser = user?.role === "hospital";

  /* ── shared state ─────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState(() => {
    // AuthContext restores user asynchronously, so we read localStorage
    // directly here to get the correct default tab on page refresh.
    try {
      const stored = localStorage.getItem("user");
      const role = stored ? JSON.parse(stored)?.role : null;
      return role === "hospital" ? "home" : "new-request";
    } catch {
      return "new-request";
    }
  });
  const [hospitals, setHospitals] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── my hospital's own inventory (Home tab) ─────────────── */
  const [myInventory, setMyInventory] = useState(null);
  const [myInventoryLoading, setMyInventoryLoading] = useState(false);

  /* ── inventory ────────────────────────────────────────────── */
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryFilter, setInventoryFilter] = useState("");
  const [inventoryLoading, setInventoryLoading] = useState(true);

  /* ── outgoing requests (My Requests) ─────────────────────── */
  const [outgoing, setOutgoing] = useState([]);
  const [outgoingLoading, setOutgoingLoading] = useState(false);

  /* ── incoming requests ────────────────────────────────────── */
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  /* ── new-request form ─────────────────────────────────────── */
  const [formData, setFormData] = useState(() => {
    const base = emptyForm();
    if (myHospitalId) base.from_hospital_id = String(myHospitalId);
    return base;
  });
  const [submitting, setSubmitting] = useState(false);

  /* ── notification banner ──────────────────────────────────── */
  // type: 'success' | 'error' | 'warning'
  const [notification, setNotification] = useState(null);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 8000);
    return () => clearTimeout(t);
  }, [notification]);

  /* ── urgency levels ───────────────────────────────────────── */
  const [urgencyLevels, setUrgencyLevels] = useState([]);

  /* ── donor-request form ───────────────────────────────────── */
  const emptyDonorReqForm = () => ({
    blood_group: "",
    units_needed: "",
    urgency_level_id: "",
    contact_person: "",
    contact_number: "",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    title: "",
    description: "",
  });

  const [donorReqForm, setDonorReqForm] = useState(emptyDonorReqForm);
  const [donorReqSubmitting, setDonorReqSubmitting] = useState(false);
  const [donorReqNotification, setDonorReqNotification] = useState(null);
  const [myDonorRequests, setMyDonorRequests] = useState([]);
  const [myDonorReqLoading, setMyDonorReqLoading] = useState(false);

  useEffect(() => {
    if (!donorReqNotification) return;
    const t = setTimeout(() => setDonorReqNotification(null), 8000);
    return () => clearTimeout(t);
  }, [donorReqNotification]);

  /* ─────────────────────────────────────────────────────────── */
  /*  Data fetching                                              */
  /* ─────────────────────────────────────────────────────────── */

  const fetchMyInventory = useCallback(async () => {
    if (!myHospitalId) return;
    setMyInventoryLoading(true);
    try {
      const res = await fetch(`${API}/blood-inventory`);
      const data = await res.json();
      if (data.success) {
        const mine = data.data.find(
          (h) => String(h.id) === String(myHospitalId),
        );
        setMyInventory(mine ?? null);
      }
    } catch (err) {
      console.error("Error fetching own inventory:", err);
    } finally {
      setMyInventoryLoading(false);
    }
  }, [myHospitalId]);

  const fetchInventory = useCallback(async () => {
    setInventoryLoading(true);
    try {
      const res = await fetch(`${API}/blood-inventory`);
      const data = await res.json();
      if (data.success) setInventoryData(data.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setInventoryLoading(false);
    }
  }, []);

  const fetchOutgoing = useCallback(async () => {
    if (!myHospitalId) return;
    setOutgoingLoading(true);
    try {
      const res = await fetch(
        `${API}/inter-hospital-requests/outgoing/${myHospitalId}`,
      );
      const data = await res.json();
      if (data.success) setOutgoing(data.data);
    } catch (err) {
      console.error("Error fetching outgoing requests:", err);
    } finally {
      setOutgoingLoading(false);
    }
  }, [myHospitalId]);

  const fetchIncoming = useCallback(async () => {
    if (!myHospitalId) return;
    setIncomingLoading(true);
    try {
      const res = await fetch(
        `${API}/inter-hospital-requests/incoming/${myHospitalId}`,
      );
      const data = await res.json();
      if (data.success) setIncoming(data.data);
    } catch (err) {
      console.error("Error fetching incoming requests:", err);
    } finally {
      setIncomingLoading(false);
    }
  }, [myHospitalId]);

  const fetchUrgencyLevels = useCallback(async () => {
    try {
      const res = await fetch(`${API}/urgency-levels`);
      const data = await res.json();
      if (data.success) setUrgencyLevels(data.data);
    } catch (err) {
      console.error("Error fetching urgency levels:", err);
    }
  }, []);

  const fetchMyDonorRequests = useCallback(async () => {
    if (!myHospitalId) return;
    setMyDonorReqLoading(true);
    try {
      const res = await fetch(
        `${API}/donor-requests?hospital_id=${myHospitalId}`,
      );
      const data = await res.json();
      if (data.success) setMyDonorRequests(data.requests ?? []);
    } catch (err) {
      console.error("Error fetching donor requests:", err);
    } finally {
      setMyDonorReqLoading(false);
    }
  }, [myHospitalId]);

  // Bootstrap: hospitals + blood groups
  useEffect(() => {
    (async () => {
      try {
        const [hRes, bgRes] = await Promise.all([
          fetch(`${API}/hospitals`),
          fetch(`${API}/blood-groups`),
        ]);
        const hData = await hRes.json();
        const bgData = await bgRes.json();
        if (hData.success) setHospitals(hData.data);
        if (bgData.success) setBloodTypes(bgData.data);
      } catch (err) {
        console.error("Error loading form data:", err);
      } finally {
        setLoading(false);
      }
    })();
    fetchUrgencyLevels();
  }, [fetchUrgencyLevels]);

  // Fetch own inventory as soon as myHospitalId is available.
  // Using [myHospitalId] instead of [] because AuthContext loads the user
  // asynchronously — myHospitalId is null on the very first render and
  // only becomes a real value after the AuthContext useEffect fires.
  useEffect(() => {
    if (myHospitalId && !myInventory) {
      fetchMyInventory();
    }
  }, [myHospitalId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync from_hospital_id into formData once myHospitalId resolves.
  // The useState initializer runs before AuthContext finishes loading,
  // so myHospitalId is null at that point and needs to be patched in here.
  useEffect(() => {
    if (myHospitalId) {
      setFormData((prev) => ({
        ...prev,
        from_hospital_id: String(myHospitalId),
      }));
    }
  }, [myHospitalId]);

  // Lazy-load tabs
  useEffect(() => {
    if (activeTab === "home" && isHospitalUser && !myInventory) {
      fetchMyInventory();
    }
    if (activeTab === "blood-inventory" && inventoryData.length === 0) {
      fetchInventory();
    }
    if (activeTab === "my-requests" && outgoing.length === 0) {
      fetchOutgoing();
    }
    if (activeTab === "incoming-requests" && incoming.length === 0) {
      fetchIncoming();
    }
    if (activeTab === "donor-request" && myDonorRequests.length === 0) {
      fetchMyDonorRequests();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─────────────────────────────────────────────────────────── */
  /*  Form handlers                                              */
  /* ─────────────────────────────────────────────────────────── */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-fill location from the selected destination hospital
      if (name === "to_hospital_id") {
        const h = hospitals.find((h) => String(h.id) === value);
        if (h?.location_id) updated.location_id = String(h.location_id);
      }
      return updated;
    });
  };

  const handleRequestFromInventory = (hospitalId, bloodType) => {
    const h = hospitals.find((h) => String(h.id) === String(hospitalId));
    setFormData((prev) => ({
      ...prev,
      to_hospital_id: String(hospitalId),
      blood_group: bloodType,
      location_id: h?.location_id ? String(h.location_id) : prev.location_id,
    }));
    setActiveTab("new-request");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);
    try {
      // Ensure from_hospital_id is always present — myHospitalId may have
      // resolved after the useState initializer ran (async AuthContext).
      const payload = {
        ...formData,
        ...(myHospitalId ? { from_hospital_id: String(myHospitalId) } : {}),
      };
      const res = await fetch(`${API}/inter-hospital-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setNotification({
          type: "success",
          title: "Request Submitted",
          message:
            "Your inter-hospital blood request has been submitted successfully.",
        });
        const base = emptyForm();
        if (myHospitalId) base.from_hospital_id = String(myHospitalId);
        setFormData(base);
        fetchOutgoing();
      } else if (data.error_code === "INSUFFICIENT_STOCK") {
        const d = data.data ?? {};
        setNotification({
          type: "error",
          title: "Request Denied — Insufficient Stock",
          message: data.message,
          detail: `Available: ${d.available_units ?? 0} unit(s) · Requested: ${d.requested_units ?? formData.units_requested} unit(s) of ${d.blood_group ?? formData.blood_group}`,
        });
      } else {
        setNotification({
          type: "error",
          title: "Request Failed",
          message:
            data.message || "An unknown error occurred. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: "error",
        title: "Network Error",
        message:
          "Could not connect to the server. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  Incoming request status update                             */
  /* ─────────────────────────────────────────────────────────── */

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdatingId(requestId);
    try {
      const res = await fetch(
        `${API}/inter-hospital-requests/${requestId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await res.json();
      if (data.success) {
        setIncoming((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: newStatus } : r,
          ),
        );
      } else {
        alert("Failed to update status: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDonorReqChange = (e) => {
    const { name, value } = e.target;
    setDonorReqForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDonorReqSubmit = async (e) => {
    e.preventDefault();
    if (!myHospitalId) return;
    setDonorReqSubmitting(true);
    setDonorReqNotification(null);
    try {
      // Derive location_id from the hospital record
      const myHospital = hospitals.find(
        (h) => String(h.id) === String(myHospitalId),
      );
      const locationId = myHospital?.location_id ?? myHospital?.location?.id;
      if (!locationId) {
        setDonorReqNotification({
          type: "error",
          title: "Location Error",
          message:
            "Your hospital's location could not be determined. Please contact an admin.",
        });
        return;
      }
      const payload = {
        ...donorReqForm,
        hospital_id: String(myHospitalId),
        location_id: String(locationId),
      };
      const res = await fetch(`${API}/donor-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setDonorReqNotification({
          type: "success",
          title: "Request Submitted",
          message:
            "Your donor request has been submitted and is awaiting admin approval.",
        });
        setDonorReqForm(emptyDonorReqForm());
        fetchMyDonorRequests();
      } else {
        setDonorReqNotification({
          type: "error",
          title: "Submission Failed",
          message: data.message || "An error occurred. Please try again.",
        });
      }
    } catch (err) {
      console.error(err);
      setDonorReqNotification({
        type: "error",
        title: "Network Error",
        message: "Could not connect to server. Please check your connection.",
      });
    } finally {
      setDonorReqSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  Sign out                                                   */
  /* ─────────────────────────────────────────────────────────── */

  const handleSignOut = () => {
    logout();
    navigate("/signin");
  };

  /* ─────────────────────────────────────────────────────────── */
  /*  Render                                                     */
  /* ─────────────────────────────────────────────────────────── */

  return (
    <div className="recipient-dashboard-container">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="classic-dashboard-header">
        <div className="classic-dashboard-header-content">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "1.5rem" }}>🏥</span>
            <div>
              <h1 className="classic-dashboard-title">
                Inter-Hospital Blood Request System
              </h1>
              {myHospitalName && (
                <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.8 }}>
                  {myHospitalName}
                </p>
              )}
            </div>
          </div>
          <div className="classic-dashboard-user-info">
            <span className="recipient-welcome-text">
              Welcome, {user?.name ?? "Hospital Staff"}
            </span>
            <button onClick={handleSignOut} className="classic-signout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* ── Tab navigation ─────────────────────────────── */}
          <div className="recipient-tab-container">
            <div className="recipient-tab-nav">
              <nav className="-mb-px flex">
                {isHospitalUser && (
                  <button
                    onClick={() => setActiveTab("home")}
                    className={`recipient-tab-button ${activeTab === "home" ? "active" : ""}`}
                  >
                    🏠 Home
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("new-request")}
                  className={`recipient-tab-button ${activeTab === "new-request" ? "active" : ""}`}
                >
                  ➕ New Blood Request
                </button>
                <button
                  onClick={() => setActiveTab("my-requests")}
                  className={`recipient-tab-button ${activeTab === "my-requests" ? "active" : ""}`}
                >
                  📤 My Requests
                  {outgoing.length > 0 && (
                    <span className="recipient-tab-badge">
                      {outgoing.length}
                    </span>
                  )}
                </button>
                {isHospitalUser && (
                  <button
                    onClick={() => setActiveTab("incoming-requests")}
                    className={`recipient-tab-button ${activeTab === "incoming-requests" ? "active" : ""}`}
                  >
                    📥 Incoming Requests
                    {incoming.filter((r) => r.status === "pending").length >
                      0 && (
                      <span
                        className="recipient-tab-badge"
                        style={{ background: "#dc2626" }}
                      >
                        {incoming.filter((r) => r.status === "pending").length}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("blood-inventory")}
                  className={`recipient-tab-button ${activeTab === "blood-inventory" ? "active" : ""}`}
                >
                  🩸 Blood Inventory
                </button>
                <button
                  onClick={() => setActiveTab("donor-request")}
                  className={`recipient-tab-button ${activeTab === "donor-request" ? "active" : ""}`}
                >
                  🩸 Donor Request
                  {myDonorRequests.filter((r) => r.status === "approved")
                    .length > 0 && (
                    <span
                      className="recipient-tab-badge"
                      style={{ background: "#16a34a" }}
                    >
                      {
                        myDonorRequests.filter((r) => r.status === "approved")
                          .length
                      }
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TAB: Home — My Hospital Inventory
          ══════════════════════════════════════════════════ */}
          {activeTab === "home" && isHospitalUser && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                🏠 My Hospital Inventory
              </h2>

              {/* Banner */}
              <div className="recipient-home-banner">
                <div>
                  <div className="recipient-home-banner-title">
                    🏥 {myHospitalName ?? "Your Hospital"}
                  </div>
                  <div className="recipient-home-banner-subtitle">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <button
                  onClick={fetchMyInventory}
                  disabled={myInventoryLoading}
                  className="recipient-inventory-refresh-btn"
                >
                  {myInventoryLoading ? "↻ Refreshing…" : "↻ Refresh"}
                </button>
              </div>

              {/* Skeleton */}
              {myInventoryLoading && (
                <div className="recipient-home-skeleton">
                  {/* Stats skeleton */}
                  <div className="recipient-home-stats-grid">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="recipient-home-stat-card">
                        <div className="recipient-home-sk-circle" />
                        <div className="recipient-home-sk-line recipient-home-sk-stat-val" />
                        <div className="recipient-home-sk-line recipient-home-sk-stat-lbl" />
                      </div>
                    ))}
                  </div>

                  {/* Section title skeleton */}
                  <div className="recipient-home-sk-line recipient-home-sk-section-ttl" />

                  {/* Blood grid skeleton */}
                  <div className="recipient-home-blood-grid">
                    {BLOOD_TYPES.map((t) => (
                      <div key={t} className="recipient-home-blood-card">
                        <div className="recipient-home-sk-line recipient-home-sk-bt-type" />
                        <div className="recipient-home-sk-line recipient-home-sk-bt-units" />
                        <div className="recipient-home-sk-bar" />
                        <div className="recipient-home-sk-line recipient-home-sk-bt-level" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No data */}
              {!myInventoryLoading && !myInventory && (
                <div className="recipient-empty-state">
                  <p>No inventory data found for your hospital.</p>
                  <button
                    onClick={fetchMyInventory}
                    className="recipient-create-request-link"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Inventory content */}
              {!myInventoryLoading &&
                myInventory &&
                (() => {
                  const inv = myInventory.inventory ?? {};
                  const total = myInventory.total ?? 0;
                  const typesInStock = BLOOD_TYPES.filter(
                    (t) => (inv[t] ?? 0) > 0,
                  ).length;
                  const criticalTypes = BLOOD_TYPES.filter((t) => {
                    const u = inv[t] ?? 0;
                    return u > 0 && u < 5;
                  }).length;

                  return (
                    <>
                      {/* Stats row */}
                      <div className="recipient-home-stats-grid">
                        <div className="recipient-home-stat-card">
                          <div className="recipient-home-stat-icon">🩸</div>
                          <div className="recipient-home-stat-value">
                            {total}
                          </div>
                          <div className="recipient-home-stat-label">
                            Total Units
                          </div>
                        </div>
                        <div className="recipient-home-stat-card">
                          <div className="recipient-home-stat-icon">✅</div>
                          <div className="recipient-home-stat-value">
                            {typesInStock}
                            <span className="recipient-home-stat-sub">/8</span>
                          </div>
                          <div className="recipient-home-stat-label">
                            Blood Types In Stock
                          </div>
                        </div>
                        <div
                          className="recipient-home-stat-card"
                          style={{
                            borderColor:
                              criticalTypes > 0 ? "#f5c6cb" : "#dee2e6",
                          }}
                        >
                          <div className="recipient-home-stat-icon">
                            {criticalTypes > 0 ? "⚠️" : "🟢"}
                          </div>
                          <div
                            className="recipient-home-stat-value"
                            style={{
                              color: criticalTypes > 0 ? "#dc3545" : "#28a745",
                            }}
                          >
                            {criticalTypes}
                          </div>
                          <div className="recipient-home-stat-label">
                            Critical Types (&lt;5 units)
                          </div>
                        </div>
                      </div>

                      {/* Blood type breakdown */}
                      <h3 className="recipient-home-section-title">
                        Blood Type Breakdown
                      </h3>
                      <div className="recipient-home-blood-grid">
                        {BLOOD_TYPES.map((type) => {
                          const units = inv[type] ?? 0;
                          const level =
                            units >= 20
                              ? "high"
                              : units >= 5
                                ? "medium"
                                : units > 0
                                  ? "low"
                                  : "empty";
                          const pct = Math.min(100, (units / 50) * 100);
                          return (
                            <div
                              key={type}
                              className={`recipient-home-blood-card recipient-home-blood-card-${level}`}
                            >
                              <div className="recipient-home-blood-type-label">
                                {type}
                              </div>
                              <div
                                className={`recipient-home-blood-units recipient-home-blood-units-${level}`}
                              >
                                {units}
                              </div>
                              <div className="recipient-home-blood-bar-track">
                                <div
                                  className={`recipient-home-blood-bar-fill recipient-home-blood-bar-fill-${level}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div
                                className={`recipient-home-blood-level recipient-home-blood-level-${level}`}
                              >
                                {level === "high"
                                  ? "✅ High"
                                  : level === "medium"
                                    ? "⚠️ Medium"
                                    : level === "low"
                                      ? "🔴 Low"
                                      : "— Empty"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick actions */}
                      <div className="recipient-home-actions">
                        <button
                          onClick={() => setActiveTab("new-request")}
                          className="recipient-home-action-btn recipient-home-action-btn-primary"
                        >
                          ➕ New Blood Request
                        </button>
                        <button
                          onClick={() => setActiveTab("incoming-requests")}
                          className="recipient-home-action-btn recipient-home-action-btn-secondary"
                        >
                          📥 Incoming Requests
                        </button>
                        <button
                          onClick={() => setActiveTab("blood-inventory")}
                          className="recipient-home-action-btn recipient-home-action-btn-secondary"
                        >
                          🩸 Browse All Hospitals
                        </button>
                      </div>
                    </>
                  );
                })()}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: New Blood Request
          ══════════════════════════════════════════════════ */}
          {activeTab === "new-request" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                Request Blood Transfer Between Hospitals
              </h2>

              {/* Notification banner */}
              {notification && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "1rem 1.25rem",
                    marginBottom: "1.25rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${
                      notification.type === "success"
                        ? "#bbf7d0"
                        : notification.type === "warning"
                          ? "#fde68a"
                          : "#fecaca"
                    }`,
                    background:
                      notification.type === "success"
                        ? "#f0fdf4"
                        : notification.type === "warning"
                          ? "#fffbeb"
                          : "#fef2f2",
                    color:
                      notification.type === "success"
                        ? "#15803d"
                        : notification.type === "warning"
                          ? "#92400e"
                          : "#b91c1c",
                  }}
                  role="alert"
                >
                  <span
                    style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}
                  >
                    {notification.type === "success"
                      ? "✅"
                      : notification.type === "warning"
                        ? "⚠️"
                        : "🚫"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong
                      style={{ display: "block", marginBottom: "0.2rem" }}
                    >
                      {notification.title}
                    </strong>
                    <span style={{ display: "block", fontSize: "0.9rem" }}>
                      {notification.message}
                    </span>
                    {notification.detail && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.4rem",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          background:
                            notification.type === "error"
                              ? "#fee2e2"
                              : "#dcfce7",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        {notification.detail}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      opacity: 0.6,
                      flexShrink: 0,
                      padding: "0.1rem 0.25rem",
                    }}
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hospital identity banner */}
              {isHospitalUser && myHospitalName && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#1e40af",
                  }}
                >
                  🏥 <strong>Requesting as:</strong>&nbsp;{myHospitalName}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="recipient-form-grid">
                  {/* From Hospital — locked if hospital user */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      From Hospital (Requesting Hospital)
                    </label>
                    {isHospitalUser && myHospitalId ? (
                      <input
                        type="text"
                        value={myHospitalName ?? ""}
                        readOnly
                        className="recipient-form-input"
                        style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                      />
                    ) : (
                      <select
                        name="from_hospital_id"
                        value={formData.from_hospital_id}
                        onChange={handleInputChange}
                        required
                        className="recipient-form-select"
                        disabled={loading}
                      >
                        <option value="">
                          {loading
                            ? "Loading hospitals..."
                            : "Select requesting hospital..."}
                        </option>
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* To Hospital */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      To Hospital (Donor Hospital)
                    </label>
                    <select
                      name="to_hospital_id"
                      value={formData.to_hospital_id}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-select"
                      disabled={loading}
                    >
                      <option value="">
                        {loading
                          ? "Loading hospitals..."
                          : "Select donor hospital..."}
                      </option>
                      {hospitals
                        .filter((h) =>
                          isHospitalUser
                            ? String(h.id) !== String(myHospitalId)
                            : String(h.id) !== formData.from_hospital_id,
                        )
                        .map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Blood Type */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Blood Type Required
                    </label>
                    <select
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-select"
                    >
                      <option value="">Select blood type...</option>
                      {bloodTypes.map((t) => (
                        <option key={t.id} value={t.group}>
                          {t.group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Number of Units
                    </label>
                    <input
                      type="number"
                      name="units_requested"
                      value={formData.units_requested}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Request Date */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Request Date
                    </label>
                    <input
                      type="date"
                      name="request_date"
                      value={formData.request_date}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Phone */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Email */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Patient Name */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      name="patient_name"
                      value={formData.patient_name}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Patient Age */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Patient Age
                    </label>
                    <input
                      type="number"
                      name="patient_age"
                      value={formData.patient_age}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Patient Gender */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Patient Gender
                    </label>
                    <select
                      name="patient_gender"
                      value={formData.patient_gender}
                      onChange={handleInputChange}
                      required
                      className="recipient-form-select"
                    >
                      <option value="">Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Reason */}
                <div className="recipient-form-group">
                  <label className="recipient-form-label required">
                    Reason for Blood Request
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="recipient-form-textarea"
                    placeholder="e.g., surgery, accident, anaemia…"
                  />
                </div>

                {/* Medical History */}
                <div className="recipient-form-group">
                  <label className="recipient-form-label">
                    Medical History (Optional)
                  </label>
                  <textarea
                    name="medical_history"
                    value={formData.medical_history}
                    onChange={handleInputChange}
                    rows="3"
                    className="recipient-form-textarea"
                    placeholder="Any relevant medical history the receiving hospital should know about"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="recipient-submit-button"
                  >
                    {submitting
                      ? "Submitting…"
                      : "Submit Inter-Hospital Blood Request"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: My Requests (outgoing)
          ══════════════════════════════════════════════════ */}
          {activeTab === "my-requests" && (
            <div className="recipient-card recipient-fade-in">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 className="recipient-card-header" style={{ margin: 0 }}>
                  📤 My Outgoing Requests
                </h2>
                <button
                  onClick={fetchOutgoing}
                  className="recipient-inventory-refresh-btn"
                  disabled={outgoingLoading}
                >
                  {outgoingLoading ? "↻ Loading…" : "↻ Refresh"}
                </button>
              </div>

              {outgoingLoading ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "2rem",
                  }}
                >
                  Loading requests…
                </p>
              ) : outgoing.length === 0 ? (
                <div className="recipient-empty-state">
                  <p>No outgoing blood requests yet.</p>
                  <button
                    onClick={() => setActiveTab("new-request")}
                    className="recipient-create-request-link"
                  >
                    Create your first request
                  </button>
                </div>
              ) : (
                <div className="recipient-table-container">
                  <table className="recipient-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>From Hospital</th>
                        <th>To Hospital</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outgoing.map((r) => (
                        <tr key={r.id}>
                          <td className="recipient-request-id">#{r.id}</td>
                          <td>{r.from_hospital?.name ?? "—"}</td>
                          <td>{r.to_hospital?.name ?? "—"}</td>
                          <td className="recipient-blood-type">
                            {r.blood_group}
                          </td>
                          <td>{r.units_requested}</td>
                          <td>{r.request_date}</td>
                          <td>
                            <span
                              className={`recipient-status-badge ${STATUS_CLASSES[r.status] ?? ""}`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: Incoming Requests
          ══════════════════════════════════════════════════ */}
          {activeTab === "incoming-requests" && isHospitalUser && (
            <div className="recipient-card recipient-fade-in">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h2 className="recipient-card-header" style={{ margin: 0 }}>
                  📥 Incoming Blood Requests
                </h2>
                <button
                  onClick={fetchIncoming}
                  className="recipient-inventory-refresh-btn"
                  disabled={incomingLoading}
                >
                  {incomingLoading ? "↻ Loading…" : "↻ Refresh"}
                </button>
              </div>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  marginBottom: "1rem",
                }}
              >
                Requests other hospitals have sent to{" "}
                <strong>{myHospitalName}</strong>. Approve or reject each
                request below.
              </p>

              {incomingLoading ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6b7280",
                    padding: "2rem",
                  }}
                >
                  Loading requests…
                </p>
              ) : incoming.length === 0 ? (
                <div className="recipient-empty-state">
                  <p>No incoming requests for your hospital yet.</p>
                </div>
              ) : (
                <div className="recipient-table-container">
                  <table className="recipient-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Requesting Hospital</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incoming.map((r) => (
                        <tr key={r.id}>
                          <td className="recipient-request-id">#{r.id}</td>
                          <td>{r.from_hospital?.name ?? "—"}</td>
                          <td className="recipient-blood-type">
                            {r.blood_group}
                          </td>
                          <td>{r.units_requested}</td>
                          <td>{r.request_date}</td>
                          <td>
                            <span
                              className={`recipient-status-badge ${STATUS_CLASSES[r.status] ?? ""}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>
                            {r.status === "pending" ? (
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  disabled={updatingId === r.id}
                                  onClick={() =>
                                    handleStatusUpdate(r.id, "approved")
                                  }
                                  className="recipient-request-btn"
                                  style={{ background: "#16a34a" }}
                                >
                                  {updatingId === r.id ? "…" : "✓ Approve"}
                                </button>
                                <button
                                  disabled={updatingId === r.id}
                                  onClick={() =>
                                    handleStatusUpdate(r.id, "rejected")
                                  }
                                  className="recipient-request-btn"
                                  style={{ background: "#dc2626" }}
                                >
                                  {updatingId === r.id ? "…" : "✕ Reject"}
                                </button>
                              </div>
                            ) : r.status === "approved" ? (
                              <button
                                disabled={updatingId === r.id}
                                onClick={() =>
                                  handleStatusUpdate(r.id, "fulfilled")
                                }
                                className="recipient-request-btn"
                                style={{ background: "#7c3aed" }}
                              >
                                {updatingId === r.id ? "…" : "✔ Mark Fulfilled"}
                              </button>
                            ) : (
                              <span
                                style={{
                                  color: "#9ca3af",
                                  fontSize: "0.85rem",
                                }}
                              >
                                No actions
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: Blood Inventory
          ══════════════════════════════════════════════════ */}
          {activeTab === "blood-inventory" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                🩸 Blood Inventory by Hospital
              </h2>
              <p className="recipient-inventory-subtitle">
                Browse available blood stock across all hospitals. Filter by
                blood type then click <strong>Request Blood</strong> to pre-fill
                the request form.
              </p>

              {/* Filter bar */}
              <div className="recipient-inventory-filter-bar">
                <label className="recipient-inventory-filter-label">
                  Filter by Blood Type:
                </label>
                <select
                  value={inventoryFilter}
                  onChange={(e) => setInventoryFilter(e.target.value)}
                  className="recipient-inventory-filter-select"
                >
                  <option value="">All Blood Types</option>
                  {BLOOD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {inventoryFilter && (
                  <button
                    onClick={() => setInventoryFilter("")}
                    className="recipient-inventory-clear-btn"
                  >
                    × Clear
                  </button>
                )}
                <button
                  onClick={fetchInventory}
                  className="recipient-inventory-refresh-btn"
                  disabled={inventoryLoading}
                >
                  {inventoryLoading ? "↻ Refreshing…" : "↻ Refresh"}
                </button>
              </div>

              {/* Skeleton */}
              {inventoryLoading && (
                <div className="recipient-inventory-skeleton-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="recipient-inventory-skeleton-card">
                      <div className="recipient-skeleton-card-header">
                        <div className="recipient-skeleton-line recipient-skeleton-name" />
                        <div className="recipient-skeleton-line recipient-skeleton-location" />
                      </div>
                      <div className="recipient-skeleton-card-body">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <div key={j} className="recipient-skeleton-cell">
                            <div className="recipient-skeleton-cell-type" />
                            <div className="recipient-skeleton-cell-units" />
                          </div>
                        ))}
                      </div>
                      <div className="recipient-skeleton-card-footer">
                        <div className="recipient-skeleton-line recipient-skeleton-footer" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              {!inventoryLoading &&
                (() => {
                  // Exclude the currently logged-in hospital from the inventory list
                  const visibleInventory = myHospitalId
                    ? inventoryData.filter((h) => h.id !== myHospitalId)
                    : inventoryData;

                  const filtered = inventoryFilter
                    ? visibleInventory.filter(
                        (h) => (h.inventory[inventoryFilter] ?? 0) > 0,
                      )
                    : visibleInventory;

                  if (inventoryData.length === 0) {
                    return (
                      <div className="recipient-empty-state">
                        <p>No inventory data available. Try refreshing.</p>
                        <button
                          onClick={fetchInventory}
                          className="recipient-create-request-link"
                        >
                          Refresh Inventory
                        </button>
                      </div>
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div className="recipient-inventory-no-results">
                        <span className="recipient-inventory-no-results-icon">
                          🚫
                        </span>
                        <p>
                          No hospitals currently have{" "}
                          <strong>{inventoryFilter}</strong> blood in stock.
                        </p>
                        <button
                          onClick={() => setInventoryFilter("")}
                          className="recipient-create-request-link"
                        >
                          Show All Hospitals
                        </button>
                      </div>
                    );
                  }

                  return inventoryFilter ? (
                    <>
                      <p className="recipient-inventory-summary">
                        <strong>{filtered.length}</strong> hospital
                        {filtered.length !== 1 ? "s have" : " has"}{" "}
                        <span className="recipient-inventory-highlight">
                          {inventoryFilter}
                        </span>{" "}
                        blood available.
                      </p>
                      <div className="recipient-table-container">
                        <table className="recipient-table">
                          <thead>
                            <tr>
                              <th>Hospital</th>
                              <th>Location</th>
                              <th>Blood Type</th>
                              <th>Units Available</th>
                              <th>Stock Level</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered
                              .sort(
                                (a, b) =>
                                  (b.inventory[inventoryFilter] ?? 0) -
                                  (a.inventory[inventoryFilter] ?? 0),
                              )
                              .map((hospital) => {
                                const units =
                                  hospital.inventory[inventoryFilter] ?? 0;
                                const level =
                                  units >= 20
                                    ? "high"
                                    : units >= 5
                                      ? "medium"
                                      : "low";
                                return (
                                  <tr key={hospital.id}>
                                    <td className="recipient-inventory-hospital-name">
                                      {hospital.name}
                                    </td>
                                    <td className="recipient-inventory-location">
                                      📍 {hospital.location}
                                    </td>
                                    <td className="recipient-blood-type">
                                      {inventoryFilter}
                                    </td>
                                    <td>
                                      <span
                                        className={`recipient-inventory-badge recipient-inventory-badge-${level}`}
                                      >
                                        {units} units
                                      </span>
                                    </td>
                                    <td>
                                      <span
                                        className={`recipient-stock-level recipient-stock-level-${level}`}
                                      >
                                        {level === "high"
                                          ? "✅ High"
                                          : level === "medium"
                                            ? "⚠️ Medium"
                                            : "🔴 Low"}
                                      </span>
                                    </td>
                                    <td>
                                      <button
                                        onClick={() =>
                                          handleRequestFromInventory(
                                            hospital.id,
                                            inventoryFilter,
                                          )
                                        }
                                        className="recipient-request-btn"
                                      >
                                        Request Blood
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="recipient-inventory-grid">
                      {visibleInventory.map((hospital) => (
                        <div
                          key={hospital.id}
                          className="recipient-inventory-card"
                        >
                          <div className="recipient-inventory-card-header">
                            <span className="recipient-inventory-card-name">
                              {hospital.name}
                            </span>
                            <span className="recipient-inventory-card-location">
                              📍 {hospital.location}
                            </span>
                          </div>
                          <div className="recipient-inventory-card-body">
                            {BLOOD_TYPES.map((type) => {
                              const units = hospital.inventory[type] ?? 0;
                              const level =
                                units >= 20
                                  ? "high"
                                  : units >= 5
                                    ? "medium"
                                    : units > 0
                                      ? "low"
                                      : "empty";
                              return (
                                <div
                                  key={type}
                                  className="recipient-inventory-cell"
                                >
                                  <span className="recipient-inventory-cell-type">
                                    {type}
                                  </span>
                                  <span
                                    className={`recipient-inventory-cell-units recipient-inventory-cell-${level}`}
                                  >
                                    {units}
                                  </span>
                                  {units > 0 && (
                                    <button
                                      onClick={() =>
                                        handleRequestFromInventory(
                                          hospital.id,
                                          type,
                                        )
                                      }
                                      className="recipient-inventory-mini-btn"
                                      title={`Request ${type} from ${hospital.name}`}
                                    >
                                      Request
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <div className="recipient-inventory-card-footer">
                            Total: <strong>{hospital.total ?? 0} units</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              TAB: Donor Request
          ══════════════════════════════════════════════════ */}
          {activeTab === "donor-request" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                🩸 Request Blood From Donors
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  marginBottom: "1.25rem",
                }}
              >
                Submit a request for blood donations from registered donors in
                your area. The request will be reviewed by an admin before
                donors are notified.
              </p>

              {/* Notification banner */}
              {donorReqNotification && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "1rem 1.25rem",
                    marginBottom: "1.25rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${
                      donorReqNotification.type === "success"
                        ? "#bbf7d0"
                        : "#fecaca"
                    }`,
                    background:
                      donorReqNotification.type === "success"
                        ? "#f0fdf4"
                        : "#fef2f2",
                    color:
                      donorReqNotification.type === "success"
                        ? "#15803d"
                        : "#b91c1c",
                  }}
                  role="alert"
                >
                  <span
                    style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}
                  >
                    {donorReqNotification.type === "success" ? "✅" : "🚫"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong
                      style={{ display: "block", marginBottom: "0.2rem" }}
                    >
                      {donorReqNotification.title}
                    </strong>
                    <span style={{ display: "block", fontSize: "0.9rem" }}>
                      {donorReqNotification.message}
                    </span>
                  </div>
                  <button
                    onClick={() => setDonorReqNotification(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      opacity: 0.6,
                      flexShrink: 0,
                      padding: "0.1rem 0.25rem",
                    }}
                    aria-label="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hospital identity */}
              {isHospitalUser && myHospitalName && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "0.5rem",
                    padding: "0.75rem 1rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#1e40af",
                  }}
                >
                  🏥 <strong>Requesting as:</strong>&nbsp;{myHospitalName}
                </div>
              )}

              {/* Donor Request Form */}
              <form onSubmit={handleDonorReqSubmit} className="space-y-6">
                <div className="recipient-form-grid">
                  {/* Blood Type */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Blood Type Needed
                    </label>
                    <select
                      name="blood_group"
                      value={donorReqForm.blood_group}
                      onChange={handleDonorReqChange}
                      required
                      className="recipient-form-select"
                    >
                      <option value="">Select blood type…</option>
                      {bloodTypes.map((t) => (
                        <option key={t.id} value={t.group}>
                          {t.group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units Needed */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Units Needed
                    </label>
                    <input
                      type="number"
                      name="units_needed"
                      value={donorReqForm.units_needed}
                      onChange={handleDonorReqChange}
                      min="1"
                      required
                      className="recipient-form-input"
                      placeholder="e.g. 2"
                    />
                  </div>

                  {/* Urgency Level */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Urgency Level
                    </label>
                    <select
                      name="urgency_level_id"
                      value={donorReqForm.urgency_level_id}
                      onChange={handleDonorReqChange}
                      required
                      className="recipient-form-select"
                    >
                      <option value="">Select urgency…</option>
                      {urgencyLevels.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.level}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Deadline */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Donation Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={donorReqForm.deadline}
                      onChange={handleDonorReqChange}
                      required
                      className="recipient-form-input"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={donorReqForm.contact_person}
                      onChange={handleDonorReqChange}
                      required
                      className="recipient-form-input"
                      placeholder="Name of responsible person"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={donorReqForm.contact_number}
                      onChange={handleDonorReqChange}
                      required
                      className="recipient-form-input"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="recipient-form-group">
                  <label className="recipient-form-label">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={donorReqForm.title}
                    onChange={handleDonorReqChange}
                    className="recipient-form-input"
                    placeholder="e.g. Urgent O+ Blood Needed for Surgery"
                  />
                </div>

                {/* Description */}
                <div className="recipient-form-group">
                  <label className="recipient-form-label">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={donorReqForm.description}
                    onChange={handleDonorReqChange}
                    rows="3"
                    className="recipient-form-textarea"
                    placeholder="Any additional details about the urgency or patient situation…"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={donorReqSubmitting || !isHospitalUser}
                    className="recipient-submit-button"
                  >
                    {donorReqSubmitting
                      ? "Submitting…"
                      : "Submit Donor Request"}
                  </button>
                </div>
              </form>

              {/* Submitted Requests List */}
              <div style={{ marginTop: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "#374151",
                      margin: 0,
                    }}
                  >
                    📋 My Submitted Donor Requests
                  </h3>
                  <button
                    onClick={fetchMyDonorRequests}
                    disabled={myDonorReqLoading}
                    className="recipient-inventory-refresh-btn"
                  >
                    {myDonorReqLoading ? "↻ Loading…" : "↻ Refresh"}
                  </button>
                </div>

                {myDonorReqLoading ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "#6b7280",
                      padding: "2rem",
                    }}
                  >
                    Loading…
                  </p>
                ) : myDonorRequests.length === 0 ? (
                  <div className="recipient-empty-state">
                    <p>No donor requests submitted yet.</p>
                  </div>
                ) : (
                  <div className="recipient-table-container">
                    <table className="recipient-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Blood Type</th>
                          <th>Units</th>
                          <th>Deadline</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myDonorRequests.map((r) => (
                          <tr key={r.id}>
                            <td className="recipient-request-id">#{r.id}</td>
                            <td>{r.title || `Request #${r.id}`}</td>
                            <td className="recipient-blood-type">
                              {r.blood_group}
                            </td>
                            <td>{r.units_needed}</td>
                            <td>{r.deadline ?? r.request_date}</td>
                            <td>
                              <span
                                className={`recipient-status-badge ${
                                  r.status === "approved"
                                    ? "recipient-status-approved"
                                    : r.status === "rejected"
                                      ? "recipient-status-rejected"
                                      : r.status === "fulfilled"
                                        ? "recipient-status-fulfilled"
                                        : "recipient-status-pending"
                                }`}
                              >
                                {r.status === "pending"
                                  ? "⏳ Pending Approval"
                                  : r.status === "approved"
                                    ? "✅ Approved"
                                    : r.status === "rejected"
                                      ? "❌ Rejected"
                                      : "✔ Fulfilled"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResipientDashboard;
