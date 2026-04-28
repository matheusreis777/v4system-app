import { GenericService } from "./genericService";

class DashboardService extends GenericService {
  private getDatasMesAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = agora.getMonth();
    
    // Formato YYYY-MM-DD para melhor compatibilidade com .NET
    const dIni = new Date(ano, mes, 1);
    const dFim = new Date(ano, mes + 1, 0);
    
    const format = (d: Date) => d.toISOString().split('T')[0];
    
    return { dataInicial: format(dIni), dataFinal: format(dFim) };
  }

  async obterDashboardVeiculos(empresaId: number) {
    const { dataInicial, dataFinal } = this.getDatasMesAtual();
    return this.get("/DashboardVeiculo", undefined, { 
      EmpresaId: empresaId,
      DataInicial: dataInicial,
      DataFinal: dataFinal 
    });
  }

  async obterDashboardVendas(empresaId: number) {
    const { dataInicial, dataFinal } = this.getDatasMesAtual();
    
    return this.get("/PainelDoVendedor", undefined, { 
      EmpresaId: empresaId,
      DataInicial: dataInicial,
      DataFinal: dataFinal,
      TamanhoDaPagina: 200, // Aumentamos o sample para os cálculos de KPI no mobile
      StatusMovimentacaoId: [170, 171, 172, 414]
    });
  }

  async obterVendedores(empresaId: number) {
    return this.get("/DashboardVeiculo/estoque/vendedores", undefined, { EmpresaId: empresaId });
  }
}

export const dashboardService = new DashboardService();
