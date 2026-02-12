import { GenericService } from "./genericService";
import { ResultadoConsulta } from "../models/resultadoConsulta";
import { ClienteFiltro } from "../models/clienteFiltro";

class ClienteService extends GenericService<ResultadoConsulta<ClienteFiltro>> {
  private readonly url = "/pessoa";

  consultar(filtro: ClienteFiltro) {
    return this.get(this.url, undefined, filtro);
  }
}

export const clienteService = new ClienteService();
