import * as XLSX from "xlsx";

function parseNumero(v: any): number {
  if (v === null || v === undefined || v === "") {
    return 0;
  }

  // 🔥 número puro Excel
  if (typeof v === "number") {
    return v;
  }

  const numero = Number(
    String(v)
      .replace(/R\$\s?/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
      .replace("-", "0")
      .trim(),
  );

  return isNaN(numero) ? 0 : numero;
}

function parseData(dataBruta: any): string | null {
  if (!dataBruta) return null;

  // 🔥 DATA SERIAL EXCEL
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

function normalizarTipoVenda(tipo: string) {
  const texto = String(tipo || "").toLowerCase();

  return {
    novo_aluno: texto.includes("novo"),

    renovacao: texto.includes("renov"),

    retorno: texto.includes("retorno"),

    recorrencia: texto.includes("renov"),
  };
}

function extrairPlano(item: string) {
  const texto = String(item || "").toLowerCase();

  let tipo_plano = "";

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

  return {
    tipo_plano,
  };
}

export function importarComercialTecnofit(dados: any[], academiaId: string) {
  return dados
    .map((item) => {
      const valorFinal = parseNumero(item["Valor Final"]);

      console.log("🔥 VALOR FINAL:", item["Valor Final"], valorFinal);

      if (
        valorFinal === null ||
        valorFinal === undefined ||
        isNaN(valorFinal)
      ) {
        return null;
      }

      const tipoVenda = String(item["Tipo de Venda"] || "");

      const flags = normalizarTipoVenda(tipoVenda);

      const plano = extrairPlano(item["Itens"] || "");

      const dataVenda = parseData(item["Data Venda"]);

      if (!dataVenda) return null;

      const registro = {
        academia_id: academiaId,

        sistema_origem: "tecnofit",

        aluno_nome: item["Cliente"] || null,

        data_venda: dataVenda,

        tipo_venda: tipoVenda,

        plano: item["Itens"] || null,

        tipo_plano: plano.tipo_plano,

        valor: parseNumero(item["Valor Venda"]),

        desconto: parseNumero(item["Desconto Venda"]),

        valor_final: valorFinal,

        valor_quitado: parseNumero(item["Valor Quitado/Recibo"]),

        vendedor: item["Vendedor"] || null,

        origem_venda: item["Origem"] || null,

        recorrencia: flags.recorrencia,

        renovacao: flags.renovacao,

        retorno: flags.retorno,

        novo_aluno: flags.novo_aluno,
      };

      console.log("🔥 COMERCIAL NORMALIZADO:", registro);

      return registro;
    })
    .filter(Boolean);
}
