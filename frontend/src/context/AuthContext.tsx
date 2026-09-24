import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthResponse } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; full_name: string; role: string; student_id?: string; department?: string }) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;

    setToken(access_token);
    setUser(loggedUser);
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('auth_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const register = async (data: { email: string; password: string; full_name: string; role: string; student_id?: string; department?: string }): Promise<User> => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    const { access_token, user: newUser } = res.data;

    setToken(access_token);
    setUser(newUser);
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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
