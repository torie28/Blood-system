import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const API_BASE_URL = "http://localhost:8000/api";

const AdminDashboard = () => {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState("donors");
  const [_hospitalRequests, setHospitalRequests] = useState([]);
  const [donorStats, setDonorStats] = useState({});
  const [bloodInventory, setBloodInventory] = useState({});
  const [hospitalInventory, setHospitalInventory] = useState([]);
  const [selectedLocation, _setSelectedLocation] = useState("");
  const [selectedDonorRequestLocation, setSelectedDonorRequestLocation] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [showHospitalDialog, setShowHospitalDialog] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [newHospital, setNewHospital] = useState({
    name: "",
    location: "",
    contactNumber: "",
    email: "",
    address: "",
  });
  const [donorRequests, setDonorRequests] = useState([]);
  const [bloodRequests, _setBloodRequests] = useState([]);

  const [_bloodTypes, setBloodTypes] = useState([]);
  const [_urgencyLevels, setUrgencyLevels] = useState([]);
  const [locations, setLocations] = useState([]);

  // Fetch data from API
  useEffect(() => {
    fetchHospitals();
    fetchBloodTypes();
    fetchUrgencyLevels();
    fetchLocations();
    fetchDonorRequests();
    fetchHospitalInventory();
    fetchMockData();
  }, []);

  const fetchHospitalInventory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blood-inventory`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setHospitalInventory(data.data);
        // Compute aggregate totals for the stat card
        const totals = {};
        data.data.forEach((hospital) => {
          Object.entries(hospital.inventory).forEach(([type, units]) => {
            totals[type] = (totals[type] || 0) + units;
          });
        });
        setBloodInventory(totals);
      }
    } catch (error) {
      console.error("Error fetching hospital inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals`);
      const data = await response.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const fetchBloodTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blood-groups`);

      // Check if response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setBloodTypes(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.warn(
        "API endpoint not available, using fallback blood types:",
        error.message,
      );
      // Fallback to default blood types
      setBloodTypes([
        { id: 1, group: "O+" },
        { id: 2, group: "O-" },
        { id: 3, group: "A+" },
        { id: 4, group: "A-" },
        { id: 5, group: "B+" },
        { id: 6, group: "B-" },
        { id: 7, group: "AB+" },
        { id: 8, group: "AB-" },
        { id: 9, group: "All" },
      ]);
    }
  };

  const fetchUrgencyLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/urgency-levels`);

      // Check if response is ok and is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setUrgencyLevels(data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.warn(
        "API endpoint not available, using fallback urgency levels:",
        error.message,
      );
      // Fallback to default urgency levels
      setUrgencyLevels([
        { id: 1, level: "Low" },
        { id: 2, level: "Medium" },
        { id: 3, level: "High" },
        { id: 4, level: "Critical" },
      ]);
    }
  };

  const fetchLocations = async () => {
    try {
      console.log("Testing API endpoint...");

      // First, let's test if the endpoint exists
      const testResponse = await fetch(`${API_BASE_URL}/locations`);
      console.log("Test response status:", testResponse.status);
      console.log("Test response ok:", testResponse.ok);

      if (!testResponse.ok) {
        throw new Error(`HTTP error! status: ${testResponse.status}`);
      }

      const data = await testResponse.json();
      console.log("Raw response from location table:", data);
      console.log("Response structure:", {
        success: data.success,
        hasData: !!data.data,
        dataType: typeof data.data,
        dataLength: data.data ? data.data.length : "undefined",
        firstItem: data.data && data.data.length > 0 ? data.data[0] : "none",
      });

      if (data.success && data.data && Array.isArray(data.data)) {
        console.log("Setting locations:", data.data);
        setLocations(data.data);
      } else {
        console.error("Invalid response format:", data);
        // Let's try a different approach - maybe the response is just an array
        if (Array.isArray(data)) {
          console.log("Response is direct array, using it:", data);
          setLocations(data);
        } else {
          throw new Error("Invalid response format");
        }
      }
    } catch (error) {
      console.error("Failed to fetch locations from database:", error.message);
      console.error("Full error:", error);
      // Don't set fallback locations - only use database data
      setLocations([]);
    }
  };

  const fetchDonorRequests = async () => {
    try {
      console.log(
        "Fetching donor requests from:",
        `${API_BASE_URL}/donor-requests`,
      );

      const response = await fetch(`${API_BASE_URL}/donor-requests`);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Raw response data:", data);

      if (data.success) {
        console.log("Number of requests received:", data.requests?.length);
        // Transform the data to match the frontend structure
        const transformedRequests = data.requests.map((request) => ({
          id: request.id,
          title: request.title || `Blood Request - ${request.blood_group}`,
          description:
            request.description ||
            `Need ${request.units_needed} units of ${request.blood_group} blood.`,
          bloodType: request.blood_group,
          units: request.units_needed,
          urgency: request.urgencyLevel?.level || "Medium",
          location:
            request.location?.city ||
            request.location?.region ||
            "Unknown Location",
          hospitalName: request.hospital?.name || "Unknown Hospital",
          contactPerson: request.contact_person || "N/A",
          contactNumber: request.contact_number || "N/A",
          deadline: request.deadline || request.request_date,
          postedDate: request.request_date,
          status: request.status || "active",
          contact_person: request.contact_person || "N/A",
          contact_number: request.contact_number || "N/A",
          blood_group: request.blood_group,
          units_needed: request.units_needed,
        }));
        console.log("Transformed requests:", transformedRequests);
        setDonorRequests(transformedRequests);
      } else {
        console.error("API returned unsuccessful response:", data);
      }
    } catch (error) {
      console.error("Error fetching donor requests:", error);
      console.error("Full error details:", error.message);
    }
  };

  const fetchMockData = () => {
    // This is still mock data for other parts of the dashboard
    setTimeout(() => {
      setHospitalRequests([
        {
          id: 1,
          hospitalName: "City General Hospital",
          location: "Nairobi",
          bloodType: "O+",
          units: 5,
          urgency: "High",
          requestDate: "2024-03-24",
          status: "pending",
          recipientName: "John Doe",
          patientId: "P001",
        },
        {
          id: 2,
          hospitalName: "St. Mary Medical Center",
          location: "Mombasa",
          bloodType: "A-",
          units: 3,
          urgency: "Medium",
          requestDate: "2024-03-23",
          status: "pending",
          recipientName: "Jane Smith",
          patientId: "P002",
        },
        {
          id: 3,
          hospitalName: "Regional Hospital",
          location: "Kisumu",
          bloodType: "B+",
          units: 2,
          urgency: "Low",
          requestDate: "2024-03-22",
          status: "approved",
          recipientName: "Robert Johnson",
          patientId: "P003",
        },
      ]);

      setDonorStats({
        total: 1250,
        byLocation: {
          Nairobi: 450,
          Mombasa: 320,
          Kisumu: 280,
          Nakuru: 200,
        },
        byBloodType: {
          "O+": 350,
          "A+": 280,
          "B+": 220,
          "AB+": 150,
          "O-": 120,
          "A-": 80,
          "B-": 30,
          "AB-": 20,
        },
      });

      // bloodInventory is now managed by fetchHospitalInventory (real API data)
      // setLoading is now managed by fetchHospitalInventory as well
    }, 1000);
  };

  const _filteredRequests = selectedLocation
    ? bloodRequests.filter((req) => req.location === selectedLocation)
    : bloodRequests;

  const filteredDonorRequests = selectedDonorRequestLocation
    ? donorRequests.filter(
        (req) => req.location === selectedDonorRequestLocation,
      )
    : donorRequests;

  const _getUniqueLocations = () => {
    return [...new Set(bloodRequests.map((req) => req.location))];
  };

  const _getUniqueDonorRequestLocations = () => {
    return [...new Set(donorRequests.map((req) => req.location))];
  };

  const _getDatabaseLocations = () => {
    // Only return locations from the database
    return locations.map((location) => location.name);
  };

  const _getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "High":
        return "text-red-600 bg-red-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const _getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleAddHospital = async () => {
    if (
      newHospital.name &&
      newHospital.location &&
      newHospital.contactNumber &&
      newHospital.email
    ) {
      try {
        const response = await fetch(`${API_BASE_URL}/hospitals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newHospital.name,
            email: newHospital.email,
            phone: newHospital.contactNumber,
            address: newHospital.address,
            location: newHospital.location,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Refresh hospitals list
          await fetchHospitals();

          // Reset form
          setNewHospital({
            name: "",
            location: "",
            contactNumber: "",
            email: "",
            address: "",
          });
          setShowHospitalDialog(false);

          alert("Hospital added successfully!");
        } else {
          alert("Failed to add hospital: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error adding hospital:", error);
        alert("Error adding hospital. Please try again.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleInputChange = (e) => {
    setNewHospital({
      ...newHospital,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditInputChange = (e) => {
    setEditingHospital({
      ...editingHospital,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditHospital = (hospital) => {
    setEditingHospital({
      id: hospital.id,
      name: hospital.name,
      location: hospital.location?.city || hospital.location || "",
      contactNumber: hospital.phone,
      email: hospital.email,
      address: hospital.address || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateHospital = async () => {
    if (
      editingHospital.name &&
      editingHospital.location &&
      editingHospital.contactNumber &&
      editingHospital.email
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/hospitals/${editingHospital.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: editingHospital.name,
              email: editingHospital.email,
              phone: editingHospital.contactNumber,
              address: editingHospital.address,
              location: editingHospital.location,
            }),
          },
        );

        const data = await response.json();

        if (data.success) {
          await fetchHospitals();
          setShowEditDialog(false);
          setEditingHospital(null);
          alert("Hospital updated successfully!");
        } else {
          alert(
            "Failed to update hospital: " + (data.message || "Unknown error"),
          );
        }
      } catch (error) {
        console.error("Error updating hospital:", error);
        alert("Error updating hospital. Please try again.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleDeleteHospital = async (hospitalId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this hospital? This action cannot be undone.",
      )
    ) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/hospitals/${hospitalId}`,
          {
            method: "DELETE",
          },
        );

        const data = await response.json();

        if (data.success) {
          await fetchHospitals();
          alert("Hospital deleted successfully!");
        } else {
          alert(
            "Failed to delete hospital: " + (data.message || "Unknown error"),
          );
        }
      } catch (error) {
        console.error("Error deleting hospital:", error);
        alert("Error deleting hospital. Please try again.");
      }
    }
  };

  const handleToggleDonorRequestStatus = async (requestId) => {
    try {
      const request = donorRequests.find((r) => r.id === requestId);
      if (!request) return;
      const newStatus = request.status === "active" ? "inactive" : "active";
      const apiResponse = await fetch(
        `${API_BASE_URL}/donor-requests/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const data = await apiResponse.json();
      if (data.success) {
        setDonorRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: newStatus } : r,
          ),
        );
      } else {
        alert(
          "Failed to update request status: " +
            (data.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error toggling donor request status:", error);
      alert("Error updating request. Please try again.");
    }
  };

  const handleDeleteDonorRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;
    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/donor-requests/${requestId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        },
      );
      const data = await apiResponse.json();
      if (data.success) {
        setDonorRequests((prev) => prev.filter((r) => r.id !== requestId));
      } else {
        alert("Failed to delete request: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting donor request:", error);
      alert("Error deleting request. Please try again.");
    }
  };

  const handleApproveDonorRequest = async (requestId) => {
    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/donor-requests/${requestId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        },
      );
      const data = await apiResponse.json();
      if (data.success) {
        setDonorRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: "approved" } : r,
          ),
        );
      } else {
        alert(
          "Failed to approve request: " + (data.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error approving donor request:", error);
      alert("Error approving request. Please try again.");
    }
  };

  const handleRejectDonorRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to reject this donor request?"))
      return;
    try {
      const apiResponse = await fetch(
        `${API_BASE_URL}/donor-requests/${requestId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        },
      );
      const data = await apiResponse.json();
      if (data.success) {
        setDonorRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: "rejected" } : r,
          ),
        );
      } else {
        alert("Failed to reject request: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error rejecting donor request:", error);
      alert("Error rejecting request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        {/* ── Skeleton Header ── */}
        <header className="classic-dashboard-header">
          <div className="classic-dashboard-header-content">
            <div className="flex items-center">
              <div
                className="admin-sk-line"
                style={{ width: 200, height: 28 }}
              />
            </div>
            <div className="classic-dashboard-user-info">
              <div
                className="admin-sk-line"
                style={{ width: 64, height: 24, borderRadius: 999 }}
              />
              <div
                className="admin-sk-line"
                style={{ width: 96, height: 36, borderRadius: 8 }}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* ── Skeleton Stat Cards ── */}
            <div className="admin-stats-container">
              {[0, 1, 2].map((i) => (
                <div key={i} className="admin-stat-card admin-sk-stat-card">
                  <div
                    className="admin-sk-line"
                    style={{ width: "55%", height: 14, marginBottom: 14 }}
                  />
                  <div
                    className="admin-sk-line"
                    style={{ width: "35%", height: 40, marginBottom: 10 }}
                  />
                  <div
                    className="admin-sk-line"
                    style={{ width: "70%", height: 12 }}
                  />
                </div>
              ))}
            </div>

            {/* ── Skeleton Tab Nav ── */}
            <div className="admin-tab-container">
              <div className="admin-tab-nav">
                <nav className="flex -mb-px" style={{ gap: "0.5rem" }}>
                  {[140, 120, 160, 130].map((w, i) => (
                    <div
                      key={i}
                      className="admin-sk-line admin-sk-tab"
                      style={{ width: w }}
                    />
                  ))}
                </nav>
              </div>

              {/* ── Skeleton Tab Content ── */}
              <div className="admin-tab-content">
                {/* Section heading */}
                <div
                  className="admin-sk-line"
                  style={{
                    width: 260,
                    height: 22,
                    marginBottom: 24,
                    borderRadius: 6,
                  }}
                />

                {/* Two stat-grid cards */}
                <div className="admin-stats-grid">
                  {[0, 1].map((c) => (
                    <div key={c} className="admin-stats-card">
                      <div
                        className="admin-sk-line"
                        style={{
                          width: "45%",
                          height: 16,
                          marginBottom: 18,
                        }}
                      />
                      {[90, 75, 85, 70, 80].map((w, r) => (
                        <div
                          key={r}
                          className="admin-stat-item"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="admin-sk-line"
                            style={{ width: `${w}%`, height: 13, flex: "none" }}
                          />
                          <div
                            className="admin-sk-line"
                            style={{ width: 32, height: 13, flex: "none" }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Skeleton table */}
                <div
                  className="admin-sk-line"
                  style={{
                    width: 200,
                    height: 18,
                    margin: "2rem 0 1rem",
                    borderRadius: 6,
                  }}
                />
                <div className="admin-sk-table">
                  {/* thead row */}
                  <div className="admin-sk-table-row admin-sk-table-head">
                    {[
                      "18%",
                      "14%",
                      "12%",
                      "10%",
                      "10%",
                      "12%",
                      "12%",
                      "12%",
                    ].map((w, i) => (
                      <div
                        key={i}
                        className="admin-sk-line"
                        style={{ width: w, height: 13 }}
                      />
                    ))}
                  </div>
                  {/* tbody rows */}
                  {[0, 1, 2, 3, 4].map((r) => (
                    <div key={r} className="admin-sk-table-row">
                      {[
                        "18%",
                        "14%",
                        "12%",
                        "10%",
                        "10%",
                        "12%",
                        "12%",
                        "12%",
                      ].map((w, i) => (
                        <div
                          key={i}
                          className="admin-sk-line"
                          style={{ width: w, height: 14 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <header className="classic-dashboard-header">
        <div className="classic-dashboard-header-content">
          <div className="flex items-center">
            <h1 className="classic-dashboard-title">Admin Dashboard</h1>
          </div>
          <div className="classic-dashboard-user-info">
            <span className="classic-dashboard-status">Online</span>
            <Link to="/signout" className="classic-signout-button">
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="admin-stats-container">
            <div className="admin-stat-card">
              <h3 className="admin-stat-title">Total Donors</h3>
              <p className="admin-stat-value total">{donorStats.total}</p>
              <p className="admin-stat-description">Registered donors</p>
            </div>
            <div className="admin-stat-card">
              <h3 className="admin-stat-title">Donor Requests</h3>
              <p className="admin-stat-value pending">{donorRequests.length}</p>
              <p className="admin-stat-description">Active campaigns</p>
            </div>
            <div className="admin-stat-card">
              <h3 className="admin-stat-title">Blood Units Available</h3>
              <p className="admin-stat-value available">
                {Object.values(bloodInventory).reduce((a, b) => a + b, 0)}
              </p>
              <p className="admin-stat-description">All blood types</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="admin-tab-container">
            <div className="admin-tab-nav">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("donors")}
                  className={`admin-tab-button ${
                    activeTab === "donors" ? "active" : ""
                  }`}
                >
                  Donor Statistics
                </button>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className={`admin-tab-button ${
                    activeTab === "inventory" ? "active" : ""
                  }`}
                >
                  Blood Inventory
                </button>
                <button
                  onClick={() => setActiveTab("hospitals")}
                  className={`admin-tab-button ${
                    activeTab === "hospitals" ? "active" : ""
                  }`}
                >
                  Hospital Management
                </button>
                <button
                  onClick={() => setActiveTab("donor-requests")}
                  className={`admin-tab-button ${
                    activeTab === "donor-requests" ? "active" : ""
                  }`}
                >
                  Donor Requests
                </button>
              </nav>
            </div>

            {/* Donor Statistics Tab */}
            {activeTab === "donors" && (
              <div className="admin-tab-content">
                <h3 className="admin-stats-card">
                  Donor Statistics by Location
                </h3>
                <div className="admin-stats-grid">
                  <div className="admin-stats-card">
                    <h4>By Location</h4>
                    <div className="space-y-2">
                      {Object.entries(donorStats.byLocation).map(
                        ([location, count]) => (
                          <div key={location} className="admin-stat-item">
                            <span className="admin-stat-label">{location}</span>
                            <span className="admin-stat-count">{count}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="admin-stats-card">
                    <h4>By Blood Type</h4>
                    <div className="space-y-2">
                      {Object.entries(donorStats.byBloodType).map(
                        ([bloodType, count]) => (
                          <div key={bloodType} className="admin-stat-item">
                            <span className="admin-stat-label">
                              {bloodType}
                            </span>
                            <span className="admin-stat-count">{count}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blood Inventory Tab */}
            {activeTab === "inventory" &&
              (() => {
                const BLOOD_TYPES = [
                  "O+",
                  "O-",
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                ];
                const getUnitStatus = (units) =>
                  units < 10 ? "critical" : units < 30 ? "low" : "adequate";
                const getUnitLabel = (units) =>
                  units < 10 ? "Critical" : units < 30 ? "Low" : "Adequate";
                return (
                  <div className="admin-tab-content">
                    {/* Summary totals across all hospitals */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Blood Inventory by Hospital
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Overview of blood stock levels at each registered
                        hospital.
                      </p>
                      {/* Aggregate summary row */}
                      <div className="admin-inventory-grid mb-6">
                        {BLOOD_TYPES.map((type) => {
                          const total = bloodInventory[type] ?? 0;
                          return (
                            <div key={type} className="admin-inventory-card">
                              <div className="admin-blood-type">{type}</div>
                              <div className="admin-units-count">
                                {total} units
                              </div>
                              <div
                                className={`admin-inventory-status ${getUnitStatus(total)}`}
                              >
                                {getUnitLabel(total)}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Total (all hospitals)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Per-hospital breakdown table */}
                    {hospitalInventory.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        No hospital inventory data available.
                      </div>
                    ) : (
                      <div className="admin-table-container">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Hospital</th>
                              <th>Location</th>
                              {BLOOD_TYPES.map((type) => (
                                <th key={type} style={{ textAlign: "center" }}>
                                  {type}
                                </th>
                              ))}
                              <th style={{ textAlign: "center" }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hospitalInventory.map((hospital) => (
                              <tr key={hospital.id}>
                                <td className="font-medium">{hospital.name}</td>
                                <td>{hospital.location}</td>
                                {BLOOD_TYPES.map((type) => {
                                  const units = hospital.inventory[type] ?? 0;
                                  const status = getUnitStatus(units);
                                  return (
                                    <td
                                      key={type}
                                      style={{ textAlign: "center" }}
                                    >
                                      <span
                                        style={{
                                          display: "inline-block",
                                          fontWeight: 600,
                                          fontSize: "0.95rem",
                                          color:
                                            status === "critical"
                                              ? "#dc2626"
                                              : status === "low"
                                                ? "#d97706"
                                                : "#10b981",
                                        }}
                                      >
                                        {units}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td
                                  style={{
                                    textAlign: "center",
                                    fontWeight: 700,
                                  }}
                                >
                                  {hospital.total}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* Hospital Management Tab */}
            {activeTab === "hospitals" && (
              <div className="admin-tab-content">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Hospital Management
                  </h3>
                  <button
                    onClick={() => setShowHospitalDialog(true)}
                    className="classic-add-hospital-button"
                  >
                    Add Hospital
                  </button>
                </div>

                {/* Hospitals Table */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Hospital Name</th>
                        <th>Location</th>
                        <th>Contact Number</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Registered Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hospitals.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-8 text-gray-500"
                          >
                            No hospitals registered yet. Click "Add Hospital" to
                            register a new hospital.
                          </td>
                        </tr>
                      ) : (
                        hospitals.map((hospital) => (
                          <tr key={hospital.id}>
                            <td>{hospital.id}</td>
                            <td className="font-medium">{hospital.name}</td>
                            <td>
                              {hospital.location?.city ||
                                hospital.location ||
                                "-"}
                            </td>
                            <td>{hospital.phone}</td>
                            <td>{hospital.email}</td>
                            <td>{hospital.address || "-"}</td>
                            <td>
                              {hospital.created_at
                                ? new Date(hospital.created_at)
                                    .toISOString()
                                    .split("T")[0]
                                : "-"}
                            </td>
                            <td>
                              <div className="admin-action-buttons">
                                <button
                                  onClick={() => handleEditHospital(hospital)}
                                  className="admin-action-button edit"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteHospital(hospital.id)
                                  }
                                  className="admin-action-button delete"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Add Hospital Dialog */}
            {showHospitalDialog && (
              <div className="classic-hospital-dialog-overlay">
                <div className="classic-hospital-dialog">
                  <div className="classic-hospital-dialog-header">
                    <h3 className="classic-hospital-dialog-title">
                      Add New Hospital
                    </h3>
                    <button
                      onClick={() => setShowHospitalDialog(false)}
                      className="classic-hospital-dialog-close"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="classic-hospital-dialog-body">
                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Hospital Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newHospital.name}
                        onChange={handleInputChange}
                        className="classic-form-input"
                        placeholder="Enter hospital name"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={newHospital.location}
                        onChange={handleInputChange}
                        className="classic-form-input"
                        placeholder="Enter location"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={newHospital.contactNumber}
                        onChange={handleInputChange}
                        className="classic-form-input"
                        placeholder="Enter contact number"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newHospital.email}
                        onChange={handleInputChange}
                        className="classic-form-input"
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label">Address</label>
                      <textarea
                        name="address"
                        value={newHospital.address}
                        onChange={handleInputChange}
                        className="classic-form-textarea"
                        placeholder="Enter hospital address"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="classic-hospital-dialog-footer">
                    <button
                      onClick={() => setShowHospitalDialog(false)}
                      className="classic-button classic-button-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddHospital}
                      className="classic-button classic-button-primary"
                    >
                      Add Hospital
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Hospital Dialog */}
            {showEditDialog && editingHospital && (
              <div className="classic-hospital-dialog-overlay">
                <div className="classic-hospital-dialog">
                  <div className="classic-hospital-dialog-header">
                    <h3 className="classic-hospital-dialog-title">
                      Edit Hospital
                    </h3>
                    <button
                      onClick={() => {
                        setShowEditDialog(false);
                        setEditingHospital(null);
                      }}
                      className="classic-hospital-dialog-close"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="classic-hospital-dialog-body">
                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Hospital Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editingHospital.name}
                        onChange={handleEditInputChange}
                        className="classic-form-input"
                        placeholder="Enter hospital name"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={editingHospital.location}
                        onChange={handleEditInputChange}
                        className="classic-form-input"
                        placeholder="Enter location"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contactNumber"
                        value={editingHospital.contactNumber}
                        onChange={handleEditInputChange}
                        className="classic-form-input"
                        placeholder="Enter contact number"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label required">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editingHospital.email}
                        onChange={handleEditInputChange}
                        className="classic-form-input"
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div className="classic-form-group">
                      <label className="classic-form-label">Address</label>
                      <textarea
                        name="address"
                        value={editingHospital.address}
                        onChange={handleEditInputChange}
                        className="classic-form-textarea"
                        placeholder="Enter hospital address"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="classic-hospital-dialog-footer">
                    <button
                      onClick={() => {
                        setShowEditDialog(false);
                        setEditingHospital(null);
                      }}
                      className="classic-button classic-button-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateHospital}
                      className="classic-button classic-button-primary"
                    >
                      Update Hospital
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Donor Requests Tab */}
            {activeTab === "donor-requests" && (
              <div className="admin-tab-content">
                <div className="mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Donor Requests Management
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Pending:{" "}
                      <span className="font-semibold text-yellow-600">
                        {
                          donorRequests.filter((r) => r.status === "pending")
                            .length
                        }
                      </span>
                      &nbsp;|&nbsp; Approved:{" "}
                      <span className="font-semibold text-green-600">
                        {
                          donorRequests.filter(
                            (r) =>
                              r.status === "approved" || r.status === "active",
                          ).length
                        }
                      </span>
                      &nbsp;|&nbsp; Total:{" "}
                      <span className="font-semibold text-blue-600">
                        {donorRequests.length}
                      </span>
                    </p>
                  </div>
                </div>

                {/* ── Pending Requests (awaiting approval) ── */}
                {donorRequests.filter((r) => r.status === "pending").length >
                  0 && (
                  <div className="mb-8">
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#92400e",
                        background: "#fef3c7",
                        border: "1px solid #fde68a",
                        borderRadius: "0.5rem",
                        padding: "0.6rem 1rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      ⏳ Pending Approval (
                      {
                        donorRequests.filter((r) => r.status === "pending")
                          .length
                      }
                      )
                    </h4>
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Hospital</th>
                            <th>Blood Type</th>
                            <th>Units</th>
                            <th>Contact</th>
                            <th>Deadline</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donorRequests
                            .filter((r) => r.status === "pending")
                            .map((request) => (
                              <tr key={request.id}>
                                <td>#{request.id}</td>
                                <td className="font-medium">
                                  {request.hospitalName ||
                                    request.hospital?.name ||
                                    "—"}
                                </td>
                                <td className="font-medium">
                                  {request.bloodType || request.blood_group}
                                </td>
                                <td>{request.units || request.units_needed}</td>
                                <td>
                                  <div style={{ fontSize: "0.85rem" }}>
                                    <div>
                                      {request.contact_person ||
                                        request.contactPerson ||
                                        "—"}
                                    </div>
                                    <div style={{ color: "#6b7280" }}>
                                      {request.contact_number ||
                                        request.contactNumber ||
                                        ""}
                                    </div>
                                  </div>
                                </td>
                                <td>{request.deadline || "—"}</td>
                                <td>
                                  <div className="admin-action-buttons">
                                    <button
                                      onClick={() =>
                                        handleApproveDonorRequest(request.id)
                                      }
                                      className="admin-action-button"
                                      style={{
                                        background: "#16a34a",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "0.375rem",
                                        padding: "0.35rem 0.75rem",
                                        cursor: "pointer",
                                        fontSize: "0.82rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      ✓ Approve
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRejectDonorRequest(request.id)
                                      }
                                      className="admin-action-button delete"
                                    >
                                      ✕ Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Approved Donor Requests Card ── */}
                <div className="approved-requests-card">
                  {/* Card Header */}
                  <div className="approved-requests-header">
                    <div className="approved-requests-header-left">
                      <div className="approved-requests-icon-wrap">
                        <span className="approved-requests-icon">✅</span>
                      </div>
                      <div>
                        <h4 className="approved-requests-title">
                          Approved Donor Requests
                        </h4>
                        <p className="approved-requests-subtitle">
                          All processed &amp; live blood donation requests
                        </p>
                      </div>
                    </div>

                    <div className="approved-requests-header-right">
                      {/* Stat pills */}
                      <div className="approved-requests-stats">
                        <span className="approved-stat-pill approved-stat-approved">
                          ✅&nbsp;
                          {
                            donorRequests.filter((r) => r.status === "approved")
                              .length
                          }{" "}
                          Approved
                        </span>
                        <span className="approved-stat-pill approved-stat-active">
                          🟢&nbsp;
                          {
                            donorRequests.filter((r) => r.status === "active")
                              .length
                          }{" "}
                          Active
                        </span>
                        <span className="approved-stat-pill approved-stat-rejected">
                          ❌&nbsp;
                          {
                            donorRequests.filter((r) => r.status === "rejected")
                              .length
                          }{" "}
                          Rejected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Filter bar inside card */}
                  <div className="approved-requests-filter-bar">
                    <span className="approved-filter-label">
                      📍 Filter by Location
                    </span>
                    <select
                      value={selectedDonorRequestLocation}
                      onChange={(e) =>
                        setSelectedDonorRequestLocation(e.target.value)
                      }
                      className="approved-filter-select"
                    >
                      <option value="">All Locations</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.name}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                    {selectedDonorRequestLocation && (
                      <button
                        onClick={() => setSelectedDonorRequestLocation("")}
                        className="approved-filter-clear"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>

                  {/* Table body */}
                  <div className="approved-requests-body">
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Hospital</th>
                            <th>Location</th>
                            <th>Blood Type</th>
                            <th>Units</th>
                            <th>Urgency</th>
                            <th>Deadline</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDonorRequests.filter(
                            (r) => r.status !== "pending",
                          ).length === 0 ? (
                            <tr>
                              <td colSpan="9">
                                <div className="approved-empty-state">
                                  <div className="approved-empty-icon">📋</div>
                                  <p className="approved-empty-title">
                                    {donorRequests.filter(
                                      (r) => r.status !== "pending",
                                    ).length === 0
                                      ? "No approved donor requests yet."
                                      : "No requests match the selected location."}
                                  </p>
                                  <p className="approved-empty-hint">
                                    Approve pending requests above to see them
                                    here.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            filteredDonorRequests
                              .filter((r) => r.status !== "pending")
                              .map((request) => (
                                <tr key={request.id}>
                                  <td className="font-medium">
                                    <div>
                                      <div className="font-semibold">
                                        {request.title}
                                      </div>
                                      <div className="text-sm text-gray-500 max-w-xs truncate">
                                        {request.description}
                                      </div>
                                    </div>
                                  </td>
                                  <td>{request.hospitalName}</td>
                                  <td>{request.location}</td>
                                  <td className="font-medium">
                                    {request.bloodType}
                                  </td>
                                  <td>{request.units}</td>
                                  <td>
                                    <span
                                      className={`admin-urgency-badge admin-urgency-${(request.urgency || "").toLowerCase()}`}
                                    >
                                      {request.urgency}
                                    </span>
                                  </td>
                                  <td>{request.deadline}</td>
                                  <td>
                                    <span
                                      className={`admin-status-badge admin-status-${request.status}`}
                                    >
                                      {request.status}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="admin-action-buttons">
                                      <button
                                        onClick={() =>
                                          handleToggleDonorRequestStatus(
                                            request.id,
                                          )
                                        }
                                        className={`admin-action-button ${
                                          request.status === "active" ||
                                          request.status === "approved"
                                            ? "deactivate"
                                            : "activate"
                                        }`}
                                      >
                                        {request.status === "active" ||
                                        request.status === "approved"
                                          ? "Deactivate"
                                          : "Activate"}
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteDonorRequest(request.id)
                                        }
                                        className="admin-action-button delete"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
