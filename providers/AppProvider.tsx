
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, QueryRecord, ThemeMode, UserRole } from '../types';
import { supabaseService } from '../src/services/supabaseService';

interface AppContextType {
  user: UserProfile | null;
  history: QueryRecord[];
  isLoading: boolean;
  isAuthenticated: boolean;
  theme: ThemeMode;
  toggleTheme: () => void;
  refreshState: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage key for guest persistence
const GUEST_PROFILE_KEY = 'titan_guest_profile';

const DEFAULT_GUEST: UserProfile = {
  id: 'guest_operator',
  email: 'operator@titan.forensic',
  role: UserRole.OPERATOR,
  is_premium: true,
  query_count: 0,
  onboarding_accepted: false,
  permissions: { camera: 'granted', location: 'granted' }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<QueryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always true now
  const [theme, setTheme] = useState<ThemeMode>('dark');

  const refreshState = async () => {
    let u = await supabaseService.getProfile();
    
    // Fallback to local guest if Supabase profile fails or user isn't logged in
    if (!u) {
        const stored = localStorage.getItem(GUEST_PROFILE_KEY);
        u = stored ? JSON.parse(stored) : DEFAULT_GUEST;
    }
    
    const h = await supabaseService.getLogs();
    setUser(u);
    setHistory(h);
  };

  useEffect(() => {
    const init = async () => {
      const client = supabaseService.client;
      if (!client) {
        // No Supabase at all? Use local guest.
        await refreshState();
        setIsLoading(false);
        return;
      }

      await refreshState();
      
      client.auth.onAuthStateChange(async () => {
        await refreshState();
      });
      setIsLoading(false);
    };
    init();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
  };

  const signOut = async () => {
      await supabaseService.signOut();
      localStorage.removeItem(GUEST_PROFILE_KEY);
      window.location.reload();
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (user?.id === 'guest_operator') {
        const newProfile = { ...user, ...updates };
        setUser(newProfile);
        localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(newProfile));
    } else {
        await supabaseService.updateProfile(updates);
        await refreshState();
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, history, isLoading, isAuthenticated, theme, 
      toggleTheme, refreshState, signOut, updateUser 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp context error.');
  return context;
};
