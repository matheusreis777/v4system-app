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
    params?: Record<string, any>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const finalUrl = this.montarUrl(url, id);
    config = config || {};
    config.headers = config.headers || {};

    const token = await AsyncStorage.getItem("@token");
    if (!token) throw new Error("Token não encontrado");

    config.headers["Authorization"] = `Bearer ${token}`;
    config.headers["Content-Type"] = "application/json";

    config.params = params; // 👈 ESSENCIAL

    return api.get<TResponse>(finalUrl, config);
  }

  async postFiltro(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<TResponse>> {
    const finalUrl = this.montarUrl(url);

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
