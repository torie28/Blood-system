import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import Signin from '../pages/auth/Sign in/Signin.jsx';
import Signup from '../pages/auth/Sign up/Signup.jsx';
import AdminDashboard from '../pages/dashboards/Admin/AdminDashboard.jsx';
import DonorDashboard from '../pages/dashboards/Donor/DonorDashboard.jsx';
import ResipientDashboard from '../pages/dashboards/Resipience/ResipientDashboard.jsx';
import RouteGuard from '../components/RouteGuard.jsx';

const Index = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default route redirects to signin */}
                <Route path="/" element={<Navigate to="/signin" replace />} />

                {/* Authentication routes */}
                <Route path="/signin" element={<Signin />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Dashboard routes */}
                <Route
                    path="/dashboard/admin"
                    element={
                        <RouteGuard allowedRoles={['admin']}>
                            <AdminDashboard />
                        </RouteGuard>
                    }
                />
                <Route
                    path="/dashboard/donor"
                    element={
                        <RouteGuard allowedRoles={['donor']}>
                            <DonorDashboard />
                        </RouteGuard>
                    }
                />
                <Route
                    path="/dashboard/recipient"
                    element={
                        <RouteGuard allowedRoles={['recipient']}>
                            <ResipientDashboard />
                        </RouteGuard>
                    }
                />

                {/* Catch all route - redirect to signin */}
                <Route path="*" element={<Navigate to="/signin" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Index;