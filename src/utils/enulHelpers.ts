// utils/enumHelpers.ts
export function obterNomeEValor(enumObj: any) {
  return Object.keys(enumObj)
    .filter((k) => isNaN(Number(k)))
    .map((key) => ({
      id: enumObj[key],
      nome: key,
    }));
}
