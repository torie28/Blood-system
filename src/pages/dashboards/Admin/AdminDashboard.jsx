import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [hospitalRequests, setHospitalRequests] = useState([]);
    const [donorStats, setDonorStats] = useState({});
    const [bloodInventory, setBloodInventory] = useState({});
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(true);
    const [showHospitalDialog, setShowHospitalDialog] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [newHospital, setNewHospital] = useState({
        name: '',
        location: '',
        contactNumber: '',
        email: '',
        address: ''
    });

    // Fetch data from API
    useEffect(() => {
        fetchHospitals();
        fetchMockData();
    }, []);

    const fetchHospitals = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/hospitals`);
            const data = await response.json();
            if (data.success) {
                setHospitals(data.data);
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error);
        }
    };

    const fetchMockData = () => {
        // This is still mock data for other parts of the dashboard
        setTimeout(() => {
            setHospitalRequests([
                {
                    id: 1,
                    hospitalName: 'City General Hospital',
                    location: 'Nairobi',
                    bloodType: 'O+',
                    units: 5,
                    urgency: 'High',
                    requestDate: '2024-03-24',
                    status: 'pending',
                    recipientName: 'John Doe',
                    patientId: 'P001'
                },
                {
                    id: 2,
                    hospitalName: 'St. Mary Medical Center',
                    location: 'Mombasa',
                    bloodType: 'A-',
                    units: 3,
                    urgency: 'Medium',
                    requestDate: '2024-03-23',
                    status: 'pending',
                    recipientName: 'Jane Smith',
                    patientId: 'P002'
                },
                {
                    id: 3,
                    hospitalName: 'Regional Hospital',
                    location: 'Kisumu',
                    bloodType: 'B+',
                    units: 2,
                    urgency: 'Low',
                    requestDate: '2024-03-22',
                    status: 'approved',
                    recipientName: 'Robert Johnson',
                    patientId: 'P003'
                }
            ]);

            setDonorStats({
                total: 1250,
                byLocation: {
                    'Nairobi': 450,
                    'Mombasa': 320,
                    'Kisumu': 280,
                    'Nakuru': 200
                },
                byBloodType: {
                    'O+': 350,
                    'A+': 280,
                    'B+': 220,
                    'AB+': 150,
                    'O-': 120,
                    'A-': 80,
                    'B-': 30,
                    'AB-': 20
                }
            });

            setBloodInventory({
                'O+': 85,
                'A+': 62,
                'B+': 45,
                'AB+': 28,
                'O-': 35,
                'A-': 22,
                'B-': 8,
                'AB-': 5
            });

            setLoading(false);
        }, 1000);
    };

    const filteredRequests = selectedLocation
        ? hospitalRequests.filter(req => req.location === selectedLocation)
        : hospitalRequests;

    const handleRequestResponse = (requestId, response) => {
        setHospitalRequests(prev =>
            prev.map(req =>
                req.id === requestId
                    ? { ...req, status: response === 'approve' ? 'approved' : 'rejected' }
                    : req
            )
        );
    };

    const getUniqueLocations = () => {
        return [...new Set(hospitalRequests.map(req => req.location))];
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'High': return 'text-red-600 bg-red-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'Low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-600 bg-green-100';
            case 'rejected': return 'text-red-600 bg-red-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const handleAddHospital = async () => {
        if (newHospital.name && newHospital.location && newHospital.contactNumber && newHospital.email) {
            try {
                const response = await fetch(`${API_BASE_URL}/hospitals`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: newHospital.name,
                        email: newHospital.email,
                        phone: newHospital.contactNumber,
                        address: newHospital.address,
                        location: newHospital.location
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    // Refresh hospitals list
                    await fetchHospitals();
                    
                    // Reset form
                    setNewHospital({
                        name: '',
                        location: '',
                        contactNumber: '',
                        email: '',
                        address: ''
                    });
                    setShowHospitalDialog(false);
                    
                    alert('Hospital added successfully!');
                } else {
                    alert('Failed to add hospital: ' + (data.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error adding hospital:', error);
                alert('Error adding hospital. Please try again.');
            }
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const handleInputChange = (e) => {
        setNewHospital({
            ...newHospital,
            [e.target.name]: e.target.value
        });
    };

    if (loading) {
        return (
            <div className="admin-loading-container">
                <div className="text-center">
                    <div className="admin-loading-spinner"></div>
                    <p className="admin-loading-text">Loading dashboard...</p>
                </div>
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
                            <h3 className="admin-stat-title">Pending Requests</h3>
                            <p className="admin-stat-value pending">
                                {hospitalRequests.filter(req => req.status === 'pending').length}
                            </p>
                            <p className="admin-stat-description">Awaiting response</p>
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
                                    onClick={() => setActiveTab('requests')}
                                    className={`admin-tab-button ${activeTab === 'requests' ? 'active' : ''
                                        }`}
                                >
                                    Hospital Requests
                                </button>
                                <button
                                    onClick={() => setActiveTab('donors')}
                                    className={`admin-tab-button ${activeTab === 'donors' ? 'active' : ''
                                        }`}
                                >
                                    Donor Statistics
                                </button>
                                <button
                                    onClick={() => setActiveTab('inventory')}
                                    className={`admin-tab-button ${activeTab === 'inventory' ? 'active' : ''
                                        }`}
                                >
                                    Blood Inventory
                                </button>
                                <button
                                    onClick={() => setActiveTab('hospitals')}
                                    className={`admin-tab-button ${activeTab === 'hospitals' ? 'active' : ''
                                        }`}
                                >
                                    Hospital Management
                                </button>
                            </nav>
                        </div>

                        {/* Hospital Requests Tab */}
                        {activeTab === 'requests' && (
                            <div className="admin-tab-content">
                                {/* Location Filter */}
                                <div className="admin-filter-section">
                                    <label className="admin-filter-label">
                                        Filter by Location
                                    </label>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="admin-filter-select"
                                    >
                                        <option value="">All Locations</option>
                                        {getUniqueLocations().map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Requests Table */}
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Hospital</th>
                                                <th>Location</th>
                                                <th>Recipient</th>
                                                <th>Blood Type</th>
                                                <th>Units</th>
                                                <th>Urgency</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRequests.map(request => (
                                                <tr key={request.id}>
                                                    <td>
                                                        {request.hospitalName}
                                                    </td>
                                                    <td>
                                                        {request.location}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <div>{request.recipientName}</div>
                                                            <div className="text-gray-500">ID: {request.patientId}</div>
                                                        </div>
                                                    </td>
                                                    <td className="font-medium">
                                                        {request.bloodType}
                                                    </td>
                                                    <td>
                                                        {request.units}
                                                    </td>
                                                    <td>
                                                        <span className={`admin-urgency-badge admin-urgency-${request.urgency.toLowerCase()}`}>
                                                            {request.urgency}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`admin-status-badge admin-status-${request.status}`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {request.status === 'pending' && (
                                                            <div className="admin-action-buttons">
                                                                <button
                                                                    onClick={() => handleRequestResponse(request.id, 'approve')}
                                                                    className="admin-action-button approve"
                                                                    disabled={bloodInventory[request.bloodType] < request.units}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRequestResponse(request.id, 'reject')}
                                                                    className="admin-action-button reject"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                        {request.status !== 'pending' && (
                                                            <span className="text-gray-400">
                                                                {request.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Donor Statistics Tab */}
                        {activeTab === 'donors' && (
                            <div className="admin-tab-content">
                                <h3 className="admin-stats-card">Donor Statistics by Location</h3>
                                <div className="admin-stats-grid">
                                    <div className="admin-stats-card">
                                        <h4>By Location</h4>
                                        <div className="space-y-2">
                                            {Object.entries(donorStats.byLocation).map(([location, count]) => (
                                                <div key={location} className="admin-stat-item">
                                                    <span className="admin-stat-label">{location}</span>
                                                    <span className="admin-stat-count">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="admin-stats-card">
                                        <h4>By Blood Type</h4>
                                        <div className="space-y-2">
                                            {Object.entries(donorStats.byBloodType).map(([bloodType, count]) => (
                                                <div key={bloodType} className="admin-stat-item">
                                                    <span className="admin-stat-label">{bloodType}</span>
                                                    <span className="admin-stat-count">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blood Inventory Tab */}
                        {activeTab === 'inventory' && (
                            <div className="admin-tab-content">
                                <h3 className="admin-stats-card">Current Blood Inventory</h3>
                                <div className="admin-inventory-grid">
                                    {Object.entries(bloodInventory).map(([bloodType, units]) => (
                                        <div key={bloodType} className="admin-inventory-card">
                                            <div className="admin-blood-type">{bloodType}</div>
                                            <div className="admin-units-count">{units} units</div>
                                            <div className={`admin-inventory-status ${units < 10 ? 'critical' : units < 30 ? 'low' : 'adequate'
                                                }`}>
                                                {units < 10 ? 'Critical' : units < 30 ? 'Low' : 'Adequate'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Hospital Management Tab */}
                        {activeTab === 'hospitals' && (
                            <div className="admin-tab-content">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800">Hospital Management</h3>
                                    <button
                                        onClick={() => setShowHospitalDialog(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {hospitals.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                                        No hospitals registered yet. Click "Add Hospital" to register a new hospital.
                                                    </td>
                                                </tr>
                                            ) : (
                                                hospitals.map(hospital => (
                                                    <tr key={hospital.id}>
                                                        <td>{hospital.id}</td>
                                                        <td className="font-medium">{hospital.name}</td>
                                                        <td>{hospital.location?.city || hospital.location || '-'}</td>
                                                        <td>{hospital.phone}</td>
                                                        <td>{hospital.email}</td>
                                                        <td>{hospital.address || '-'}</td>
                                                        <td>{hospital.created_at ? new Date(hospital.created_at).toISOString().split('T')[0] : '-'}</td>
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
                                        <h3 className="classic-hospital-dialog-title">Add New Hospital</h3>
                                        <button
                                            onClick={() => setShowHospitalDialog(false)}
                                            className="classic-hospital-dialog-close"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                                            <label className="classic-form-label">
                                                Address
                                            </label>
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
