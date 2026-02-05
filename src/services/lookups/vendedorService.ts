import { GenericService } from "../genericService";
import { LookupItem } from "../../models/lookupItem";

interface VendedorSelecaoDto {
  id: number;
  nome: string;
}

interface ResultadoConsulta<T> {
  lista: T[];
}

class VendedorService extends GenericService<
  ResultadoConsulta<VendedorSelecaoDto>
> {
  private readonly baseUrl = "/vendedor";

  async listar(): Promise<LookupItem[]> {
    const response = await this.get(this.baseUrl);

    return (response.data?.lista ?? []).map((v) => ({
      id: v.id,
      nome: v.nome,
    }));
  }
}

export const vendedorService = new VendedorService();
