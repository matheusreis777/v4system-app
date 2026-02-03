export function obterCorMomento(momentoId?: number): string {
  switch (momentoId) {
    case 1: // Recepcionar
      return "#60A5FA"; // azul claro
    case 3: // Qualificar
      return "#FACC15"; // amarelo
    case 4: // Fechamento
      return "#2563EB"; // azul mais escuro
    case 5: // Preparação e Entrega
      return "#EF4444"; // vermelho
    case 7: // Pré-venda
      return "#9CA3AF"; // cinza
    default:
      return "#CBD5E1"; // neutro
  }
}

export function obterCorNegociacao(tipoId?: number): string {
  switch (tipoId) {
    case 1: // Venda
      return "#38BDF8"; // azul diferente do momento
    case 2: // Compra
      return "#22C55E"; // verde
    case 3: // Consignação
      return "#F59E0B"; // amarelo diferente
    case 4: // Financiamento
      return "#0EA5E9"; // azul alternativo
    default:
      return "#CBD5E1";
  }
}

export function obterCorVendedor(): string {
  return "#7C3AED"; // roxo fixo
}
