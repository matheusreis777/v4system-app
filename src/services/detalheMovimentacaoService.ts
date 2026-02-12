import { GenericService } from "./genericService";
import { ResultadoConsulta } from "../models/resultadoConsulta";
import { EstoqueRetorno } from "../models/estoqueRetorno";
import { LookupItem } from "../models/lookupItem";

interface DetalheMovimentacaoDto {
  id: number;
  dataInicial: Date;
  ultimaAlteracao: Date;
  momentoMovimentacao: string;
  statusMovimentacao: string;
  nomeLead: string;
  telefoneLead: string;
  tipoNegociacao: string;
  midiaAtracao: string;
  fluxo: string;
  dataAgendamento: Date;
  veiculos: string[];
  cliente: string;
  terceiros: string[];
  historicoMovimentacao: string[];
}

class DetalheMovimentacaoService extends GenericService<
  DetalheMovimentacaoDto[]
> {
  private readonly url = "/Mobile/ObterDadosMovimentacao";

  async listar(id: number): Promise<LookupItem[]> {
    const response = await this.get(`${this.url}/${id}`);

    return response.data.map((item) => ({
      id: item.id,
      dataInicial: item.dataInicial,
      ultimaAlteracao: item.ultimaAlteracao,
      momentoMovimentacao: item.momentoMovimentacao,
      statusMovimentacao: item.statusMovimentacao,
      nome: item.nomeLead,
      telefone: item.telefoneLead,
      tipoNegociacao: item.tipoNegociacao,
      midiaAtracao: item.midiaAtracao,
      fluxo: item.fluxo,
      dataAgendamento: item.dataAgendamento,
      veiculos: item.veiculos,
      cliente: item.cliente,
      terceiros: item.terceiros,
      historicoMovimentacao: item.historicoMovimentacao,
    }));
  }
}

export const detalheMovimentacaoService = new DetalheMovimentacaoService();
