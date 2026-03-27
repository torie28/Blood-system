import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import api from '../../../utils/api.js';

const DonorDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, checkAuth, login } = useAuth();
    const [donationStats, setDonationStats] = useState({
        total_donations: 0,
        days_since_last_donation: null,
        last_donation_date: null
    });
    const [loading, setLoading] = useState(true);
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        phone_number: '',
        location: '',
        date_of_birth: '',
        blood_group: '',
        blood_type: '',
        profile_photo: null
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [bloodRequests, setBloodRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [schedulingRequestId, setSchedulingRequestId] = useState(null);

    console.log('Current user data in dashboard:', user);
    console.log('Blood group:', user?.blood_group);
    console.log('Blood type:', user?.blood_type);
    console.log('Phone number:', user?.phone_number);
    console.log('Location:', user?.location);
    console.log('All user fields:', Object.keys(user || {}));

    const fetchDonationStats = async () => {
        try {
            const stats = await api.get('/donations/stats');
            setDonationStats(stats);
        } catch (error) {
            console.error('Failed to fetch donation stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/user/profile');
            if (response.success && response.user) {
                // Update the user in auth context with fresh data
                login(response.user);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    const fetchBloodRequests = async () => {
        setRequestsLoading(true);
        try {
            const response = await api.get('/blood-requests/location');
            console.log('Blood requests API response:', response);
            if (response.success) {
                console.log('Blood requests data:', response.requests);
                setBloodRequests(response.requests);
            } else {
                console.log('API response error:', response);
            }
        } catch (error) {
            console.error('Failed to fetch blood requests:', error);
        } finally {
            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        const userData = checkAuth();
        if (!userData) {
            navigate('/signin');
        } else {
            fetchDonationStats();
            fetchUserProfile();
            fetchBloodRequests();
        }
    }, [navigate, checkAuth, user]);

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const handleProfileClick = () => {
        setProfileData({
            name: user?.name || '',
            phone_number: user?.phone_number || '',
            location: user?.location || '',
            date_of_birth: user?.date_of_birth || '',
            blood_group: user?.blood_group || '',
            blood_type: user?.blood_type || '',
            profile_photo: user?.profile_photo || null
        });
        setPhotoPreview(user?.profile_photo || null);
        setSelectedPhoto(null);
        setShowProfileDialog(true);
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);

        try {
            const formData = new FormData();

            // Get original user data for comparison
            const originalData = {
                name: user?.name || '',
                phone_number: user?.phone_number || '',
                location: user?.location || '',
                date_of_birth: user?.date_of_birth || '',
                blood_group: user?.blood_group || '',
                blood_type: user?.blood_type || '',
                profile_photo: user?.profile_photo || null
            };

            // Only include fields that have changed
            let hasChanges = false;
            Object.keys(profileData).forEach(key => {
                if (key !== 'profile_photo') {
                    if (profileData[key] !== originalData[key]) {
                        formData.append(key, profileData[key]);
                        hasChanges = true;
                        console.log(`Field changed ${key}:`, originalData[key], '->', profileData[key]);
                    }
                }
            });

            // Add photo if selected
            if (selectedPhoto) {
                formData.append('profile_photo', selectedPhoto);
                hasChanges = true;
                console.log('Profile photo changed');
            }

            // Check if any changes were made
            if (!hasChanges) {
                alert('No changes detected');
                setProfileLoading(false);
                return;
            }

            // Debug: Log FormData contents
            console.log('FormData contents being sent:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await api.putWithFormData('/user/profile', formData);

            if (response.success) {
                // Update user data in auth context
                login(response.user);
                setShowProfileDialog(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleProfileChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setSelectedPhoto(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setProfileData(prev => ({
            ...prev,
            profile_photo: null
        }));
    };

    const handleScheduleDonation = async (requestId) => {
        setSchedulingRequestId(requestId);
        try {
            const response = await api.post('/donations/schedule', {
                blood_request_id: requestId,
                donation_date: new Date().toISOString().split('T')[0], // Today's date
                status: 'scheduled'
            });

            if (response.success) {
                alert('Donation scheduled successfully! The hospital will contact you soon.');
                // Refresh blood requests to update the UI
                fetchBloodRequests();
                // Refresh donation stats
                fetchDonationStats();
            } else {
                alert('Failed to schedule donation: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Schedule donation error:', error);
            alert('Failed to schedule donation. Please try again.');
        } finally {
            setSchedulingRequestId(null);
        }
    };

    return (
        <div className="classic-dashboard-container">
            {/* Header */}
            <div className="classic-dashboard-header">
                <div className="classic-dashboard-header-content">
                    <div>
                        <h1 className="classic-dashboard-title">Donor Dashboard</h1>
                        <p style={{ color: '#666', fontSize: '14px', margin: '5px 0 0 0' }}>Welcome back, {user?.name || 'Donor'}</p>
                    </div>
                    <div className="classic-dashboard-user-info">
                        <span className="classic-dashboard-status">Active Donor</span>
                        <button
                            onClick={handleLogout}
                            className="classic-logout-button"
                            style={{
                                marginLeft: '15px',
                                padding: '8px 16px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="classic-dashboard-content">
                {/* Stats Cards */}
                <div className="classic-stats-grid">
                    <div className="classic-stat-card">
                        <div className="classic-stat-number">{loading ? '...' : donationStats.total_donations}</div>
                        <div className="classic-stat-label">Total Donations</div>
                    </div>
                    <div className="classic-stat-card">
                        <div className="classic-stat-number">{user?.blood_group}{user?.blood_type || 'N/A'}</div>
                        <div className="classic-stat-label">Blood Type</div>
                    </div>
                    <div className="classic-stat-card">
                        <div className="classic-stat-number">Yes</div>
                        <div className="classic-stat-label">Eligible</div>
                    </div>
                    <div className="classic-stat-card">
                        <div className="classic-stat-number">{loading ? '...' : (donationStats.days_since_last_donation ?? 'N/A')}</div>
                        <div className="classic-stat-label">Days Since Last</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="classic-main-grid">
                    {/* Left Column */}
                    <div>
                        {/* Quick Actions */}
                        <div className="classic-card">
                            <h2 className="classic-card-title">Quick Actions</h2>
                            <div className="classic-actions-grid">
                                <button className="classic-action-button">
                                    <svg className="classic-action-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                    </svg>
                                    <div className="classic-action-content">
                                        <h4>Schedule Donation</h4>
                                        <p>Book your next appointment</p>
                                    </div>
                                </button>

                                <button className="classic-action-button profile" onClick={handleProfileClick}>
                                    <svg className="classic-action-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    <div className="classic-action-content">
                                        <h4>Update Profile</h4>
                                        <p>Edit your information</p>
                                    </div>
                                </button>

                                <button className="classic-action-button history">
                                    <svg className="classic-action-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <div className="classic-action-content">
                                        <h4>Donation History</h4>
                                        <p>View past donations</p>
                                    </div>
                                </button>

                                <button className="classic-action-button certificates">
                                    <svg className="classic-action-icon" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-2a1 1 0 100 2h.01a1 1 0 100-2H13z" clipRule="evenodd" />
                                    </svg>
                                    <div className="classic-action-content">
                                        <h4>Certificates</h4>
                                        <p>Download your certificates</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Recent Donations */}
                        <div className="classic-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 className="classic-card-title" style={{ marginBottom: 0 }}>Recent Donations</h2>
                                <a href="#" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>View All</a>
                            </div>

                            <div className="classic-donation-item">
                                <div className="classic-donation-info">
                                    <h4>Central Blood Bank</h4>
                                    <p>February 15, 2024</p>
                                </div>
                                <div className="classic-donation-details">
                                    <div className="classic-donation-amount">450ml</div>
                                    <div className="classic-donation-status">Completed</div>
                                </div>
                            </div>

                            <div className="classic-donation-item">
                                <div className="classic-donation-info">
                                    <h4>City Hospital</h4>
                                    <p>January 8, 2024</p>
                                </div>
                                <div className="classic-donation-details">
                                    <div className="classic-donation-amount">450ml</div>
                                    <div className="classic-donation-status">Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        {/* Profile Card */}
                        <div className="classic-card">
                            <h2 className="classic-card-title">Profile Information</h2>
                            <div className="classic-profile-header">
                                <img
                                    src={user?.profile_photo || "https://picsum.photos/seed/donor/60/60.jpg"}
                                    alt="Profile"
                                    className="classic-profile-avatar"
                                    onError={(e) => {
                                        e.target.src = "https://picsum.photos/seed/donor/60/60.jpg";
                                    }}
                                />
                                <div>
                                    <h3 className="classic-profile-name">{user?.name || 'John Doe'}</h3>
                                    <p className="classic-profile-id">ID: DON-2024-001</p>
                                </div>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Blood Type</span>
                                <span className="classic-profile-value">{user?.blood_group}{user?.blood_type || 'N/A'}</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Date of Birth</span>
                                <span className="classic-profile-value">{user?.date_of_birth || 'N/A'}</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Phone</span>
                                <span className="classic-profile-value">{user?.phone_number || 'N/A'}</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Email</span>
                                <span className="classic-profile-value">{user?.email || 'N/A'}</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Address</span>
                                <span className="classic-profile-value">{user?.location || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Blood Donation Requests */}
                        <div className="classic-card">
                            <h2 className="classic-card-title">Blood Donation Requests</h2>
                            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                                Requests in your area: {user?.location || 'N/A'}
                            </p>

                            {requestsLoading && bloodRequests.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <p>Loading requests...</p>
                                </div>
                            ) : bloodRequests.length > 0 ? (
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {bloodRequests.slice(0, -1).map((request) => (
                                        <div key={request.id} className="classic-donation-item" style={{ marginBottom: '10px' }}>
                                            <div className="classic-donation-info">
                                                <h4>{request.hospital?.name || 'Hospital'}</h4>
                                                <p style={{ fontSize: '12px', color: '#666' }}>
                                                    {request.blood_group} • {request.units_needed} units needed
                                                </p>
                                                <p style={{ fontSize: '11px', color: '#999' }}>
                                                    {new Date(request.request_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="classic-donation-details">
                                                <div className={`classic-donation-status ${request.urgency_level?.name?.toLowerCase() || 'pending'}`}>
                                                    {request.urgency_level?.name || 'Pending'}
                                                </div>
                                                <button
                                                    className="classic-schedule-button"
                                                    onClick={() => handleScheduleDonation(request.id)}
                                                    disabled={schedulingRequestId === request.id}
                                                    style={{
                                                        marginLeft: '10px',
                                                        padding: '6px 12px',
                                                        fontSize: '12px',
                                                        backgroundColor: schedulingRequestId === request.id ? '#ccc' : '#007bff',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: schedulingRequestId === request.id ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {schedulingRequestId === request.id ? 'Scheduling...' : 'Schedule'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <p style={{ color: '#666', fontSize: '13px' }}>
                                        No blood donation requests found in your area.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Health Tips */}
                        <div className="classic-card">
                            <h2 className="classic-card-title">Health Tips</h2>
                            <div className="classic-health-tip">
                                <div className="classic-health-tip-icon">✓</div>
                                <p className="classic-health-tip-text">Stay hydrated - drink plenty of water before donation</p>
                            </div>
                            <div className="classic-health-tip">
                                <div className="classic-health-tip-icon">✓</div>
                                <p className="classic-health-tip-text">Eat iron-rich foods to maintain healthy hemoglobin levels</p>
                            </div>
                            <div className="classic-health-tip">
                                <div className="classic-health-tip-icon">✓</div>
                                <p className="classic-health-tip-text">Get at least 8 hours of sleep before your donation</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Edit Dialog */}
            {showProfileDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '20px', color: '#333' }}>Edit Profile</h2>

                        <form onSubmit={handleProfileUpdate}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#555', fontSize: '14px', fontWeight: 'bold' }}>Profile Photo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={photoPreview || user?.profile_photo || "https://picsum.photos/seed/donor/80/80.jpg"}
                                            alt="Profile Preview"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid #ddd'
                                            }}
                                            onError={(e) => {
                                                e.target.src = "https://picsum.photos/seed/donor/80/80.jpg";
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            style={{ display: 'none' }}
                                            id="profile-photo-input"
                                        />
                                        <label
                                            htmlFor="profile-photo-input"
                                            style={{
                                                display: 'inline-block',
                                                padding: '8px 16px',
                                                backgroundColor: '#007bff',
                                                color: 'white',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                marginRight: '10px'
                                            }}
                                        >
                                            Choose Photo
                                        </label>
                                        {(photoPreview || user?.profile_photo) && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', margin: '5px 0 0 0' }}>
                                            JPG, PNG, GIF up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => handleProfileChange('name', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileData.phone_number}
                                    onChange={(e) => handleProfileChange('phone_number', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>Address/Location</label>
                                <input
                                    type="text"
                                    value={profileData.location}
                                    onChange={(e) => handleProfileChange('location', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>Date of Birth</label>
                                <input
                                    type="date"
                                    value={profileData.date_of_birth}
                                    onChange={(e) => handleProfileChange('date_of_birth', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>Blood Group</label>
                                <select
                                    value={profileData.blood_group}
                                    onChange={(e) => handleProfileChange('blood_group', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontSize: '14px' }}>Blood Type</label>
                                <select
                                    value={profileData.blood_type}
                                    onChange={(e) => handleProfileChange('blood_type', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                    required
                                >
                                    <option value="">Select Blood Type</option>
                                    <option value="+">+</option>
                                    <option value="-">-</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileDialog(false)}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: 'white',
                                        color: '#666',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    style={{
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        backgroundColor: profileLoading ? '#ccc' : '#007bff',
                                        color: 'white',
                                        cursor: profileLoading ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorDashboard;