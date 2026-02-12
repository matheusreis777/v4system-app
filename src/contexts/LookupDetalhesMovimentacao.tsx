import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

export interface LookupItem {
  id: number;
  nome: string;
}

interface LookupDetalheMovimentacaoContextData {
  id: LookupItem[];
  loading: boolean;
  reload: () => Promise<void>;
}

const LookupContext = createContext<LookupDetalheMovimentacaoContextData>(
  {} as LookupDetalheMovimentacaoContextData,
);

export function LookupProviderDetalhesMovimentacao({
  children,
}: {
  children: React.ReactNode;
}) {
  const [id, setId] = useState<LookupItem[]>([]);
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
    setId([]);
    await AsyncStorage.removeItem("@lookupsDetalhesMovimentacao");
  }

  async function reload() {
    setLoading(true);

    try {
      const cached = await AsyncStorage.getItem("@lookupsDetalhesMovimentacao");
      if (cached) {
        const data = JSON.parse(cached);
        setId(data.id ?? []);
      }
    } catch (error) {
      console.error("Erro ao carregar lookups detalhes movimentacao", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LookupContext.Provider
      value={{
        id,
        loading,
        reload,
      }}
    >
      {children}
    </LookupContext.Provider>
  );
}

export function useLookupsDetalhesMovimentacao() {
  return useContext(LookupContext);
}
