import {
  MomentoEnum,
  StatusMovimentacaoEnum,
  TipoNegociacaoEnum,
} from "../enums/movimentacao.enums";

/* ================= MOMENTO ================= */

export function obterLabelMomento(momentoId?: number): string {
  switch (momentoId) {
    case MomentoEnum.Prospectar:
      return "Prospectar";
    case MomentoEnum.NegociacaoRecepcionar:
      return "Recepcionar";
    case MomentoEnum.NegociacaoQualificar:
      return "Qualificar";
    case MomentoEnum.NegociacaoFechamento:
      return "Fechamento";
    case MomentoEnum.PreparacaoEntregaVeiculo:
      return "Preparação e Entrega";
    case MomentoEnum.PreVenda:
      return "Pré-venda";
    case MomentoEnum.NegociacaoOrcamento:
      return "Orçamento";
    default:
      return "";
  }
}

/* ================= STATUS ================= */

export function obterLabelStatus(statusId?: number): string {
  switch (statusId) {
    case StatusMovimentacaoEnum.EmAndamento:
      return "Em andamento";
    case StatusMovimentacaoEnum.Finalizada:
      return "Finalizada";
    case StatusMovimentacaoEnum.Cancelada:
      return "Cancelada";
    case StatusMovimentacaoEnum.PreVenda:
      return "Pré-venda";
    case StatusMovimentacaoEnum.Agendada:
      return "Agendada";
    default:
      return "";
  }
}

export function obterLabelTipoNegociacao(tipoId?: number): string {
  switch (tipoId) {
    case TipoNegociacaoEnum.Venda:
      return "Venda";
    case TipoNegociacaoEnum.Compra:
      return "Compra";
    case TipoNegociacaoEnum.Consignacao:
      return "Consignação";
    case TipoNegociacaoEnum.Financiamento:
      return "Financiamento";
    case TipoNegociacaoEnum.Consorcio:
      return "Consórcio";
    case TipoNegociacaoEnum.Servico:
      return "Serviço";
    default:
      return "";
  }
}
