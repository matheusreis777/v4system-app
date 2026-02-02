import { AxiosRequestConfig, AxiosResponse } from "axios";
import { api } from "./api"; // caminho relativo ao seu projeto
import AsyncStorage from "@react-native-async-storage/async-storage";

export class GenericService<T> {
  constructor(private url: string) {}

  async get(
    id?: string | number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const url = id ? `${this.url}/${id}` : this.url;
    config = config || {};
    config.headers = config.headers || {};

    try {
      const token = await AsyncStorage.getItem("@token");

      if (!token) {
        throw new Error("Token não encontrado no AsyncStorage");
      }

      config.headers["Content-Type"] = "application/json";
      config.headers["Authorization"] = `Bearer ${token}`;

      return api.get<T>(url, config);
    } catch (error) {
      console.error("Erro ao obter token ou configurar request:", error);
      throw error;
    }
  }

  async postFiltro(
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    config = config || {};
    config.headers = config.headers || {};

    try {
      const token = await AsyncStorage.getItem("@token");
      if (!token) {
        throw new Error("Token não encontrado no AsyncStorage");
      }

      config.headers["Content-Type"] = "application/json";
      config.headers["Authorization"] = `Bearer ${token}`;

      return api.post<T>(this.url, data, config);
    } catch (error) {
      console.error("Erro ao obter token ou configurar request:", error);
      throw error;
    }
  }

  post(data: T, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.post<T>(this.url, data, config);
  }

  put(
    id: string | number,
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.put<T>(`${this.url}/${id}`, data, config);
  }

  patch(
    id: string | number,
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return api.patch<T>(`${this.url}/${id}`, data, config);
  }

  delete(
    id: string | number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<void>> {
    return api.delete(`${this.url}/${id}`, config);
  }
}
