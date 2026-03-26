import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Include token if it exists
      if (storedToken) {
        userData.token = storedToken;
      }
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem('authToken', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const checkAuth = () => {
    // Check localStorage for persistent authentication
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        userData.token = storedToken;
        return userData;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
      }
    }
    return user; // Return current user state as fallback
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    } : {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    getAuthHeaders
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
