import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RouteGuard = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, checkAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const userData = checkAuth();
        if (!userData) {
            navigate('/signin');
            return;
        }

        if (allowedRoles && !allowedRoles.includes(userData?.role)) {
            // Redirect to appropriate dashboard based on role
            switch (userData?.role) {
                case 'admin':
                    navigate('/dashboard/admin');
                    break;
                case 'recipient':
                    navigate('/dashboard/recipient');
                    break;
                case 'donor':
                default:
                    navigate('/dashboard/donor');
                    break;
            }
        }
    }, [user, isAuthenticated, allowedRoles, navigate, checkAuth]);

    const userData = checkAuth();
    if (!userData) {
        return null; // Will redirect in useEffect
    }

    if (allowedRoles && !allowedRoles.includes(userData?.role)) {
        return null; // Will redirect in useEffect
    }

    return children;
};

export default RouteGuard;
