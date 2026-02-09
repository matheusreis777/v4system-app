import { Double } from "react-native/Libraries/Types/CodegenTypes";

export interface VeiculoResumoGeral {
  id: number;
  veiculoId: number;
  margemFixa: boolean;
  margemPercentual: boolean;
  indiciMargem: Double;
  valorVenda: Double;
  margemConsignacao: Double;
}
