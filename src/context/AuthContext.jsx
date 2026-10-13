import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('gym_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gym_user');
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const loggedInUser = await api.auth.login(credentials);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = await api.auth.register(userData);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gym_user');
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const updated = await api.members.getById(user.id);
      setUser(updated);
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isMember = user?.role === 'MEMBER';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isMember,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
