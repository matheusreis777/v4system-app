export function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function maskCPF(value: string) {
  return onlyNumbers(value)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

export function maskPhone(value: string) {
  return onlyNumbers(value)
    .replace(/(\d{2})(\d)/, "($1)$2")
    .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3")
    .slice(0, 14);
}

export function maskCEP(value: string) {
  return onlyNumbers(value)
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}

export function maskPlate(value: string) {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (cleaned.length <= 7) {
    return cleaned.replace(/^([A-Z]{3})(\d)/, "$1-$2");
  }

  return cleaned.slice(0, 7);
}

export function maskBRL(value: string) {
  const numbers = onlyNumbers(value);

  const float = Number(numbers) / 100;

  return float.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
