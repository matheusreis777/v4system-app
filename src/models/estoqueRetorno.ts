export interface EstoqueRetorno {
  id: number;
  placa: string;
  marcaModelo: string;
  anoFabricacao: number;
  anoModelo: number;
  diasEmEstoque: number;
  faixaSemaforo: number;
  valorInvestido: number;
  valorVenda: number;
  margemProjetada: number;
  margemPercentual: number;
  anunciadoPortais: boolean;
  statusVeiculoId: number;
  statusVeiculoNome: string;
  vendedorId?: number;
  vendedorNome?: string;
  fotoUrl?: string;
  
  // Mantemos esses para compatibilidade se necessário, mas o novo endpoint não traz tudo isso no DTO de semáforo
  tipoVeiculoDescricao?: string;
  quilometragem?: number;
  corNome?: string;
  combustivelNome?: string;
}
