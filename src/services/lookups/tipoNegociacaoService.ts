import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface TabelaValorDto {
  id: number;
  nome: string;
}

class TipoNegociacaoService extends GenericService<TabelaValorDto[]> {
  private readonly baseUrl = "/utilitario/ObterTipoNegociacaoAtivos";

  async listar(): Promise<LookupItem[]> {
    const response = await this.get(this.baseUrl);

    return response.data.map((item) => ({
      id: item.id,
      nome: item.nome,
    }));
  }
}

export const tipoNegociacaoService = new TipoNegociacaoService();
