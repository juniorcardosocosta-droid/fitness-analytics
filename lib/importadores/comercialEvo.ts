import * as XLSX from "xlsx";

/**
 * Comercial EVO
 *
 * Fonte:
 * Cliente | Contrato | Fim | Início | Status | Tipo | Valor | Vigência
 *
 * Objetivo:
 * Transformar o relatório de contratos do EVO no mesmo modelo
 * comercial usado pelo Gym Analytics.
 */

function normalizarTexto(valor: any): string {
  return String(valor ?? "").trim();
}

function parseNumero(valor: any): number {
  if (valor === null || valor === undefined || valor === "") return 0;

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  const texto = String(valor)
    .replace(/R\$\s?/gi, "")
    .replace(/\s/g, "")
    .trim();

  if (!texto) return 0;

  // 1.234,56 -> 1234.56
  if (texto.includes(",")) {
    return Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
  }

  return Number(texto) || 0;
}

function parseData(valor: any): string | null {
  if (!valor) return null;

  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return valor.toISOString().slice(0, 10);
  }

  // Data serial do Excel
  if (typeof valor === "number" && valor > 20000) {
    const data = XLSX.SSF.parse_date_code(valor);

    if (data?.y && data?.m && data?.d) {
      return `${data.y}-${String(data.m).padStart(2, "0")}-${String(
        data.d,
      ).padStart(2, "0")}`;
    }
  }

  const texto = String(valor).trim();

  const matchBR = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (matchBR) {
    return `${matchBR[3]}-${matchBR[2]}-${matchBR[1]}`;
  }

  const matchISO = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (matchISO) {
    return `${matchISO[1]}-${matchISO[2]}-${matchISO[3]}`;
  }

  return null;
}

function normalizarCliente(valor: any) {
  const original = normalizarTexto(valor);

  // Ex.: "3410 - EDUARDO DIAS AQUINO"
  const match = original.match(/^\s*(\d+)\s*-\s*(.+)$/);

  if (match) {
    return {
      codigo: match[1],
      nome: match[2].trim(),
    };
  }

  return {
    codigo: null,
    nome: original || null,
  };
}

function classificarTipoPlano(tipo: string): string {
  const texto = tipo.toLowerCase();

  if (texto.includes("dia")) return "dias";
  if (texto.includes("mes")) return "meses";

  return texto || "meses";
}

function identificarTipoPlano(contrato: string): string {
  const texto = contrato.toLowerCase();

  if (texto.includes("mensal")) return "mensal";
  if (texto.includes("trimestral")) return "trimestral";
  if (texto.includes("semestral")) return "semestral";
  if (texto.includes("anual")) return "anual";
  if (texto.includes("recorrente")) return "recorrente";

  return "";
}

function calcularFlags(
  registros: any[],
  indice: number,
  cliente: string,
  inicio: string,
) {
  const anteriores = registros
    .map((item, i) => ({ item, i }))
    .filter(({ item, i }) => {
      if (i === indice) return false;

      const clienteAnterior = normalizarCliente(item["Cliente"]).nome;
      const inicioAnterior = parseData(item["Início"]);

      if (!clienteAnterior || clienteAnterior !== cliente) return false;
      if (!inicioAnterior || inicioAnterior > inicio) return false;

      return classificarTipoPlano(normalizarTexto(item["Tipo"])) === "meses";
    })
    .sort((a, b) => {
      const da = parseData(a.item["Início"]) || "";
      const db = parseData(b.item["Início"]) || "";
      return db.localeCompare(da);
    });

  const contrato = normalizarTexto(registros[indice]["Contrato"]).toLowerCase();

  // O próprio EVO identifica contratos recorrentes no nome.
  const recorrenteExplicito = contrato.includes("recorrente");

  if (anteriores.length === 0) {
    return {
      novo_aluno: true,
      recorrencia: recorrenteExplicito,
      renovacao: false,
      retorno: false,
    };
  }

  const anterior = anteriores[0].item;
  const fimAnterior = parseData(anterior["Fim"]);

  let renovacao = false;
  let retorno = false;

  if (fimAnterior) {
    const inicioMs = new Date(`${inicio}T00:00:00`).getTime();
    const fimMs = new Date(`${fimAnterior}T00:00:00`).getTime();

    const diferencaDias = Math.round(
      (inicioMs - fimMs) / (1000 * 60 * 60 * 24),
    );

    // Contrato seguinte próximo ao término anterior = provável renovação.
    if (diferencaDias >= -7 && diferencaDias <= 60) {
      renovacao = true;
    }

    // Retorno após período maior sem contrato.
    if (diferencaDias > 60) {
      retorno = true;
    }
  }

  return {
    novo_aluno: false,
    recorrencia: recorrenteExplicito || renovacao,
    renovacao,
    retorno,
  };
}

export function importarComercialEvo(
  dados: any[],
  academiaId: string,
) {
  const registrosValidos = dados.filter((item: any) => {
    const cliente = normalizarCliente(item["Cliente"]).nome;
    const inicio = parseData(item["Início"]);

    return Boolean(cliente && inicio);
  });

  return registrosValidos
    .map((item: any, indice: number) => {
      const cliente = normalizarCliente(item["Cliente"]);
      const contrato = normalizarTexto(item["Contrato"]);
      const inicio = parseData(item["Início"]);
      const fim = parseData(item["Fim"]);
      const status = normalizarTexto(item["Status"]);
      const tipo = classificarTipoPlano(normalizarTexto(item["Tipo"]));
      const valor = parseNumero(item["Valor"]);
      const vigencia = parseNumero(item["Vigência"]);

      if (!cliente.nome || !inicio) return null;

      const flags = calcularFlags(
        registrosValidos,
        indice,
        cliente.nome,
        inicio,
      );

      const tipoPlano = identificarTipoPlano(contrato);

      const duracaoMeses =
        tipo === "meses" && vigencia > 0 ? vigencia : null;

      const receitaMensal =
        duracaoMeses && duracaoMeses > 0
          ? Number((valor / duracaoMeses).toFixed(2))
          : null;

      let tipoVenda = "Contrato";

      if (flags.novo_aluno) {
        tipoVenda = "Novo Contrato";
      } else if (flags.renovacao) {
        tipoVenda = "Renovação";
      } else if (flags.recorrencia) {
        tipoVenda = "Recorrente";
      }

      return {
        academia_id: academiaId,
        sistema_origem: "evo",

        aluno_nome: cliente.nome,
        aluno_id_externo: cliente.codigo,

        data_venda: inicio,
        data_inicio_plano: inicio,
        data_fim_plano: fim,

        tipo_venda: tipoVenda,

        plano: contrato || null,
        nome_plano_original: contrato || null,
        tipo_plano: tipoPlano || tipo,

        valor,
        valor_final: valor,
        valor_quitado: null,
        desconto: 0,

        receita_mensal: receitaMensal,
        duracao_meses: duracaoMeses,

        vendedor: null,
        origem_venda: "EVO",

        recorrencia: flags.recorrencia,
        renovacao: flags.renovacao,
        retorno: flags.retorno,
        novo_aluno: flags.novo_aluno,

        status_contrato: status || null,

        // Mantemos a linha original como parte do identificador.
        // Isso permite reimportar o mesmo arquivo sem duplicar.
        import_id: `evo_comercial_${academiaId}_${indice}_${cliente.codigo || "semcodigo"}_${inicio}_${fim || "semfim"}`,
      };
    })
    .filter(Boolean);
}