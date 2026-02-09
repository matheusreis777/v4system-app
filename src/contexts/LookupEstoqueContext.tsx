import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { tipoVeiculoService } from "../services/lookups-estoque/tipoVeiculoService";
import { marcaService } from "../services/lookups-estoque/marcaService";
import { modeloService } from "../services/lookups-estoque/modeloService";
import { statusVeiculoService } from "../services/lookups-estoque/statusVeiculoService";

export interface LookupItem {
  id: number;
  nome: string;
}

interface ReloadParams {
  tipoVeiculoId?: number;
  marcaId?: number;
}

interface LookupEstoqueContextData {
  tipoVeiculo: LookupItem[];
  marca: LookupItem[];
  modelo: LookupItem[];
  statusVeiculo: LookupItem[];
  loading: boolean;
  reload: (params?: ReloadParams) => Promise<void>;
}

const LookupContext = createContext<LookupEstoqueContextData>(
  {} as LookupEstoqueContextData,
);

export function LookupProviderEstoque({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tipoVeiculo, setTipoVeiculo] = useState<LookupItem[]>([]);
  const [marca, setMarca] = useState<LookupItem[]>([]);
  const [modelo, setModelo] = useState<LookupItem[]>([]);
  const [statusVeiculo, setStatusVeiculo] = useState<LookupItem[]>([]);
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
    setTipoVeiculo([]);
    setMarca([]);
    setModelo([]);
    setStatusVeiculo([]);
    await AsyncStorage.removeItem("@lookupsEstoque");
  }

  async function reload(params?: ReloadParams) {
    setLoading(true);

    try {
      const cached = await AsyncStorage.getItem("@lookupsEstoque");
      if (cached) {
        const data = JSON.parse(cached);
        setTipoVeiculo(data.tipoVeiculo ?? []);
        setStatusVeiculo(data.statusVeiculo ?? []);
        setMarca(data.marca ?? []);
        setModelo(data.modelo ?? []);
      }

      const [tipoVeiculoData, statusVeiculoData] = await Promise.all([
        tipoVeiculoService.listar(),
        statusVeiculoService.listar(),
      ]);

      setTipoVeiculo(tipoVeiculoData);
      setStatusVeiculo(statusVeiculoData);

      let marcaData: LookupItem[] = [];
      let modeloData: LookupItem[] = [];

      if (params?.tipoVeiculoId) {
        marcaData = await marcaService.listar(params.tipoVeiculoId);
        console.log("Marcas carregadas:", marcaData);
        setMarca(marcaData);
      } else {
        setMarca([]);
      }

      if (params?.tipoVeiculoId && params?.marcaId) {
        modeloData = await modeloService.listar(
          params.marcaId,
          params.tipoVeiculoId,
        );
        setModelo(modeloData);
      } else {
        setModelo([]);
      }

      await AsyncStorage.setItem(
        "@lookupsEstoque",
        JSON.stringify({
          tipoVeiculo: tipoVeiculoData,
          statusVeiculo: statusVeiculoData,
          marca: marcaData,
          modelo: modeloData,
        }),
      );
    } catch (error) {
      console.error("Erro ao carregar lookups estoque", error);
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
        reload,
      }}
    >
      {children}
    </LookupContext.Provider>
  );
}

export function useLookupsEstoque() {
  return useContext(LookupContext);
}
