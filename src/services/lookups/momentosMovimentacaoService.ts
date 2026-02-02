import { LookupItem } from "../../models/lookupItem";
import { GenericService } from "../genericService";

interface TabelaValorDto {
  id: number;
  nome: string;
}

export const momentoMovimentacaoService = {
  async listar(): Promise<LookupItem[]> {
    const service = new GenericService<TabelaValorDto[]>(
      "/utilitario/ObterMomentos",
    );

    const response = await service.get();

    return response.data.map((item) => ({
      id: item.id,
      nome: item.nome, // ✅ CORRETO
    }));
  },
};
