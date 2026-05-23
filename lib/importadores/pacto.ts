import * as XLSX from "xlsx";

function parseNumero(v: any): number {
  if (!v) return 0;

  if (typeof v === "number") return v;

  return Number(
    String(v)
      .replace(/R\$\s?/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim(),
  );
}

function parseData(valor: any) {
  if (!valor) return null;

  // Excel Number
  if (typeof valor === "number") {
    const excelDate = XLSX.SSF.parse_date_code(valor);

    if (!excelDate) return null;

    return `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
  }

  // DD/MM/YYYY
  const texto = String(valor).split(" ")[0];

  const partes = texto.split("/");

  if (partes.length !== 3) return null;

  const ano = partes[2].length === 2 ? `20${partes[2]}` : partes[2];

  return `${ano}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
}

function normalizarFormaPagamento(texto: string) {
  const t = String(texto || "").toLowerCase();

  if (t.includes("pix")) return "pix";
  if (t.includes("boleto")) return "boleto";
  if (t.includes("credito")) return "cartao_credito";
  if (t.includes("debito")) return "cartao_debito";
  if (t.includes("dinheiro")) return "dinheiro";

  return "outros";
}

export function importarPacto(
  dados: any[],
  tipo: "receita" | "despesa",
  academiaId: string,
) {
  return dados
    .map((item: any, index: number) => {
      // 🔥 RECEITA
      if (tipo === "receita") {
        const valor = parseNumero(item["Valor"]);

        if (!valor || valor <= 0) {
          return null;
        }

        const data =
          parseData(item["Dt.Pagamento"]) || parseData(item["Dt.Vencimento"]);

        if (!data) {
          console.log("❌ PACTO SEM DATA:", item);
          return null;
        }

        const descricao = item["Nome"] || item["Plano"] || "Receita Pacto";

        const categoria = item["Plano"] || item["Modalidades"] || "receita";

        const statusCliente = item["Situação"] || "ativo";

        return {
          academia_id: academiaId,

          tipo: "receita",

          data,

          valor,
          valor_bruto: valor,

          taxa: 0,

          descricao,
          descricao_original: descricao,

          categoria,

          forma_pagamento: normalizarFormaPagamento(item["Forma"]),

          status: "pago",

          sistema_origem: "pacto",

          status_cliente: statusCliente,

          import_id: `pacto_${academiaId}_${tipo}_${index}`,
        };
      }

      return null;
    })
    .filter(Boolean);
}
