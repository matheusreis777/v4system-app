import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

export interface LookupItem {
  id: number;
  nome: string;
}

interface LookupClienteContextData {
  nome: LookupItem[];
  email: LookupItem[];
  cpfCnpj: LookupItem[];
  telefone: LookupItem[];
  loading: boolean;
  reload: () => Promise<void>;
}

const LookupContext = createContext<LookupClienteContextData>(
  {} as LookupClienteContextData,
);

export function LookupProviderEstoque({
  children,
}: {
  children: React.ReactNode;
}) {
  const [nome, setNome] = useState<LookupItem[]>([]);
  const [email, setEmail] = useState<LookupItem[]>([]);
  const [cpfCnpj, setCpfCnpj] = useState<LookupItem[]>([]);
  const [telefone, setTelefone] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { userToken } = useAuth();
  const isAuthenticated = !!userToken;

  useEffect(() => {
    if (isAuthenticated) {
      reload();
    } else {
      clearLookups();
    }
  }, [isAuthenticated]);

  async function clearLookups() {
    setNome([]);
    setEmail([]);
    setCpfCnpj([]);
    setTelefone([]);
    await AsyncStorage.removeItem("@lookupsCliente");
  }

  async function reload() {
    setLoading(true);

    try {
      const cached = await AsyncStorage.getItem("@lookupsCliente");
      if (cached) {
        const data = JSON.parse(cached);
        setNome(data.nome ?? []);
        setEmail(data.email ?? []);
        setCpfCnpj(data.cpfCnpj ?? []);
        setTelefone(data.telefone ?? []);
      }
    } catch (error) {
      console.error("Erro ao carregar lookups cliente", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LookupContext.Provider
      value={{
        nome,
        email,
        cpfCnpj,
        telefone,
        loading,
        reload,
      }}
    >
      {children}
    </LookupContext.Provider>
  );
}

export function useLookupsCliente() {
  return useContext(LookupContext);
}
