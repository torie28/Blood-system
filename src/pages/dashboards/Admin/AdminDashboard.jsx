import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [hospitalRequests, setHospitalRequests] = useState([]);
    const [donorStats, setDonorStats] = useState({});
    const [bloodInventory, setBloodInventory] = useState({});
    const [selectedLocation, setSelectedLocation] = useState('');
    const [loading, setLoading] = useState(true);

    // Mock data - replace with actual API calls
    useEffect(() => {
        // Simulate API calls
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
    }, []);

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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;