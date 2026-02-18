import { GenericService } from "./genericService";

class AvaliacaoService extends GenericService<any> {
  private readonly url = "/Avaliacao";

  async obterAvaliacaoPorVeiculo(
    veiculoId: number,
    empresaId: number,
  ): Promise<any> {
    const response = await this.get(
      `${this.url}/ObterAvaliacaoPorVeiculo/${veiculoId}/${empresaId}`,
    );

    return response.data;
  }
}

export const avaliacaoService = new AvaliacaoService();
