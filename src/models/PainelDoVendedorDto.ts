export interface PainelDoVendedorDto {
  movimentacaoId: number;
  momentoId: number;
  tipoNegociacaoId: number;
  clienteId: number;
  clienteNome: string;
  telefone: number;
  ultimaObservacaoNaMovimentacao: string;
  statusMovimentacaoId: number;
  justificativaCancelamento?: string;
  vendedorId?: number;
  vendedorNome?: string;
  veiculoVinculado: boolean;
  dataAgendamento?: string;
  dataInclusao: string;
  tipoQualificacaoId: number;
}
