import { GenericService } from "./../services/genericService";

interface NovoLeadDTO {
  nome: string;
  telefone: number;
  cpfCnpj?: string;
  observacao: string;
  empresaId: number;
  vendedorId?: number;
}

class NovoLeadService extends GenericService {
  private readonly url = "/Mobile/CriarNovoLead";

  salvar(data: NovoLeadDTO) {
    return this.postFiltro(this.url, data);
  }
}

export const novoLeadService = new NovoLeadService();
