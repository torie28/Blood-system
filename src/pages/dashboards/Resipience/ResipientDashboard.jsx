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
  const [activeTab, setActiveTab] = useState("new-request");
  const [hospitals, setHospitals] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  /* ─────────────────────────────────────────────────────────── */
  /*  Data fetching                                              */
  /* ─────────────────────────────────────────────────────────── */

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
  }, []);

  // Lazy-load tabs
  useEffect(() => {
    if (activeTab === "blood-inventory" && inventoryData.length === 0) {
      fetchInventory();
    }
    if (activeTab === "my-requests" && outgoing.length === 0) {
      fetchOutgoing();
    }
    if (activeTab === "incoming-requests" && incoming.length === 0) {
      fetchIncoming();
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
    try {
      const res = await fetch(`${API}/inter-hospital-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        alert("Inter-hospital blood request submitted successfully!");
        const base = emptyForm();
        if (myHospitalId) base.from_hospital_id = String(myHospitalId);
        setFormData(base);
        // Refresh outgoing list silently
        fetchOutgoing();
      } else {
        alert("Error: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting request. Please try again.");
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
              </nav>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              TAB: New Blood Request
          ══════════════════════════════════════════════════ */}
          {activeTab === "new-request" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                Request Blood Transfer Between Hospitals
              </h2>

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
        </div>
      </main>
    </div>
  );
};

export default ResipientDashboard;
