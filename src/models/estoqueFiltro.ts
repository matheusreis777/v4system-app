export interface EstoqueFiltro {
  EmpresaId: number;
  Placa: string;
  TipoVeiculoId: number;
  MarcaId: number;
  ModeloId: number;
  StatusVeiculoId: number;

  Pagina?: number;
  TamanhoDaPagina?: number;
  OrdenarPor?: string;
  Ordem?: "ASC" | "DESC";
}
