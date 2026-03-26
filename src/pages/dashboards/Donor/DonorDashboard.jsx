import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const DonorDashboard = () => {
    const navigate = useNavigate();
    const { user, logout, checkAuth } = useAuth();

    useEffect(() => {
        const userData = checkAuth();
        if (!userData) {
            navigate('/signin');
        }
    }, [navigate, checkAuth, user]);

    const handleLogout = () => {
        logout();
        navigate('/signin');
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
                        <div className="classic-stat-number">12</div>
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
                        <div className="classic-stat-number">45</div>
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

                                <button className="classic-action-button profile">
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
                                <img src="https://picsum.photos/seed/donor/60/60.jpg" alt="Profile" className="classic-profile-avatar" />
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
                                <span className="classic-profile-value">Jan 15, 1990</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Phone</span>
                                <span className="classic-profile-value">+1 234 567 8900</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Email</span>
                                <span className="classic-profile-value">john.doe@email.com</span>
                            </div>
                            <div className="classic-profile-info">
                                <span className="classic-profile-label">Address</span>
                                <span className="classic-profile-value">123 Main St, City</span>
                            </div>
                        </div>

                        {/* Next Donation */}
                        <div className="classic-next-donation">
                            <h3>Next Donation</h3>
                            <div className="classic-donation-date">
                                <p>Eligible Date</p>
                                <p className="date">March 15, 2024</p>
                            </div>
                            <p style={{ fontSize: '13px', marginBottom: '15px' }}>You can donate again in 20 days</p>
                            <button className="classic-schedule-button">Schedule Now</button>
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
        </div>
    );
};

export default DonorDashboard;