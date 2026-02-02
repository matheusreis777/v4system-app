import { LookupItem } from "../../models/lookupItem";
import { GenericService } from "../genericService";

interface StatusMovimentacaoDto {
  id: number;
  valorTexto: string;
}

export const statusMovimentacaoService = {
  async listar(): Promise<LookupItem[]> {
    const service = new GenericService<StatusMovimentacaoDto[]>(
      "/utilitario/ObterStatusMovimentacao",
    );

    const response = await service.get();

    return response.data.map((item: any) => ({
      id: item.id,
      nome: item.valorTexto,
    }));
  },
};
