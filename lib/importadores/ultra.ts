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

  // Excel number
  if (typeof valor === "number") {
    const excelDate = XLSX.SSF.parse_date_code(valor);

    if (!excelDate) return null;

    return `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
  }

  // DD/MM/YYYY
  const partes = String(valor).split("/");

  if (partes.length !== 3) return null;

  return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
}

function normalizarFormaPagamento(tipo: string, bandeira: string) {
  const texto = `${tipo} ${bandeira}`.toLowerCase();

  if (texto.includes("visa")) return "visa";
  if (texto.includes("master")) return "mastercard";
  if (texto.includes("elo")) return "elo";
  if (texto.includes("pix")) return "pix";
  if (texto.includes("boleto")) return "boleto";

  return "outros";
}

export function importarUltra(
  dados: any[],
  tipo: "receita" | "despesa",
  academiaId: string,
) {
  return dados
    .map((item: any, index: number) => {
      // 🔥 RECEITA
      if (tipo === "receita") {
        const data =
          parseData(item["Baixa"]) ||
          parseData(item["Vencimento"]) ||
          parseData(item["Competência"]);

        if (!data) {
          console.log("❌ ULTRA SEM DATA:", item);
          return null;
        }

        const valor = parseNumero(item["Valor Real"]);

        if (!valor) {
          console.log("❌ ULTRA SEM VALOR:", item);
          return null;
        }

        const valorBruto = parseNumero(item["Valor"]);

        const descricao =
          item["Produto"] ||
          item["Conta Contábil"] ||
          item["Nome"] ||
          "Receita Ultra";

        const categoria =
          item["Conta Contábil"] || item["Grupo Contábil"] || "receita";

        const formaPagamento = normalizarFormaPagamento(
          item["Tipo"],
          item["Bandeira"],
        );

        return {
          academia_id: academiaId,

          tipo: "receita",

          data,

          valor,
          valor_bruto: valorBruto,

          taxa: valorBruto - valor,

          descricao,
          descricao_original: descricao,

          categoria,

          forma_pagamento: formaPagamento,

          status: "pago",

          sistema_origem: "ultra",

          status_cliente: "ativo",

          import_id: `ultra_${academiaId}_${tipo}_${index}`,
        };
      }

      // 🔥 DESPESA
      if (tipo === "despesa") {
        const valor = parseNumero(item["Valor Baixa"]);

        // ignora zerados / em aberto
        if (!valor || valor <= 0) {
          return null;
        }

        const data =
          parseData(item["Data Baixa"]) ||
          parseData(item["Vencimento"]) ||
          parseData(item["Competência"]) ||
          parseData(item["Lançamento"]);

        if (!data) {
          console.log("❌ ULTRA DESPESA SEM DATA:", item);
          return null;
        }

        const descricao = [item["Fornecedor"], item["Descrição"]]
          .filter(Boolean)
          .join(" - ");

        const categoria =
          item["Conta Contábil"] || item["Grupo Contábil"] || "despesa";

        return {
          academia_id: academiaId,

          tipo: "despesa",

          data,

          valor,
          valor_bruto: valor,

          taxa: 0,

          descricao,
          descricao_original: descricao,

          categoria,

          forma_pagamento: "outros",

          status: "pago",

          sistema_origem: "ultra",

          import_id: `ultra_${academiaId}_${tipo}_${index}`,
        };
      }

      return null;
    })
    .filter(Boolean);
}
