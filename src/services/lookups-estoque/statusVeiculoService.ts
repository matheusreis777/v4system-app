import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface StatusVeiculoDto {
  id: number;
  valorTexto: string;
}

class StatusVeiculoService extends GenericService<StatusVeiculoDto[]> {
  private readonly baseUrl = "/utilitario/ObterStatusVeiculos";

  async listar(): Promise<LookupItem[]> {
    const response = await this.get(this.baseUrl);

    return response.data.map((item) => ({
      id: item.id,
      nome: item.valorTexto,
    }));
  }
}

export const statusVeiculoService = new StatusVeiculoService();
