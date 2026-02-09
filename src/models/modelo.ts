import { Marca } from "./marca";

export interface Modelo {
  id: number;
  nome: string;
  marcaId: number;
  tipoVeiculoId: number;
  codigoFipe: number;

  marca: Marca;
}
