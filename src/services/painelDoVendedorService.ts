import { GenericService } from "./genericService";
import { PainelDoVendedorFiltro } from "../models/PainelDoVendedorFiltro";
import { ResultadoConsulta } from "../models/ResultadoConsulta";
import { PainelDoVendedorDto } from "../models/PainelDoVendedorDto";

class PainelDoVendedorService extends GenericService<
  ResultadoConsulta<PainelDoVendedorDto>
> {
  constructor() {
    super("/PainelDoVendedor");
  }

  async consultar(filtro: PainelDoVendedorFiltro) {
    return this.get(undefined, {
      params: filtro, // 🔥 QUERY STRING
    });
  }
}

export const painelDoVendedorService = new PainelDoVendedorService();
