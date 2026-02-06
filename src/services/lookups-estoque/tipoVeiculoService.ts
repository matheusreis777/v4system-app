import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface TipoVeiculoDto {
  id: number;
  descricao: string;
}

class TipoVeiculoService extends GenericService<TipoVeiculoDto[]> {
  private readonly baseUrl = "/utilitario/ObterTipoVeiculos";

  async listar(): Promise<LookupItem[]> {
    const response = await this.get(this.baseUrl);

    return response.data.map((item) => ({
      id: item.id,
      nome: item.descricao,
    }));
  }
}

export const tipoVeiculoService = new TipoVeiculoService();
