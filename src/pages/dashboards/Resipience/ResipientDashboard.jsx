import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ResipientDashboard = () => {
  const [activeTab, setActiveTab] = useState("blood-inventory");
  const [hospitals, setHospitals] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [_urgencyLevels, setUrgencyLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryFilter, setInventoryFilter] = useState("");
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [requests, _setRequests] = useState([
    {
      id: 1,
      hospitalName: "City General Hospital",
      bloodType: "A+",
      units: 2,
      urgency: "High",
      status: "Pending",
      date: "2024-03-24",
      contactPerson: "Dr. Smith",
    },
    {
      id: 2,
      hospitalName: "St. Mary Medical Center",
      bloodType: "O-",
      units: 1,
      urgency: "Medium",
      status: "Approved",
      date: "2024-03-23",
      contactPerson: "Nurse Johnson",
    },
  ]);

  const [formData, setFormData] = useState({
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

  const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

  const fetchInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/blood-inventory");
      const data = await response.json();
      if (data.success) {
        setInventoryData(data.data);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "blood-inventory" && inventoryData.length === 0) {
      fetchInventory();
    }
  }, [activeTab, inventoryData.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospitalsResponse, bloodTypesResponse, urgencyLevelsResponse] =
          await Promise.all([
            fetch("http://localhost:8000/api/hospitals"),
            fetch("http://localhost:8000/api/blood-groups"),
            fetch("http://localhost:8000/api/urgency-levels"),
          ]);

        const hospitalsData = await hospitalsResponse.json();
        const bloodTypesData = await bloodTypesResponse.json();
        const urgencyLevelsData = await urgencyLevelsResponse.json();

        if (hospitalsData.success) {
          setHospitals(hospitalsData.data);
        }

        if (bloodTypesData.success) {
          setBloodTypes(bloodTypesData.data);
        }

        if (urgencyLevelsData.success) {
          setUrgencyLevels(urgencyLevelsData.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // If to_hospital_id is changed, automatically set the location_id
      if (name === "to_hospital_id") {
        const selectedHospital = hospitals.find((h) => h.id == value);
        if (selectedHospital && selectedHospital.location_id) {
          updated.location_id = selectedHospital.location_id;
        }
      }

      return updated;
    });
  };

  const handleRequestFromInventory = (hospitalId, bloodType) => {
    const hospital = hospitals.find((h) => String(h.id) === String(hospitalId));
    setFormData((prev) => ({
      ...prev,
      to_hospital_id: String(hospitalId),
      blood_group: bloodType,
      location_id: hospital?.location_id
        ? String(hospital.location_id)
        : prev.location_id,
    }));
    setActiveTab("new-request");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting form data:", formData);

    try {
      const _token = localStorage.getItem("token");
      const response = await fetch(
        "http://127.0.0.1:8000/api/inter-hospital-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        },
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        alert("Inter-hospital blood request submitted successfully!");

        // Reset form
        setFormData({
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
      } else {
        console.error("Server error:", data);
        alert("Error submitting request: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Error submitting request. Please try again.");
    }
  };

  return (
    <div className="recipient-dashboard-container">
      <header className="classic-dashboard-header">
        <div className="classic-dashboard-header-content">
          <div className="flex items-center">
            <h1 className="classic-dashboard-title">
              Blood Recipient Dashboard
            </h1>
          </div>
          <div className="classic-dashboard-user-info">
            <span className="recipient-welcome-text">Welcome, Recipient</span>
            <Link to="/signout" className="classic-signout-button">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Navigation */}
          <div className="recipient-tab-container">
            <div className="recipient-tab-nav">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab("new-request")}
                  className={`recipient-tab-button ${
                    activeTab === "new-request" ? "active" : ""
                  }`}
                >
                  New Blood Request
                </button>
                <button
                  onClick={() => setActiveTab("my-requests")}
                  className={`recipient-tab-button ${
                    activeTab === "my-requests" ? "active" : ""
                  }`}
                >
                  My Requests ({requests.length})
                </button>
                <button
                  onClick={() => setActiveTab("blood-inventory")}
                  className={`recipient-tab-button ${
                    activeTab === "blood-inventory" ? "active" : ""
                  }`}
                >
                  🩸 Blood Inventory
                </button>
              </nav>
            </div>
          </div>

          {activeTab === "new-request" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                Request Blood Transfer Between Hospitals
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="recipient-form-grid">
                  {/* From Hospital Selection */}
                  <div className="recipient-form-group">
                    <label className="recipient-form-label required">
                      From Hospital (Requesting Hospital)
                    </label>
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
                      {hospitals.map((hospital) => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To Hospital Selection */}
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
                        .filter((h) => h.id != formData.from_hospital_id)
                        .map((hospital) => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name}
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
                      {bloodTypes.map((type) => (
                        <option key={type.id} value={type.group}>
                          {type.group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units Required */}
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

                  {/* Phone Number */}
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

                {/* Reason for Request */}
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
                    placeholder="Please describe why blood is needed (e.g., surgery, accident, anemia, etc.)"
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
                    placeholder="Any relevant medical history the hospital should know about"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button type="submit" className="recipient-submit-button">
                    Submit Inter-Hospital Blood Request
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "my-requests" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">My Blood Requests</h2>

              {requests.length === 0 ? (
                <div className="recipient-empty-state">
                  <p>No blood requests found.</p>
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
                        <th>Request ID</th>
                        <th>Hospital</th>
                        <th>Blood Type</th>
                        <th>Units</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td className="recipient-request-id">
                            #{request.id}
                          </td>
                          <td>{request.hospitalName}</td>
                          <td className="recipient-blood-type">
                            {request.bloodType}
                          </td>
                          <td>{request.units}</td>
                          <td
                            className={`recipient-urgency-${request.urgency.toLowerCase()}`}
                          >
                            {request.urgency}
                          </td>
                          <td>
                            <span
                              className={`recipient-status-badge recipient-status-${request.status.toLowerCase()}`}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td>{request.date}</td>
                          <td>{request.contactPerson}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Blood Inventory Tab */}
          {activeTab === "blood-inventory" && (
            <div className="recipient-card recipient-fade-in">
              <h2 className="recipient-card-header">
                🩸 Blood Inventory by Hospital
              </h2>
              <p className="recipient-inventory-subtitle">
                Browse available blood stock across all hospitals. Select a
                blood type to find hospitals that can fulfil your request, then
                click <strong>Request</strong> to pre-fill the request form.
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

              {/* Skeleton loader */}
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

              {/* Inventory content */}
              {!inventoryLoading &&
                (() => {
                  const filtered = inventoryFilter
                    ? inventoryData.filter(
                        (h) => (h.inventory[inventoryFilter] ?? 0) > 0,
                      )
                    : inventoryData;

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
                    /* Filtered view — clean focused table */
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
                    /* All-types view — compact grid cards */
                    <div className="recipient-inventory-grid">
                      {inventoryData.map((hospital) => (
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
