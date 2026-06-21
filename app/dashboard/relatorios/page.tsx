"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Relatorios() {
  const [academias, setAcademias] = useState<any[]>([]);
  const [academiaId, setAcademiaId] = useState<string>("todas");

  const [mes, setMes] = useState<string>("todos");
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  const [receitaBruta, setReceitaBruta] = useState(0);
  const [despesas, setDespesas] = useState(0);

  const [receitaDashboard, setReceitaDashboard] = useState(0);
  const [despesaDashboard, setDespesaDashboard] = useState(0);
  const [resultadoDashboard, setResultadoDashboard] = useState(0);
  const [margemDashboard, setMargemDashboard] = useState(0);

  const [tributos, setTributos] = useState(0);
  const [pessoal, setPessoal] = useState(0);
  const [infraestrutura, setInfraestrutura] = useState(0);
  const [administrativo, setAdministrativo] = useState(0);
  const [marketing, setMarketing] = useState(0);
  const [financeiro, setFinanceiro] = useState(0);

  const [ranking, setRanking] = useState<any[]>([]);

  // CARREGAR ACADEMIAS
  useEffect(() => {
    carregarAcademias();
  }, []);

  async function carregarAcademias() {
    const { data } = await supabase.from("academias").select("*");

    if (data) {
      setAcademias(data);
    }
  }

  // BUSCAR DADOS
  useEffect(() => {
    buscarDados();
  }, [academiaId, mes, ano]);

  async function buscarDados() {
    let query = supabase.from("lancamentos").select("*");

    // FILTRO ACADEMIA
    if (academiaId !== "todas") {
      query = query.eq("academia_id", academiaId);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      return;
    }

    // ================= DASHBOARD =================

    let queryDashboard = supabase.from("vw_dashboard_mensal").select("*");

    if (academiaId !== "todas") {
      queryDashboard = queryDashboard.eq("academia_id", academiaId);
    }

    const { data: dashboardData } = await queryDashboard;

    if (dashboardData) {
      let receitaTotal = 0;
      let despesaTotal = 0;
      let resultadoTotal = 0;

      dashboardData.forEach((item: any) => {
        const mesItem = Number(item.mes);
        const anoItem = Number(item.ano);

        if (anoItem !== ano) return;

        if (mes !== "todos" && mesItem !== Number(mes)) return;

        receitaTotal += Number(item.receita || 0);
        despesaTotal += Number(item.despesa || 0);
        resultadoTotal += Number(item.resultado || 0);
      });

      const margem =
        receitaTotal > 0 ? (resultadoTotal / receitaTotal) * 100 : 0;

      setReceitaDashboard(receitaTotal);
      setReceitaBruta(receitaTotal);

      setDespesaDashboard(despesaTotal);
      setResultadoDashboard(resultadoTotal);
      setMargemDashboard(margem);
    }

    // ================= DRE =================

    let receita = 0;
    let despesa = 0;
    let totalTributos = 0;
    let totalPessoal = 0;
    let totalInfraestrutura = 0;
    let totalAdministrativo = 0;
    let totalMarketing = 0;
    let totalFinanceiro = 0;

    data.forEach((item: any) => {
      const dataLancamento = new Date(item.data);

      const mesLanc = dataLancamento.getMonth() + 1;
      const anoLanc = dataLancamento.getFullYear();

      // FILTRO MÊS/ANO
      if (anoLanc !== ano) return;

      if (mes !== "todos" && mesLanc !== Number(mes)) return;

      const valor = Number(item.valor);

      if (item.tipo === "receita") {
        receita += valor;
      }

      if (item.tipo === "despesa") {
        despesa += valor;

        const categoria = String(item.categoria || "")
          .trim()
          .toUpperCase();

        switch (categoria) {
          // TRIBUTOS
          case "TRIBUTOS":
          case "SIMPLES NACIONAL":
          case "ISS":
          case "ICMS":
          case "PIS":
          case "COFINS":
          case "IRPJ":
          case "CSLL":
            totalTributos += valor;
            break;

          // PESSOAL
          case "FOLHA DE PAGAMENTO":
          case "PRÓ-LABORE":
          case "PRO LABORE":
          case "COMISSÕES":
          case "COMISSOES":
          case "BENEFÍCIOS":
          case "BENEFICIOS":
          case "ESTAGIÁRIOS":
          case "ESTAGIARIOS":
          case "ENCARGOS":
            totalPessoal += valor;
            break;

          // INFRAESTRUTURA
          case "IMÓVEL":
          case "IMOVEL":
          case "IMÓVEL (OCUPAÇÃO E INFRAESTRUTURA)":
          case "ALUGUEL":
          case "IPTU":
          case "ÁGUA":
          case "AGUA":
          case "LUZ":
          case "ENERGIA":
          case "CONDOMÍNIO":
          case "CONDOMINIO":
          case "INTERNET":
          case "TELEFONIA":
          case "MANUTENÇÃO":
          case "MANUTENCAO":
          case "LIMPEZA":
          case "SEGURANÇA":
          case "SEGURANCA":
            totalInfraestrutura += valor;
            break;

          // ADMINISTRATIVO
          case "ADMINISTRATIVO":
          case "CONTABILIDADE":
          case "JURÍDICO":
          case "JURIDICO":
          case "SOFTWARE":
          case "SOFTWARES":
          case "MATERIAL DE ESCRITÓRIO":
          case "MATERIAL DE ESCRITORIO":
            totalAdministrativo += valor;
            break;

          // MARKETING
          case "MARKETING":
          case "MARKETING/ IMPULSIONAMENTO":
          case "TRÁFEGO PAGO":
          case "TRAFEGO PAGO":
          case "GOOGLE ADS":
          case "FACEBOOK ADS":
          case "INSTAGRAM ADS":
          case "AGÊNCIA":
          case "AGENCIA":
            totalMarketing += valor;
            break;

          // FINANCEIRO
          case "EMPRÉSTIMO":
          case "EMPRESTIMO":
          case "JUROS":
          case "IOF":
          case "TARIFAS BANCÁRIAS":
          case "TARIFAS BANCARIAS":
          case "ANTECIPAÇÃO":
          case "ANTECIPACAO":
            totalFinanceiro += valor;
            break;
        }
      }
    });

    const { data: rankingData } = await supabase
      .from("vw_ranking_unidades")
      .select("*")
      .order("resultado", { ascending: false });

    if (rankingData) {
      setRanking(rankingData);
    }

    setDespesas(despesa);
    setTributos(totalTributos);
    setPessoal(totalPessoal);
    setInfraestrutura(totalInfraestrutura);
    setAdministrativo(totalAdministrativo);
    setMarketing(totalMarketing);
    setFinanceiro(totalFinanceiro);
  }

  // CALCULOS DRE
  const receitaLiquida = receitaBruta - tributos;

  const custosOperacionais =
    pessoal + infraestrutura + administrativo + marketing;

  const resultadoOperacional = receitaLiquida - custosOperacionais;

  const lucroLiquido = resultadoOperacional - financeiro;

  const margemOperacional =
    receitaLiquida > 0
      ? ((resultadoOperacional / receitaLiquida) * 100).toFixed(1)
      : 0;

  const margemLiquida =
    receitaLiquida > 0 ? ((lucroLiquido / receitaLiquida) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Relatórios Financeiros</h1>

      {/* FILTROS */}
      <div className="flex gap-4 mb-10 flex-wrap">
        <select
          value={academiaId}
          onChange={(e) => setAcademiaId(e.target.value)}
          className="bg-[#0f1c33] px-4 py-2 rounded-lg"
        >
          <option value="todas">Todas as academias</option>

          {academias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>

        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="bg-[#0f1c33] px-4 py-2 rounded-lg"
        >
          <option value="todos">Todos os meses</option>

          {[
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
          ].map((nomeMes, index) => (
            <option key={index + 1} value={index + 1}>
              {nomeMes}
            </option>
          ))}
        </select>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="bg-[#0f1c33] px-4 py-2 rounded-lg"
        >
          {[2024, 2025, 2026].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card title="Receita" value={receitaDashboard} color="text-green-400" />

        <Card title="Despesas" value={despesaDashboard} color="text-red-400" />

        <Card
          title="Resultado"
          value={resultadoDashboard}
          color="text-cyan-400"
        />

        <Card
          title="Margem %"
          value={margemDashboard.toFixed(1)}
          color="text-purple-400"
        />
      </div>

      {/* DRE */}
      <div className="bg-[#0f1c33] rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6">
          DRE - Demonstrativo de Resultado
        </h2>

        <div className="space-y-5 text-gray-300">
          <p>
            Receita Bruta:
            <span className="float-right">
              R$ {receitaBruta.toLocaleString("pt-BR")}
            </span>
          </p>

          <p className="text-red-400">
            (-) Tributos
            <span className="float-right">
              R$ {tributos.toLocaleString("pt-BR")}
            </span>
          </p>

          <hr className="border-white/10" />

          <p className="text-green-400 font-bold">
            Receita Líquida
            <span className="float-right">
              R$ {receitaLiquida.toLocaleString("pt-BR")}
            </span>
          </p>

          <hr className="border-white/10" />

          <p>
            ▼ Pessoal
            <span className="float-right">
              R$ {pessoal.toLocaleString("pt-BR")}
            </span>
          </p>

          <p>
            ▼ Infraestrutura
            <span className="float-right">
              R$ {infraestrutura.toLocaleString("pt-BR")}
            </span>
          </p>

          <p>
            ▼ Administrativo
            <span className="float-right">
              R$ {administrativo.toLocaleString("pt-BR")}
            </span>
          </p>

          <p>
            ▼ Marketing
            <span className="float-right">
              R$ {marketing.toLocaleString("pt-BR")}
            </span>
          </p>

          <hr className="border-white/10" />

          <p className="text-purple-400 font-bold">
            Resultado Operacional
            <span className="float-right">
              R$ {resultadoOperacional.toLocaleString("pt-BR")}
            </span>
          </p>

          <p>
            (-) Financeiro
            <span className="float-right">
              R$ {financeiro.toLocaleString("pt-BR")}
            </span>
          </p>

          <hr className="border-white/10" />

          <p className="text-cyan-400 text-xl font-bold">
            Resultado Final
            <span className="float-right">
              R$ {lucroLiquido.toLocaleString("pt-BR")}
            </span>
          </p>
        </div>
      </div>

      {/* RANKING DE UNIDADES */}

      <div className="bg-[#0f1c33] rounded-xl p-8 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">
              🏆 Performance Financeira das Unidades
            </h2>

            <p className="text-gray-400 mt-1">
              Top 10 unidades com melhor resultado financeiro no período
              selecionado
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {ranking.slice(0, 10).map((item: any, index: number) => (
            <div
              key={item.id}
              className="bg-[#162544] rounded-xl p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-[#0f1c33] flex items-center justify-center text-xl font-bold text-cyan-400">
                  {index === 0
                    ? "🥇"
                    : index === 1
                      ? "🥈"
                      : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                </div>

                <div>
                  <h3 className="text-lg font-semibold">{item.nome}</h3>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-10 text-center">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Receita</p>

                  <p className="text-green-400 font-bold">
                    R$ {Number(item.receita || 0).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Despesas</p>

                  <p className="text-red-400 font-bold">
                    R$ {Number(item.despesa || 0).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">Resultado</p>

                  <p
                    className={`font-bold ${
                      Number(item.resultado) >= 0
                        ? "text-cyan-400"
                        : "text-red-400"
                    }`}
                  >
                    R$ {Number(item.resultado || 0).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="bg-[#0f1c33] rounded-xl p-8">
        <h2 className="text-2xl font-semibold mb-6">Insights Inteligentes</h2>

        <div className="bg-[#162544] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>

            <h3 className="text-xl font-semibold">Operação Financeira</h3>
          </div>

          <p className="text-gray-300 leading-7 mb-6">
            {lucroLiquido > 0
              ? "Sua operação fechou o período com resultado positivo e margem saudável."
              : "Sua operação fechou o período com prejuízo e precisa de atenção nos custos operacionais."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0f1c33] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Margem Operacional</p>

              <p className="text-2xl font-bold text-green-400">
                {margemOperacional}%
              </p>
            </div>

            <div className="bg-[#0f1c33] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Margem Líquida</p>

              <p className="text-2xl font-bold text-cyan-400">
                {margemLiquida}%
              </p>
            </div>

            <div className="bg-[#0f1c33] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Resultado</p>

              <p
                className={`text-2xl font-bold ${
                  lucroLiquido > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                R$ {lucroLiquido.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-green-400">✓</span>

              <p>
                Receita líquida de R$ {receitaLiquida.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-cyan-400">✓</span>

              <p>
                Custos operacionais totalizaram R${" "}
                {custosOperacionais.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-yellow-400">⚠</span>

              <p>
                {Number(margemLiquida) > 15
                  ? "Margem operacional considerada saudável."
                  : "Margem operacional abaixo do ideal."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }: any) {
  const percentual = title.includes("Margem");

  return (
    <div className="bg-[#0f1c33] p-6 rounded-xl">
      <p className="text-gray-400 text-sm mb-2">{title}</p>

      <h2 className={`text-3xl font-bold ${color}`}>
        {percentual
          ? `${value}%`
          : `R$ ${Number(value).toLocaleString("pt-BR")}`}
      </h2>
    </div>
  );
}
