import { GenericService } from "./genericService";
import { CancelamentoMovimentacaoFiltro } from "../models/cancelamentoMovimentacaoFiltro";

class MovimentacaoService extends GenericService<any> {
  private readonly baseUrl = "/Movimentacao";

  // 🔒 fila de cancelamento (escopo do módulo)
  private cancelarPromise: Promise<any> = Promise.resolve();

  cancelar(data: CancelamentoMovimentacaoFiltro) {
    const url = `${this.baseUrl}/Cancelar`;

    // 🔑 garante 1 requisição por vez
    this.cancelarPromise = this.cancelarPromise.then(() =>
      this.postFiltro(url, data),
    );

    return this.cancelarPromise;
  }
}

export const movimentacaoService = new MovimentacaoService();
