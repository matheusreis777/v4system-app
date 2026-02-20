import { GenericService } from "./../services/genericService";

export interface NotificacaoDto {
  id: number;
  usuarioId: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  referencia: string;
  lida: boolean;
  dataCriacao: string;
  empresaId: number;
}

class NotificacaoService extends GenericService {
  private readonly url = "/Mobile/";

  obter(usuarioId: number, empresaId: number) {
    return this.postFiltro(
      `${this.url}ObterNotificacoes/${usuarioId}/${empresaId}`,
      null,
    );
  }

  marcarComoLida(id: number) {
    return this.postFiltro(`${this.url}MarcarNotificacaoComoLida/${id}`, null);
  }

  obterQuantidadeNotificacoesNaoLidas(usuarioId: number, empresaId: number) {
    return this.postFiltro(
      `${this.url}ObterQuantidadeNotificacoesNaoLidas/${usuarioId}/${empresaId}`,
      null,
    );
  }
}

export const notificacaoService = new NotificacaoService();
