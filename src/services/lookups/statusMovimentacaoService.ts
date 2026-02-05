import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface StatusMovimentacaoDto {
  id: number;
  valorTexto: string;
}

class StatusMovimentacaoService extends GenericService<
  StatusMovimentacaoDto[]
> {
  private readonly baseUrl = "/utilitario/ObterStatusMovimentacao";

  async listar(): Promise<LookupItem[]> {
    const response = await this.get(this.baseUrl);

    return response.data.map((item) => ({
      id: item.id,
      nome: item.valorTexto,
    }));
  }
}

export const statusMovimentacaoService = new StatusMovimentacaoService();
