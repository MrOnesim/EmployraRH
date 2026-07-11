import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { Company, Employee } from '../types';
import { authClient } from '../services/authService';

interface AuthState {
  isLoggedIn: boolean;
  currentUser: Employee | null;
  currentCompany: Company | null;
  defaultCompany: Company;
  useApi: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerCompany: (
    data: Omit<Company, 'id' | 'uniqueId' | 'createdAt' | 'balance'> & { password?: string },
  ) => Promise<void>;
  setCurrentUser: (user: Employee | null) => void;
  setCurrentCompany: (company: Company | null) => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const defaultCompany: Company = {
  id: '1',
  name: 'GlobalTech Solutions',
  logo: '',
  ownerFirstName: 'Kofi',
  ownerLastName: 'Mensah',
  email: 'admin@globaltech.com',
  phone: '+228 90 12 34 56',
  employeeCount: 25,
  address: 'Paris, France',
  website: 'www.globaltech.com',
  uniqueId: 'GT-2024-001',
  createdAt: new Date('2024-01-15'),
  balance: 5000000,
};

const mockAdmin: Employee = {
  id: '1',
  companyId: '1',
  firstName: 'Kofi',
  lastName: 'Mensah',
  email: 'admin@globaltech.com',
  phone: '+228 90 12 34 56',
  dateOfBirth: new Date('1985-06-15'),
  position: 'Directeur Général',
  department: 'Direction',
  photo: '',
  salary: 1500000,
  status: 'active',
  joinDate: new Date('2024-01-15'),
  role: 'ADMIN',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const useApi = !!import.meta.env.VITE_API_BASE_URL;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  const hydrateFromToken = useCallback(async () => {
    if (!useApi) return;
    try {
      const { data: session } = await authClient.getSession();
      if (session?.user) {
        setCurrentUser(session.user as unknown as Employee);
        setCurrentCompany(session.user as unknown as Company);
        setIsLoggedIn(true);
      }
    } catch {
      // not authenticated
    }
  }, [useApi]);

  useEffect(() => {
    hydrateFromToken();
  }, [hydrateFromToken]);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (useApi) {
      try {
        const { data } = await authClient.signIn.email({ email, password });
        if (!data) return false;
        setCurrentUser(data.user as unknown as Employee);
        setCurrentCompany(data.user as unknown as Company);
        setIsLoggedIn(true);
        return true;
      } catch {
        return false;
      }
    }
    if (email === 'admin@globaltech.com') {
      setCurrentCompany(defaultCompany);
      setCurrentUser(mockAdmin);
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (useApi) {
      try {
        await authClient.signOut();
      } catch {
        /* ignore */
      }
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentCompany(null);
  };

  const deposit = (amount: number) => {
    setCurrentCompany((prev) => (prev ? { ...prev, balance: prev.balance + amount } : prev));
  };

  const withdraw = (amount: number): boolean => {
    let success = false;
    setCurrentCompany((prev) => {
      if (!prev || prev.balance < amount) return prev;
      success = true;
      return { ...prev, balance: prev.balance - amount };
    });
    return success;
  };

  const registerCompany = async (
    companyData: Omit<Company, 'id' | 'uniqueId' | 'createdAt' | 'balance'> & { password?: string },
  ) => {
    if (useApi) {
      try {
        const { data } = await authClient.signUp.email({
          email: companyData.email,
          password: companyData.password || 'temporary-password',
          name: `${companyData.ownerFirstName} ${companyData.ownerLastName}`,
        });
        if (data) {
          setCurrentUser(data.user as unknown as Employee);
          setIsLoggedIn(true);
        }
      } catch {
        return;
      }
    }
    const newCompany: Company = {
      ...companyData,
      id: String(Date.now()),
      uniqueId: `EP-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date(),
      balance: 0,
    };
    setCurrentCompany(newCompany);
    const adminEmployee: Employee = {
      id: 'admin',
      companyId: newCompany.id,
      firstName: companyData.ownerFirstName,
      lastName: companyData.ownerLastName,
      email: companyData.email,
      phone: companyData.phone,
      dateOfBirth: new Date(),
      position: 'Directeur Général',
      department: 'Direction',
      photo: companyData.logo,
      salary: 0,
      status: 'active',
      joinDate: new Date(),
      role: 'ADMIN',
    };
    setCurrentUser(adminEmployee);
    setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        currentCompany,
        defaultCompany,
        useApi,
        login,
        logout,
        registerCompany,
        setCurrentUser,
        setCurrentCompany,
        deposit,
        withdraw,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
