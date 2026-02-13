import { GenericService } from "./genericService";

class AprovacoesMovimentacaoService extends GenericService<any> {
  private readonly url = "/Mobile/AprovarMovimentacao";

  async aprovarGestor(id: number): Promise<void> {
    const response = await this.postFiltro(`${this.url}Gestor/${id}`, null);

    return response.data;
  }

  async aprovarFinanceiro(id: number): Promise<void> {
    const response = await this.postFiltro(`${this.url}Financeiro/${id}`, null);

    return response.data;
  }
}

export const aprovacoesMovimentacaoService =
  new AprovacoesMovimentacaoService();
