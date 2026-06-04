"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { normalizarCRM } from "@/lib/importadores/crmImportador";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

export default function CRMPage() {
  const [loading, setLoading] = useState(false);

  const [academias, setAcademias] = useState<any[]>([]);

  const [academiaId, setAcademiaId] = useState("");

  const [mesSelecionado, setMesSelecionado] = useState("");

  const [contatoInicial, setContatoInicial] = useState(0);

  const [agendados, setAgendados] = useState(0);

  const [aulaExperimental, setAulaExperimental] = useState(0);

  const [fechados, setFechados] = useState(0);

  const [pctAgendados, setPctAgendados] = useState(0);

  const [pctAula, setPctAula] = useState(0);

  const [pctFechados, setPctFechados] = useState(0);

  const [totalLeads, setTotalLeads] = useState(0);

  const [totalFechamentos, setTotalFechamentos] = useState(0);

  const [taxaConversao, setTaxaConversao] = useState(0);

  const [graficoLeads, setGraficoLeads] = useState<any[]>([]);

  const [graficoFechamentos, setGraficoFechamentos] = useState<any[]>([]);

  const [graficoConversao, setGraficoConversao] = useState<any[]>([]);

  // CARREGAR ACADEMIAS
  useEffect(() => {
    carregarAcademias();
  }, []);

  useEffect(() => {
    carregarFunilCRM();
  }, [academiaId, mesSelecionado]);

  async function carregarAcademias() {
    const { data, error } = await supabase
      .from("academias")
      .select("*")
      .order("nome");

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setAcademias(data);
    }
  }

  async function carregarFunilCRM() {
    let query = supabase.from("fato_crm").select("*");

    if (academiaId) {
      query = query.eq("academia_id", academiaId);
    }

    let { data, error } = await query;

    if (mesSelecionado && data) {
      data = data.filter((item: any) => {
        const dataCRM = new Date(item.data_cadastro);

        const mesCRM = dataCRM.getMonth() + 1;

        return mesCRM === Number(mesSelecionado);
      });
    }

    if (error) {
      console.log(error);
      return;
    }

    if (!data) return;

    const totalContato = data.length;

    const totalAgendado = data.filter(
      (item: any) => item.status === "AGENDADO",
    ).length;

    const totalAula = data.filter(
      (item: any) => item.status === "AULA_EXPERIMENTAL",
    ).length;

    const totalFechado = data.filter(
      (item: any) => item.status === "FECHADO",
    ).length;

    setContatoInicial(totalContato);

    setAgendados(totalAgendado);

    setAulaExperimental(totalAula);

    setFechados(totalFechado);

    const percentualAgendados =
      totalContato > 0 ? Math.round((totalAgendado / totalContato) * 100) : 0;

    const percentualAula =
      totalAgendado > 0 ? Math.round((totalAula / totalAgendado) * 100) : 0;

    const percentualFechados =
      totalAula > 0 ? Math.round((totalFechado / totalAula) * 100) : 0;

    setPctAgendados(percentualAgendados);

    setPctAula(percentualAula);

    setPctFechados(percentualFechados);

    setTotalLeads(totalContato);

    setTotalFechamentos(totalFechado);

    const conversaoGeral =
      totalContato > 0 ? ((totalFechado / totalContato) * 100).toFixed(2) : "0";

    setTaxaConversao(Number(conversaoGeral));

    const agrupado: Record<string, number> = {};

    data.forEach((item: any) => {
      const dataCRM = new Date(item.data_cadastro);

      const mes = dataCRM.toLocaleString("pt-BR", {
        month: "short",
      });

      agrupado[mes] = (agrupado[mes] || 0) + 1;
    });

    const dadosGrafico = Object.keys(agrupado).map((mes) => ({
      mes,
      valor: agrupado[mes],
    }));

    setGraficoLeads(dadosGrafico);

    // FECHAMENTOS POR MÊS

    const agrupadoFechamentos: Record<number, number> = {};

    data
      .filter((item: any) => item.status === "FECHADO")
      .forEach((item: any) => {
        const dataCRM = new Date(item.data_cadastro);

        const mesNumero = dataCRM.getMonth() + 1;

        agrupadoFechamentos[mesNumero] =
          (agrupadoFechamentos[mesNumero] || 0) + 1;
      });

    const nomesMeses = [
      "",
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const dadosFechamentos = Object.keys(agrupadoFechamentos)
      .map(Number)
      .sort((a, b) => a - b)
      .map((mesNumero) => ({
        mes: nomesMeses[mesNumero],
        valor: agrupadoFechamentos[mesNumero],
      }));

    setGraficoFechamentos(dadosFechamentos);

    const agrupadoConversao: Record<
      number,
      {
        leads: number;
        fechados: number;
      }
    > = {};

    data.forEach((item: any) => {
      const mesNumero = new Date(item.data_cadastro).getMonth() + 1;

      if (!agrupadoConversao[mesNumero]) {
        agrupadoConversao[mesNumero] = {
          leads: 0,
          fechados: 0,
        };
      }

      agrupadoConversao[mesNumero].leads++;

      if (item.status === "FECHADO") {
        agrupadoConversao[mesNumero].fechados++;
      }
    });

    const dadosConversao = Object.keys(agrupadoConversao)
      .map(Number)
      .sort((a, b) => a - b)
      .map((mesNumero) => {
        const mes = agrupadoConversao[mesNumero];

        const percentual =
          mes.leads > 0
            ? Number(((mes.fechados / mes.leads) * 100).toFixed(1))
            : 0;

        return {
          mes: nomesMeses[mesNumero],
          valor: percentual,
        };
      });

    setGraficoConversao(dadosConversao);
  }

  // IMPORTAR CRM
  async function importarCRM(e: any) {
    try {
      const file = e.target.files[0];

      if (!file) return;

      // VALIDAR ACADEMIA
      if (!academiaId) {
        alert("Selecione uma academia");

        return;
      }

      setLoading(true);

      // NORMALIZAR EXCEL
      const registros: any = await normalizarCRM(file);

      console.log("CRM NORMALIZADO:", registros);

      // VALIDAR SE O MÊS JÁ FOI IMPORTADO

      const primeiroRegistro = registros[0];

      if (!primeiroRegistro?.data_cadastro) {
        alert("Não foi possível identificar a data do arquivo.");
        return;
      }

      const ano = primeiroRegistro.data_cadastro.substring(0, 4);

      const mes = primeiroRegistro.data_cadastro.substring(5, 7);

      const inicioMes = `${ano}-${mes}-01`;

      const proximoMes = Number(mes) + 1;

      const fimMes =
        proximoMes <= 12
          ? `${ano}-${String(proximoMes).padStart(2, "0")}-01`
          : `${Number(ano) + 1}-01-01`;

      const { data: existente, error: erroConsulta } = await supabase
        .from("fato_crm")
        .select("id")
        .eq("academia_id", academiaId)
        .gte("data_cadastro", inicioMes)
        .lt("data_cadastro", fimMes)
        .limit(1);

      if (erroConsulta) {
        console.log(erroConsulta);

        alert("Erro ao validar importação.");

        return;
      }

      if (existente && existente.length > 0) {
        alert(`O mês ${mes}/${ano} já foi importado para esta academia.`);

        return;
      }

      // PAYLOAD
      const payload = registros.map((item: any) => ({
        academia_id: academiaId,

        sistema_origem: "CRM",

        data_cadastro: item.data_cadastro,

        nome: item.nome,

        telefone: item.telefone,

        email: item.email,

        lista: item.lista,

        status: item.etapa,

        vendedor: item.vendedor,
      }));

      console.log("PRIMEIRO PAYLOAD:", payload[0]);

      // INSERT
      const { error } = await supabase.from("fato_crm").insert(payload);

      if (error) {
        console.log(error);

        alert("Erro ao importar CRM");

        return;
      }

      alert("CRM importado com sucesso!");

      const { data: crmDebug } = await supabase
        .from("fato_crm")
        .select("*")
        .limit(5);

      console.log("CRM SALVO:", crmDebug);

      carregarFunilCRM();
    } catch (error) {
      console.log(error);

      alert("Erro no processamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-white p-10">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold">CRM Analytics</h1>

          <p className="text-gray-400 mt-2">
            Pipeline comercial e funil de conversão
          </p>
        </div>

        {/* FILTROS */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* FILTRO MÊS */}
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="bg-[#0f1c33] border border-white/10 px-5 py-3 rounded-xl min-w-[220px]"
          >
            <option value="">Todos os meses</option>

            <option value="1">Janeiro</option>
            <option value="2">Fevereiro</option>
            <option value="3">Março</option>
            <option value="4">Abril</option>
            <option value="5">Maio</option>
            <option value="6">Junho</option>
            <option value="7">Julho</option>
            <option value="8">Agosto</option>
            <option value="9">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

          {/* FILTRO ACADEMIA */}
          <select
            value={academiaId}
            onChange={(e) => setAcademiaId(e.target.value)}
            className="bg-[#0f1c33] border border-white/10 px-5 py-3 rounded-xl min-w-[280px]"
          >
            <option value="">Todas as academias</option>

            {academias.map((academia: any) => (
              <option key={academia.id} value={academia.id}>
                {academia.nome}
              </option>
            ))}
          </select>

          {/* IMPORTAR */}
          <label className="bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-semibold px-6 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-3">
            <span>⬆</span>
            Importar CRM
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importarCRM}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* FUNIL */}
      <div className="bg-gradient-to-br from-[#13203a] to-[#0b1426] rounded-3xl p-10 border border-cyan-500/20 shadow-2xl">
        {/* TITULO */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-white">Funil Comercial</h2>

          <p className="text-gray-400 mt-2">Conversão entre etapas do CRM</p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 items-center">
          {/* KPIS */}
          <div className="space-y-6">
            <div className="bg-[#162544] rounded-2xl p-6 border border-cyan-500/10">
              <p className="text-gray-400 text-sm">Conversão Total</p>

              <h3 className="text-5xl font-bold text-white mt-2">
                {taxaConversao}%
              </h3>
            </div>

            <div className="bg-[#162544] rounded-2xl p-6 border border-pink-500/10">
              <p className="text-gray-400 text-sm">Leads Perdidos</p>

              <h3 className="text-5xl font-bold text-pink-400 mt-2">
                {contatoInicial - fechados}
              </h3>
            </div>

            <div className="bg-[#162544] rounded-2xl p-6 border border-cyan-500/10">
              <p className="text-gray-400 text-sm">Fechamentos</p>

              <h3 className="text-5xl font-bold text-cyan-400 mt-2">
                {fechados}
              </h3>
            </div>
          </div>

          {/* FUNIL CENTRAL */}
          <div className="xl:col-span-2 flex flex-col items-center justify-center">
            {/* CONTATO */}
            <div
              className="
  w-full
  max-w-[760px]
  h-[140px]
  clip-top
  bg-gradient-to-r
  from-cyan-500
  to-cyan-400
  shadow-[0_0_60px_rgba(0,255,255,0.15)]
  border border-cyan-200
  flex flex-col
  items-center
  justify-center
  transition-all
  duration-300
  hover:scale-[1.02]
"
            >
              <p className="text-sm text-cyan-100">Contato Inicial</p>

              <h2 className="text-6xl font-bold text-white">
                {contatoInicial}
              </h2>
            </div>

            {/* AGENDADOS */}
            <div
              className="
  w-[82%]
  h-[125px]
  clip-middle
  bg-gradient-to-r
  from-[#0f5f85]
  to-[#1393c7]
  border border-cyan-200
  shadow-[0_0_50px_rgba(0,255,255,0.10)]
  flex flex-col
  items-center
  justify-center
  transition-all
  duration-300
  hover:scale-[1.02]
"
            >
              <p className="text-sm text-cyan-100">Agendados</p>

              <h2 className="text-5xl font-bold text-white">{agendados}</h2>
            </div>

            {/* AULA */}
            <div
              className="
  w-[60%]
  h-[115px]
  clip-middle
  bg-gradient-to-r
  from-[#12395c]
  to-[#166b9a]
  border border-cyan-200
  shadow-[0_0_40px_rgba(0,255,255,0.08)]
  flex flex-col
  items-center
  justify-center
  transition-all
  duration-300
  hover:scale-[1.02]
"
            >
              <p className="text-sm text-cyan-100">Aula Experimental</p>

              <h2 className="text-5xl font-bold text-white">
                {aulaExperimental}
              </h2>
            </div>

            {/* FECHADOS */}
            <div
              className="
  w-[42%]
  h-[135px]
  clip-bottom
  bg-gradient-to-r
  from-[#081728]
  to-[#10466d]
  border border-cyan-200
  shadow-[0_0_30px_rgba(0,255,255,0.08)]
  flex flex-col
  items-center
  justify-center
  transition-all
  duration-300
  hover:scale-[1.02]
"
            >
              <p className="text-sm text-cyan-100">Fechados</p>

              <h2 className="text-5xl font-bold text-white">{fechados}</h2>
            </div>
          </div>

          {/* CONVERSÕES */}
          <div className="space-y-8">
            {/* AGENDADOS */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Conversão Agendados</span>

                <span className="text-pink-400 font-bold">{pctAgendados}%</span>
              </div>

              <div className="w-full bg-[#162544] rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-cyan-400 h-4 rounded-full"
                  style={{
                    width: `${pctAgendados}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* AULA */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Conversão Aula</span>

                <span className="text-pink-400 font-bold">{pctAula}%</span>
              </div>

              <div className="w-full bg-[#162544] rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-cyan-400 h-4 rounded-full"
                  style={{
                    width: `${pctAula}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* FECHADOS */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Conversão Fechados</span>

                <span className="text-pink-400 font-bold">{pctFechados}%</span>
              </div>

              <div className="w-full bg-[#162544] rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-cyan-400 h-4 rounded-full"
                  style={{
                    width: `${pctFechados}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PERFORMANCE COMERCIAL */}

      <div className="mt-10 space-y-8">
        <div className="bg-[#0f172a] rounded-3xl border border-cyan-500/20 p-8 h-[380px]">
          <div className="flex h-full">
            <div className="w-[280px] flex flex-col justify-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <span className="text-3xl">👥</span>
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">
                Evolução Mensal de Leads
              </h3>

              <p className="text-gray-400 mb-8">
                Histórico de captação de leads
              </p>

              <h2 className="text-7xl font-bold text-cyan-400">{totalLeads}</h2>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={graficoLeads}
                  margin={{
                    top: 40,
                    right: 20,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />

                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />

                  <XAxis dataKey="mes" stroke="#64748b" />

                  <YAxis stroke="#64748b" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#22d3ee"
                    strokeWidth={4}
                    fill="url(#colorLeads)"
                    dot={{
                      r: 6,
                      fill: "#22d3ee",
                      stroke: "#22d3ee",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 10,
                      fill: "#22d3ee",
                    }}
                  >
                    <LabelList
                      dataKey="valor"
                      position="top"
                      fill="#ffffff"
                      fontSize={18}
                      fontWeight="bold"
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-3xl border border-purple-500/20 p-8 h-[380px]">
          <div className="flex h-full">
            <div className="w-[280px] flex flex-col justify-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">
                Evolução dos Fechamentos
              </h3>

              <p className="text-gray-400 mb-8">
                Histórico de contratos fechados
              </p>

              <h2 className="text-7xl font-bold text-purple-400">
                {totalFechamentos}
              </h2>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={graficoFechamentos}
                  margin={{
                    top: 40,
                    right: 20,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="colorFechamentos"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />

                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />

                  <XAxis dataKey="mes" stroke="#64748b" />

                  <YAxis stroke="#64748b" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#a855f7"
                    strokeWidth={4}
                    fill="url(#colorFechamentos)"
                    dot={{
                      r: 6,
                      fill: "#a855f7",
                      stroke: "#a855f7",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 10,
                      fill: "#a855f7",
                    }}
                  >
                    <LabelList
                      dataKey="valor"
                      position="top"
                      fill="#ffffff"
                      fontSize={18}
                      fontWeight="bold"
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-3xl border border-emerald-500/20 p-8 h-[380px]">
          <div className="flex h-full">
            <div className="w-[280px] flex flex-col justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <span className="text-3xl">📈</span>
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">
                Taxa de Conversão
              </h3>

              <p className="text-gray-400 mb-8">
                Conversão de leads em contratos
              </p>

              <h2 className="text-7xl font-bold text-emerald-400">
                {taxaConversao}%
              </h2>
            </div>

            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={graficoConversao}
                  margin={{
                    top: 40,
                    right: 20,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="colorConversao"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />

                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />

                  <XAxis dataKey="mes" stroke="#64748b" />

                  <YAxis stroke="#64748b" />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#10b981"
                    strokeWidth={4}
                    fill="url(#colorConversao)"
                    dot={{
                      r: 6,
                      fill: "#10b981",
                      stroke: "#10b981",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 10,
                      fill: "#10b981",
                    }}
                  >
                    <LabelList
                      dataKey="valor"
                      position="top"
                      fill="#ffffff"
                      fontSize={18}
                      fontWeight="bold"
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
