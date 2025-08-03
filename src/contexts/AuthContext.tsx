import { createContext, useContext, useEffect, useState } from 'react';

// Temporary mock for demo purposes until Supabase is fully configured
interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage (demo purposes)
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo authentication - replace with real Supabase when ready
    if (email === 'admin@proyectosflores.com' && password === 'admin123') {
      const user = { id: '1', email };
      setUser(user);
      localStorage.setItem('demo_user', JSON.stringify(user));
      return { error: null };
    }
    return { error: { message: 'Credenciales incorrectas. Usa: admin@proyectosflores.com / admin123' } };
  };

  const signUp = async (email: string, password: string) => {
    const user = { id: Math.random().toString(), email };
    setUser(user);
    localStorage.setItem('demo_user', JSON.stringify(user));
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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