import React, { createContext, useState } from "react";
import api from "../utils/api.js";

const AuthContext = createContext();

// Lazily initialize auth state from localStorage to avoid setState in effects
function getInitialAuthState() {
  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (storedToken) {
        userData.token = storedToken;
        api.setToken(storedToken);
      }
      return { user: userData, isAuthenticated: true };
    }
  } catch (error) {
    console.error("Error reading auth state from localStorage:", error);
  }
  return { user: null, isAuthenticated: false };
}

export const AuthProvider = ({ children }) => {
  const [{ user: initialUser, isAuthenticated: initialAuth }] =
    useState(getInitialAuthState);
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("authToken", userData.token);
      api.setToken(userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    api.removeToken();
  };

  const checkAuth = () => {
    // Check localStorage for persistent authentication
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("authToken");

    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        userData.token = storedToken;
        return userData;
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        return null;
      }
    }
    return user; // Return current user state as fallback
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        }
      : {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    getAuthHeaders,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
