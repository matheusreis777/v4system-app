import { Modelo } from "./modelo";
import { VeiculoResumoGeral } from "./veiculoResumoGeral";

export interface EstoqueRetorno {
  id: number;
  placa: string;
  renavan: string;
  chassi: string;
  tipoVeiculoId: number;
  tipoVeiculoDescricao: string;
  marcaId: number;
  modeloId: number;
  anoFabricacao: number;
  anoModelo: number;
  corId: number;
  corNome: string;
  cambioId: number;
  cambioNome: string;
  combustivelId: number;
  combustivelNome: string;
  statusVeiculoId: number;
  statusVeiculoNome: string;
  quilometragem: number;
  valorVenda?: number;

  modelo: Modelo;
  resumoGeral: VeiculoResumoGeral;
}
