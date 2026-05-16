import * as XLSX from "xlsx";

function parseNumero(v: any) {

  if (v === null || v === undefined || v === "") {
    return 0;
  }

  return Number(
    String(v)
      .replace(/R\$\s?/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
}

function parseData(valor: any) {

  if (!valor) return null;

  // 🔥 Excel number
  if (typeof valor === "number") {

    const excelDate = XLSX.SSF.parse_date_code(valor);

    if (!excelDate) return null;

    return `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
  }

  // 🔥 DD/MM/YYYY
  const partes = String(valor).split("/");

  if (partes.length !== 3) return null;

  return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
}

function normalizarFormaPagamento(info: string) {

  const texto = String(info || "").toLowerCase();

  if (texto.includes("visa")) return "visa";
  if (texto.includes("master")) return "mastercard";
  if (texto.includes("elo")) return "elo";
  if (texto.includes("pix")) return "pix";
  if (texto.includes("dinheiro")) return "dinheiro";

  return "outros";
}

export function importarEvo(
  dados: any[],
  tipo: "receita" | "despesa",
  academiaId: string
) {

  return dados
    .map((item: any) => {

      // ================= RECEITA =================

      if (tipo === "receita") {

        const data = parseData(item["Data de recebimento"]);

        if (!data) return null;

        const valor = parseNumero(item["Valor baixa"]);

        if (!valor) return null;

        const valorBruto = parseNumero(item["Valor"]);

        const descricao =
          item["Nome"] ||
          item["Descrição"] ||
          "Receita EVO";

        const categoria =
          item["Centro de receita"] || "receita";

        const formaPagamento =
          normalizarFormaPagamento(item["Informações"]);

        const status = "pago";

        return {

          academia_id: academiaId,

          data,

          tipo: "receita",

          descricao,

          categoria,

          valor,

          valor_bruto: valorBruto,

          taxa: valorBruto - valor,

          origem: "evo",

          sistema_origem: "evo",

          forma_pagamento: formaPagamento,

          descricao_original:
            item["Descrição"] || "",

          status,

          import_id: JSON.stringify(item)
        };
      }

      // ================= DESPESA =================

      const data = parseData(item["Pagamento"]);

      if (!data) return null;

      const valor = parseNumero(item["Valor baixa"]);

      if (!valor) return null;

      const valorBruto = parseNumero(item["Valor"]);

      const descricao =
        item["Descrição"] ||
        item["Favorecido"] ||
        "Despesa EVO";

      const categoria =
        item["Centro de custo"] || "despesa";

      const status =
        String(item["Status"] || "").toLowerCase();

      return {

        academia_id: academiaId,

        data,

        tipo: "despesa",

        descricao,

        categoria,

        valor,

        valor_bruto: valorBruto,

        taxa: 0,

        origem: "evo",

        sistema_origem: "evo",

        forma_pagamento: "despesa",

        descricao_original:
          item["Descrição"] || "",

        status,

        import_id: JSON.stringify(item)
      };
    })
    .filter(Boolean);
}