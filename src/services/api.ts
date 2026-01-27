import axios from "axios";

export const api = axios.create({
  baseURL: "https://crm.v4system.com.br/api",
  timeout: 15000,
});
