import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RouteGuard = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, checkAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user?.role)) {
            // Redirect to appropriate dashboard based on role
            switch (user?.role) {
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
    }, [user, isAuthenticated, allowedRoles, navigate]);

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return null; // Will redirect in useEffect
    }

    return children;
};

export default RouteGuard;
