import { GenericService } from "./../services/genericService";

interface PushTokenDto {
  usuarioId: number;
  pushToken: string;
  plataforma: string;
}

class PushService extends GenericService {
  private readonly url = "/Mobile/registrar-device";

  salvar(data: PushTokenDto) {
    return this.postFiltro(this.url, data);
  }
}

export const pushService = new PushService();
