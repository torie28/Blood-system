import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ResipientDashboard = () => {
    const [activeTab, setActiveTab] = useState('new-request');
    const [requests, setRequests] = useState([
        {
            id: 1,
            hospitalName: 'City General Hospital',
            bloodType: 'A+',
            units: 2,
            urgency: 'High',
            status: 'Pending',
            date: '2024-03-24',
            contactPerson: 'Dr. Smith'
        },
        {
            id: 2,
            hospitalName: 'St. Mary Medical Center',
            bloodType: 'O-',
            units: 1,
            urgency: 'Medium',
            status: 'Approved',
            date: '2024-03-23',
            contactPerson: 'Nurse Johnson'
        }
    ]);

    const [formData, setFormData] = useState({
        hospitalName: '',
        bloodType: '',
        units: '',
        urgency: 'Medium',
        contactPerson: '',
        phoneNumber: '',
        email: '',
        reason: '',
        patientName: '',
        patientAge: '',
        patientGender: '',
        medicalHistory: ''
    });

    const hospitals = [
        'City General Hospital',
        'St. Mary Medical Center',
        'Regional Medical Center',
        'University Hospital',
        'Community Health Center',
        'Memorial Hospital'
    ];

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newRequest = {
            id: requests.length + 1,
            ...formData,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0]
        };
        setRequests(prev => [newRequest, ...prev]);

        // Reset form
        setFormData({
            hospitalName: '',
            bloodType: '',
            units: '',
            urgency: 'Medium',
            contactPerson: '',
            phoneNumber: '',
            email: '',
            reason: '',
            patientName: '',
            patientAge: '',
            patientGender: '',
            medicalHistory: ''
        });

        alert('Blood request submitted successfully!');
    };

    return (
        <div className="recipient-dashboard-container">
            <header className="classic-dashboard-header">
                <div className="classic-dashboard-header-content">
                    <div className="flex items-center">
                        <h1 className="classic-dashboard-title">Blood Recipient Dashboard</h1>
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
                                    onClick={() => setActiveTab('new-request')}
                                    className={`recipient-tab-button ${activeTab === 'new-request' ? 'active' : ''
                                        }`}
                                >
                                    New Blood Request
                                </button>
                                <button
                                    onClick={() => setActiveTab('my-requests')}
                                    className={`recipient-tab-button ${activeTab === 'my-requests' ? 'active' : ''
                                        }`}
                                >
                                    My Requests ({requests.length})
                                </button>
                            </nav>
                        </div>
                    </div>

                    {activeTab === 'new-request' && (
                        <div className="recipient-card recipient-fade-in">
                            <h2 className="recipient-card-header">
                                Request Blood from Hospital
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="recipient-form-grid">
                                    {/* Hospital Selection */}
                                    <div className="recipient-form-group">
                                        <label className="recipient-form-label required">
                                            Select Hospital
                                        </label>
                                        <select
                                            name="hospitalName"
                                            value={formData.hospitalName}
                                            onChange={handleInputChange}
                                            required
                                            className="recipient-form-select"
                                        >
                                            <option value="">Choose a hospital...</option>
                                            {hospitals.map(hospital => (
                                                <option key={hospital} value={hospital}>{hospital}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Blood Type */}
                                    <div className="recipient-form-group">
                                        <label className="recipient-form-label required">
                                            Blood Type Required
                                        </label>
                                        <select
                                            name="bloodType"
                                            value={formData.bloodType}
                                            onChange={handleInputChange}
                                            required
                                            className="recipient-form-select"
                                        >
                                            <option value="">Select blood type...</option>
                                            {bloodTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
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
                                            name="units"
                                            value={formData.units}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="10"
                                            required
                                            className="recipient-form-input"
                                        />
                                    </div>

                                    {/* Urgency Level */}
                                    <div className="recipient-form-group">
                                        <label className="recipient-form-label required">
                                            Urgency Level
                                        </label>
                                        <select
                                            name="urgency"
                                            value={formData.urgency}
                                            onChange={handleInputChange}
                                            required
                                            className="recipient-form-select"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High - Emergency</option>
                                        </select>
                                    </div>

                                    {/* Contact Person */}
                                    <div className="recipient-form-group">
                                        <label className="recipient-form-label required">
                                            Contact Person
                                        </label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
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
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
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
                                            name="patientName"
                                            value={formData.patientName}
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
                                            name="patientAge"
                                            value={formData.patientAge}
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
                                            name="patientGender"
                                            value={formData.patientGender}
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
                                        name="medicalHistory"
                                        value={formData.medicalHistory}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="recipient-form-textarea"
                                        placeholder="Any relevant medical history the hospital should know about"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="recipient-submit-button"
                                    >
                                        Submit Blood Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'my-requests' && (
                        <div className="recipient-card recipient-fade-in">
                            <h2 className="recipient-card-header">
                                My Blood Requests
                            </h2>

                            {requests.length === 0 ? (
                                <div className="recipient-empty-state">
                                    <p>No blood requests found.</p>
                                    <button
                                        onClick={() => setActiveTab('new-request')}
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
                                                <th>
                                                    Request ID
                                                </th>
                                                <th>
                                                    Hospital
                                                </th>
                                                <th>
                                                    Blood Type
                                                </th>
                                                <th>
                                                    Units
                                                </th>
                                                <th>
                                                    Urgency
                                                </th>
                                                <th>
                                                    Status
                                                </th>
                                                <th>
                                                    Date
                                                </th>
                                                <th>
                                                    Contact
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((request) => (
                                                <tr key={request.id}>
                                                    <td className="recipient-request-id">
                                                        #{request.id}
                                                    </td>
                                                    <td>
                                                        {request.hospitalName}
                                                    </td>
                                                    <td className="recipient-blood-type">
                                                        {request.bloodType}
                                                    </td>
                                                    <td>
                                                        {request.units}
                                                    </td>
                                                    <td className={`recipient-urgency-${request.urgency.toLowerCase()}`}>
                                                        {request.urgency}
                                                    </td>
                                                    <td>
                                                        <span className={`recipient-status-badge recipient-status-${request.status.toLowerCase()}`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {request.date}
                                                    </td>
                                                    <td>
                                                        {request.contactPerson}
                                                    </td>
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
