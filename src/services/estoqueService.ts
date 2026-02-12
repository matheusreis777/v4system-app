import { GenericService } from "./genericService";
import { ResultadoConsulta } from "../models/resultadoConsulta";
import { EstoqueFiltro } from "../models/estoqueFiltro";
import { EstoqueRetorno } from "../models/estoqueRetorno";

class EstoqueService extends GenericService<ResultadoConsulta<EstoqueRetorno>> {
  private readonly url = "/Mobile/ObterEstoque";

  consultar(filtro: EstoqueFiltro) {
    return this.get(this.url, undefined, filtro);
  }
}

export const estoqueService = new EstoqueService();
