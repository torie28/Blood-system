import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const ResipientDashboard = () => {
  const [activeTab, setActiveTab] = useState("new-request");
  const [hospitals, setHospitals] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [_urgencyLevels, setUrgencyLevels] = useState([]);
  const [loading, setLoading] = useState(true);
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
        </div>
      </main>
    </div>
  );
};

export default ResipientDashboard;
