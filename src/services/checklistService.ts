import { GenericService } from "./genericService";

class ChecklistService extends GenericService<any> {
  private readonly url = "/Mobile/Checklist";

  async listaChecklistAvaliacao(id: number): Promise<any> {
    const response = await this.get(`${this.url}/Avaliacao/${id}`);

    return response.data;
  }
}

export const checklistService = new ChecklistService();
