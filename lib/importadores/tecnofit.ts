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

function parseData(dataBruta: any): string | null {
  if (!dataBruta) return null;

  // 🔥 DATA EXCEL
  if (typeof dataBruta === "number") {
    const excelDate = XLSX.SSF.parse_date_code(dataBruta);

    if (!excelDate) return null;

    return `${excelDate.y}-${String(excelDate.m).padStart(2, "0")}-${String(excelDate.d).padStart(2, "0")}`;
  }

  // 🔥 DATA STRING
  const partes = String(dataBruta).split("/");

  if (partes.length !== 3) return null;

  return `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
}

function normalizarFormaPagamento(forma: string): string {
  const texto = String(forma || "").toLowerCase();

  if (texto.includes("pix")) {
    return "pix";
  }

  if (texto.includes("crédito")) {
    return "cartao_credito";
  }

  if (texto.includes("debito")) {
    return "cartao_debito";
  }

  if (texto.includes("boleto")) {
    return "boleto";
  }

  if (texto.includes("dinheiro")) {
    return "dinheiro";
  }

  return "outros";
}

function extrairPlano(item: string) {
  const texto = String(item || "").toLowerCase();

  let tipo_plano = "";
  let frequencia_plano = "";

  if (texto.includes("mensal")) {
    tipo_plano = "mensal";
  }

  if (texto.includes("trimestral")) {
    tipo_plano = "trimestral";
  }

  if (texto.includes("semestral")) {
    tipo_plano = "semestral";
  }

  if (texto.includes("anual")) {
    tipo_plano = "anual";
  }

  if (texto.includes("2x")) {
    frequencia_plano = "2x_semana";
  }

  if (texto.includes("3x")) {
    frequencia_plano = "3x_semana";
  }

  return {
    tipo_plano,
    frequencia_plano,
  };
}

export function importarTecnofit(
  dados: any[],
  tipo: "receita" | "despesa",
  academiaId: string,
) {
  return dados
    .map((item) => {
      const valor =
        tipo === "receita"
          ? parseNumero(item["Valor Líquido"])
          : parseNumero(item["Valor Pago"] || item["Valor"]);

      if (!valor) return null;

      const descricao =
        item["Item"] || item["Descrição"] || item["Cliente"] || "";

      const valor_bruto =
        tipo === "receita" ? parseNumero(item["Valor Bruto"]) : 0;

      const taxa = tipo === "receita" ? parseNumero(item["Valor Taxa"]) : 0;

      const forma_original = item["Forma"] || "";

      const forma_pagamento = normalizarFormaPagamento(forma_original);

      const status_original = item["Status do cliente"] || "";

      const status_cliente = String(status_original).toLowerCase();

      // 🔥 REGIME CAIXA OFICIAL DO GYM

      let data = null;

      if (tipo === "receita") {
        // 🔥 RECEITA = DINHEIRO CREDITADO
        data = parseData(item["Data Crédito"]);
      } else {
        // 🔥 DESPESA = DINHEIRO PAGO

        if (!item["Data Pagamento"]) {
          return null;
        }

        data = parseData(item["Data Pagamento"]);
      }

      if (!data) return null;

      const plano = extrairPlano(descricao);

      console.log("🔥 ITEM NORMALIZADO:", {
        academia_id: academiaId,
        tipo,
        data,
        valor,
        forma_pagamento,
        sistema_origem: "tecnofit",
        tipo_plano: plano.tipo_plano,
        frequencia_plano: plano.frequencia_plano,
      });

      return {
        academia_id: academiaId,

        tipo,
        data,

        valor,
        valor_bruto,
        taxa,

        descricao,
        descricao_original: descricao,

        categoria:
          tipo === "receita" ? "receita" : item["Categoria"] || "despesa",

        status: "pago",

        status_cliente,
        status_original,

        forma_pagamento,
        forma_original,

        sistema_origem: "tecnofit",

        tipo_plano: plano.tipo_plano,
        frequencia_plano: plano.frequencia_plano,

       import_id: JSON.stringify(item),
      };
    })
    .filter(Boolean);
}
