import { LookupItem } from "../../models/lookupItem";
import { GenericService } from "../genericService";

interface TabelaValorDto {
  id: number;
  descricao: string;
}

export const tipoNegociacaoService = {
  async listar(): Promise<LookupItem[]> {
    const service = new GenericService<TabelaValorDto[]>(
      "/utilitario/ObterTipoNegociacao",
    );

    const response = await service.get();

    return response.data.map((item: any) => ({
      id: item.id,
      nome: item.descricao, // ✅ CORRETO
    }));
  },
};
