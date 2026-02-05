import { GenericService } from "./genericService";
import { PainelDoVendedorFiltro } from "../models/PainelDoVendedorFiltro";
import { ResultadoConsulta } from "../models/ResultadoConsulta";
import { PainelDoVendedorDto } from "../models/PainelDoVendedorDto";

class PainelDoVendedorService extends GenericService<
  ResultadoConsulta<PainelDoVendedorDto>
> {
  private readonly url = "/PainelDoVendedor";

  consultar(filtro: PainelDoVendedorFiltro) {
    return this.get(this.url, undefined, {
      params: filtro,
    });
  }
}

export const painelDoVendedorService = new PainelDoVendedorService();
