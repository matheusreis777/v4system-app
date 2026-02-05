export interface PainelDoVendedorFiltro {
  MomentoId?: number;
  TipoNegociacaoId?: number;
  TipoQualificacaoId?: number;
  StatusMovimentacaoId?: number;

  VendedorId?: number; // backend espera LISTA
  Placa?: string;
  Telefone?: string;
  Nome?: string;

  DataInicial?: string; // ISO string
  DataFinal?: string;
  DataInicialAgendamento?: string;
  DataFinalAgendamento?: string;

  Pagina?: number;
  TamanhoDaPagina?: number;
  OrdenarPor?: string;
  Ordem?: "ASC" | "DESC";
  EmpresaId: number;
}
