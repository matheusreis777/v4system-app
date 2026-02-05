// services/lookups/momentoMovimentacaoService.ts
import { LookupItem } from "../../models/lookupItem";
import { MomentoStringEnum } from "./../../utils/enums/MomentoStringEnum";
import { obterNomeEValor } from "./../../utils/enulHelpers";

export const momentoMovimentacaoService = {
  async listar(): Promise<LookupItem[]> {
    return obterNomeEValor(MomentoStringEnum);
  },
};
