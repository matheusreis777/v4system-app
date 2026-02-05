import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";

export interface LookupItem {
  id: number;
  nome: string;
}

interface LookupEstoqueContextData {
  tipoVeiculo: LookupItem[];
  marca: LookupItem[];
  modelo: LookupItem[];
  statusVeiculo: LookupItem[];
  loading: boolean;
  reload: () => Promise<void>;
}

const LookupContext = createContext<LookupEstoqueContextData>(
  {} as LookupEstoqueContextData,
);

export function LookupProvider({ children }: { children: React.ReactNode }) {
  const [tipoVeiculo, setTipoVeiculo] = useState<LookupItem[]>([]);
  const [marca, setMarca] = useState<LookupItem[]>([]);
  const [modelo, setModelo] = useState<LookupItem[]>([]);
  const [statusVeiculo, setStatusVeiculo] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { userToken } = useAuth();
  const isAuthenticated = !!userToken;

  useEffect(() => {
    if (isAuthenticated) {
      loadLookups();
    } else {
      clearLookups();
    }
  }, [isAuthenticated]);

  async function clearLookups() {
    await AsyncStorage.removeItem("@lookups");
  }

  async function loadLookups() {
    setLoading(true);

    try {
      // 1️⃣ Carrega cache imediatamente
      const cached = await AsyncStorage.getItem("@lookups");
      if (cached) {
        const data = JSON.parse(cached);
      }

      // 2️⃣ Atualiza do backend (revalidação)
      const results = await Promise.allSettled([]);

      await AsyncStorage.setItem("@lookups", JSON.stringify(results));
    } catch (error) {
      console.error("Erro ao carregar lookups", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LookupContext.Provider
      value={{
        tipoVeiculo,
        marca,
        modelo,
        statusVeiculo,
        loading,
        reload: loadLookups,
      }}
    >
      {children}
    </LookupContext.Provider>
  );
}

export function useLookupsEstoque() {
  return useContext(LookupContext);
}
