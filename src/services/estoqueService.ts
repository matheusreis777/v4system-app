import { GenericService } from "./genericService";
import { ResultadoConsulta } from "../models/ResultadoConsulta";
import { EstoqueFiltro } from "../models/EstoqueFiltro";
import { EstoqueRetorno } from "../models/estoqueRetorno";

class EstoqueService extends GenericService<ResultadoConsulta<EstoqueRetorno>> {
  private readonly url = "/Mobile/ObterEstoque";

  consultar(filtro: EstoqueFiltro) {
    return this.get(this.url, undefined, filtro);
  }
}

export const estoqueService = new EstoqueService();
