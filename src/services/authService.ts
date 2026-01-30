import { api } from "./api";
import { LoginModel } from "../models/login";

export async function login(data: LoginModel) {
  return api.post("login", data);
}

export async function validaTelefone(telefone: number, cpf: string) {
  return api.post("login/ValidarTelefoneLogin/" + telefone + "/" + cpf);
}

export async function trocarSenha(data: LoginModel) {
  return api.post("login/TrocarSenha", data);
}
