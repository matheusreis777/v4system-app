import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import { api } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

export class GenericService<TResponse = any> {
  private montarUrl(url: string, id?: string | number) {
    const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
    const rota = url.startsWith("/") ? url : `/${url}`;

    const completa = `${base}${rota}`;
    return id ? `${completa}/${id}` : completa;
  }

  async get(
    url: string,
    id?: string | number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const finalUrl = this.montarUrl(url, id);
    config = config || {};
    config.headers = config.headers || {};

    try {
      const token = await AsyncStorage.getItem("@token");

      if (!token) {
        throw new Error("Token não encontrado no AsyncStorage");
      }

      config.headers["Content-Type"] = "application/json";
      config.headers["Authorization"] = `Bearer ${token}`;

      return api.get<TResponse>(finalUrl, config);
    } catch (error) {
      console.error("Erro no GET:", error);
      throw error;
    }
  }

  async postFiltro(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const finalUrl = this.montarUrl(url);

    console.log(data);

    config = config ?? {};
    config.headers = {
      ...(config.headers ?? {}),
    };

    try {
      const token = await AsyncStorage.getItem("@token");

      if (!token) {
        throw new Error("Token não encontrado no AsyncStorage");
      }

      config.headers = {
        ...config.headers,
        "Content-Type": config.headers["Content-Type"] ?? "application/json",
        Authorization: `Bearer ${token}`,
      };

      // ✅ DETECTA URL ABSOLUTA
      const isAbsoluteUrl = /^https?:\/\//i.test(finalUrl);

      // ✅ INSTÂNCIA AXIOS CORRETAMENTE TIPADA
      const axiosInstance: AxiosInstance = isAbsoluteUrl ? axios : api;

      const response = await axiosInstance.post<TResponse>(
        finalUrl,
        data,
        config,
      );

      /* console.log("STATUS:", response.status);
      console.log("RESPONSE:", response.data); */

      return response;
    } catch (error: any) {
      /* console.log("❌ ERRO POST");
      console.log("STATUS:", error?.response?.status);
      console.log("DATA:", error?.response?.data);
      console.log("HEADERS:", error?.response?.headers);
      console.log("MESSAGE:", error?.message); */
      throw error;
    }
  }
}
