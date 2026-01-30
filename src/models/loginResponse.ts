export interface LoginResponse {
  token: string;
  usuarioNome: string;
  usuarioPerfilDescricao: string;
  usuarioLogin: string;
  usuarioId: number;
  empresas: any[];
  telefone: string;
}
