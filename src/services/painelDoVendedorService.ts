import { GenericService } from "./genericService";
import { PainelDoVendedor } from "../models/painelDoVendedor";
import { ResultadoConsulta } from "../models/resultadoConsulta";
import { PainelDoVendedorFiltro } from "../models/painelDoVendedorFiltro";

class PainelDoVendedorService extends GenericService<
  ResultadoConsulta<PainelDoVendedor>
> {
  private readonly url = "/PainelDoVendedor";

  consultar(filtro: PainelDoVendedorFiltro) {
    return this.get(this.url, undefined, filtro);
  }
}

export const painelDoVendedorService = new PainelDoVendedorService();
