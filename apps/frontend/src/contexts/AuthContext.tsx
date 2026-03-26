'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { User } from '@/types/user.types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await authApi.login({ identifier, password });
      if (response.success) {
        setUser(response.data.user);
        toast.success('Logged in successfully');
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authApi.register(data);
      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
