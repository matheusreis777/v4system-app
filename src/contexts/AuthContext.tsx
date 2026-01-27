import { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

type AuthContextType = {
  token: string | null;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  async function signIn(login: string, password: string) {
    const response = await api.post('/login', { login, password });
    const accessToken = response.data.token;

    setToken(accessToken);
    await SecureStore.setItemAsync('token', accessToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  async function signOut() {
    setToken(null);
    await SecureStore.deleteItemAsync('token');
  }

  return (
    <AuthContext.Provider value={{ token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
