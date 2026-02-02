import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login as loginService,
  validaTelefone as validaTelefoneService,
  trocarSenha as trocaSenhaService,
} from "../services/authService";
import { LoginResponse } from "../models/loginResponse";

interface AuthContextData {
  userToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  signIn: (cpf: string, senha: string) => Promise<LoginResponse>;
  validatePhone: (telefone: number, cpf: string) => Promise<boolean>;
  trocaSenha: (cpf: string, senha: string) => Promise<number>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!userToken;

  useEffect(() => {
    bootstrapAuth();
  }, []);

  async function bootstrapAuth() {
    try {
      const token = await AsyncStorage.getItem("@token");
      if (token) {
        setUserToken(token);
      }
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (cpf: string, senha: string): Promise<LoginResponse> => {
    cpf = cpf.replace(/\D/g, "");

    const response = await loginService({ cpf, senha });
    const {
      token,
      usuarioNome,
      usuarioPerfilDescricao,
      usuarioLogin,
      usuarioId,
      empresas,
      telefone,
    } = response.data;

    setUserToken(token);

    await AsyncStorage.multiSet([
      ["@token", token],
      ["@nameUser", usuarioNome],
      ["@usuarioId", JSON.stringify(usuarioId)],
      ["@descriptionProfile", usuarioPerfilDescricao],
      ["@login", usuarioLogin],
      ["@phone", JSON.stringify(telefone)],
      ["@empresas", JSON.stringify(empresas)],
    ]);

    return response.data;
  };

  const validatePhone = async (
    telefone: number,
    cpf: string,
  ): Promise<boolean> => {
    try {
      cpf = cpf.replace(/\D/g, "");
      const response = await validaTelefoneService(telefone, cpf);
      return response.data === true;
    } catch {
      return false;
    }
  };

  const trocaSenha = async (cpf: string, senha: string): Promise<number> => {
    cpf = cpf.replace(/\D/g, "");
    const response = await trocaSenhaService({ cpf, senha });
    return response.status;
  };

  const signOut = async () => {
    setUserToken(null);
    await AsyncStorage.multiRemove([
      "@token",
      "@nameUser",
      "@usuarioId",
      "@descriptionProfile",
      "@login",
      "@phone",
      "@empresas",
      "@lookups",
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        isAuthenticated,
        loading,
        signIn,
        validatePhone,
        trocaSenha,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve estar dentro de AuthProvider");
  }
  return context;
};
