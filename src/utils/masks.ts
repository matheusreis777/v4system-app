export function onlyNumbers(value?: string | number | null) {
  if (value === null || value === undefined) return "";

  return String(value).replace(/\D/g, "");
}

/* CPF */
export function maskCPF(value: string) {
  return onlyNumbers(value)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

/* TELEFONE (fixo e celular) */
export function maskPhone(value?: string | number | null) {
  const v = onlyNumbers(value);

  if (!v) return "";

  if (v.length === 11) {
    return `(${v.slice(0, 2)}) ${v.slice(2, 3)} ${v.slice(3, 7)}-${v.slice(7)}`;
  }

  if (v.length === 10) {
    return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
  }

  return v;
}

/* CEP */
export function maskCEP(value: string) {
  return onlyNumbers(value)
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}

/* PLACA */
export function maskPlate(value: string) {
  const cleaned = value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);

  if (cleaned.length <= 3) return cleaned;

  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
}

/* MOEDA */
export function maskBRL(value: string) {
  const numbers = onlyNumbers(value);
  const float = Number(numbers) / 100;

  return float.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/* DATA */
export function maskData(data?: string | null) {
  if (!data) return "";

  const d = new Date(data);
  if (isNaN(d.getTime())) return data;

  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();

  const hora = String(d.getHours()).padStart(2, "0");
  const minuto = String(d.getMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}
