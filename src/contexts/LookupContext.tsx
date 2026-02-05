import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { statusMovimentacaoService } from "../services/lookups/statusMovimentacaoService";
import { momentoMovimentacaoService } from "../services/lookups/momentosMovimentacaoService";
import { tipoNegociacaoService } from "../services/lookups/tipoNegociacaoService";
import { vendedorService } from "../services/lookups/vendedorService";
import { useAuth } from "./AuthContext";

export interface LookupItem {
  id: number;
  nome: string;
}

interface LookupContextData {
  status: LookupItem[];
  momentos: LookupItem[];
  tiposNegociacao: LookupItem[];
  vendedores: LookupItem[];
  loading: boolean;
  reload: () => Promise<void>;
}

const LookupContext = createContext<LookupContextData>({} as LookupContextData);

export function LookupProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LookupItem[]>([]);
  const [momentos, setMomentos] = useState<LookupItem[]>([]);
  const [tiposNegociacao, setTiposNegociacao] = useState<LookupItem[]>([]);
  const [vendedores, setVendedores] = useState<LookupItem[]>([]);
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
    setStatus([]);
    setMomentos([]);
    setTiposNegociacao([]);
    setVendedores([]);
    await AsyncStorage.removeItem("@lookups");
  }

  async function loadLookups() {
    setLoading(true);

    try {
      // 1️⃣ Carrega cache imediatamente
      const cached = await AsyncStorage.getItem("@lookups");
      if (cached) {
        const data = JSON.parse(cached);
        setStatus(data.status ?? []);
        setMomentos(data.momentos ?? []);
        setTiposNegociacao(data.tiposNegociacao ?? []);
        setVendedores(data.vendedores ?? []);
      }

      // 2️⃣ Atualiza do backend (revalidação)
      const results = await Promise.allSettled([
        statusMovimentacaoService.listar(),
        momentoMovimentacaoService.listar(),
        tipoNegociacaoService.listar(),
        vendedorService.listar(
          Number(await AsyncStorage.getItem("@empresaId")),
        ),
      ]);

      setStatus(results[0].status === "fulfilled" ? results[0].value : []);
      setMomentos(results[1].status === "fulfilled" ? results[1].value : []);
      setTiposNegociacao(
        results[2].status === "fulfilled" ? results[2].value : [],
      );
      setVendedores(results[3].status === "fulfilled" ? results[3].value : []);

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
        status,
        momentos,
        tiposNegociacao,
        vendedores,
        loading,
        reload: loadLookups,
      }}
    >
      {children}
    </LookupContext.Provider>
  );
}

export function useLookups() {
  return useContext(LookupContext);
}
