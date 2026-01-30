import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login as loginService,
  validaTelefone as validaTelefoneService,
  trocarSenha as trocaSenhaService,
} from "../services/authService";
import { LoginResponse } from "../models/loginResponse";

interface AuthContextData {
  userToken: string | null;
  signIn: (cpf: string, senha: string) => Promise<LoginResponse>;
  validatePhone: (telefone: number, cpf: string) => Promise<boolean>;
  trocaSenha: (cpf: string, senha: string) => Promise<number>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);

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

      // Aqui você retorna SOMENTE o boolean
      return response.data === true;
    } catch (error) {
      console.error("Erro ao validar telefone:", error);
      return false;
    }
  };

  const trocaSenha = async (cpf: string, senha: string): Promise<number> => {
    try {
      cpf = cpf.replace(/\D/g, "");

      const response = await trocaSenhaService({ cpf, senha });

      return response.status;
    } catch (error) {
      console.error("Erro ao trocar senha:", error);
      throw error;
    }
  };

  const signOut = async () => {
    setUserToken(null);
    await AsyncStorage.removeItem("@token");
  };

  return (
    <AuthContext.Provider
      value={{ userToken, signIn, validatePhone, trocaSenha, signOut }}
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
