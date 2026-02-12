export interface ClienteFiltro {
  id: number;
  EmpresaId: number;
  Nome: string;
  Email: string;
  CpfCnpj: string;
  Telefone: string;

  Pagina?: number;
  TamanhoDaPagina?: number;
  OrdenarPor?: string;
  Ordem?: "ASC" | "DESC";
}
