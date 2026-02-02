import { LookupItem } from "../../models/lookupItem";
import { GenericService } from "../genericService";

interface VendedorSelecaoDto {
  id: number;
  nome: string;
}

interface ResultadoConsulta<T> {
  lista: T[];
}

export const vendedorService = {
  async listar(): Promise<LookupItem[]> {
    const service = new GenericService<ResultadoConsulta<VendedorSelecaoDto>>(
      "/vendedor",
    );

    const response = await service.get();

    return (response.data?.lista ?? []).map((v) => ({
      id: v.id,
      nome: v.nome,
    }));
  },
};
