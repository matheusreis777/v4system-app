import { GenericService } from "./genericService";
import { ResultadoConsulta } from "../models/resultadoConsulta";

interface QuestionarioPorEmpresa {
  id: number;
  nome: string;
  codigo: number;
}

class QuestionarioService extends GenericService {
  private readonly url = "/Questionario";

  async listaQuestionario(
    codigo: number,
    empresaId: number,
  ): Promise<QuestionarioPorEmpresa[]> {
    const response = await this.get(`${this.url}/PorEmpresa`, undefined, {
      codigo,
      empresaId,
    });

    const resultado: ResultadoConsulta<QuestionarioPorEmpresa> = response.data;

    return resultado.lista ?? [];
  }

  async listaQuestionarioDinamico(
    codigo: number,
    empresaId: number,
  ): Promise<QuestionarioPorEmpresa[]> {
    const response = await this.get(
      `${this.url}/ObterQuestionarioPorEmpresa`,
      undefined,
      {
        codigo,
        empresaId,
      },
    );

    const resultado: ResultadoConsulta<QuestionarioPorEmpresa> = response.data;

    return resultado.lista ?? [];
  }
}

export const questionarioService = new QuestionarioService();
