import axios from "axios";
import { API_URL } from "../config";

export const api = axios.create({
  baseURL: API_URL,
  paramsSerializer: {
    indexes: null // Isto remove os colchetes [] dos arrays na query string (ex: StatusMovimentacaoId=170&StatusMovimentacaoId=171)
  }
});
