import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface ModeloDto {
  id: number;
  nome: string;
  marcaId: number;
}

class ModeloService extends GenericService<ModeloDto[]> {
  private readonly baseUrl = "/marca/ObterModelos";

  async listar(marcaId: number, tipoVeiculoId: number): Promise<LookupItem[]> {
    const response = await this.get(
      `${this.baseUrl}/${marcaId}/${tipoVeiculoId}`,
    );

    return response.data.map((item) => ({
      id: item.id,
      nome: item.nome,
    }));
  }
}

export const modeloService = new ModeloService();
