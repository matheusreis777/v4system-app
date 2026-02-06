import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface MarcaDto {
  id: number;
  nome: string;
}

class MarcaService extends GenericService<MarcaDto[]> {
  private readonly baseUrl = "/marca/ObterMarcas";

  async listar(tipoVeiculoId: number): Promise<LookupItem[]> {
    const response = await this.get(`${this.baseUrl}/${tipoVeiculoId}`);

    return response.data.map((item) => ({
      id: item.id,
      nome: item.nome,
    }));
  }
}

export const marcaService = new MarcaService();
