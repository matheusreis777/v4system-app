export enum MomentoEnum {
  Prospectar = 1,
  NegociacaoRecepcionar = 2,
  NegociacaoQualificar = 3,
  NegociacaoFechamento = 4,
  PreparacaoEntregaVeiculo = 5,
  PreVenda = 7,
  NegociacaoOrcamento = 8,
}

export enum StatusMovimentacaoEnum {
  EmAndamento = 170,
  Finalizada = 171,
  Cancelada = 172,
  PreVenda = 359,
  Agendada = 414,
}

export enum TipoNegociacaoEnum {
  Venda = 1,
  Compra = 2,
  Consignacao = 3,
  Financiamento = 4,
  Consorcio = 5,
  Servico = 6,
}
