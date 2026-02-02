export interface ResultadoConsulta<T> {
  lista: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}
