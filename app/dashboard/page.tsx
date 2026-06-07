"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ComposedChart } from "recharts";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";

import {
  DollarSign,
  TrendingDown,
  BarChart3,
  Users,
  AlertTriangle,
  Gauge,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const [role, setRole] = useState("");
  const [academias, setAcademias] = useState<any[]>([]);
  const [academiaId, setAcademiaId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [userId, setUserId] = useState("");
  const [dados, setDados] = useState<any[]>([]);
  const [financeiroMensal, setFinanceiroMensal] = useState<any[]>([]);
  const [churnMensal, setChurnMensal] = useState<any[]>([]);
  const [alunosMensal, setAlunosMensal] = useState<any[]>([]);
  const [ticketMensal, setTicketMensal] = useState<any[]>([]);
  const [custosMensal, setCustosMensal] = useState<any[]>([]);

  const [mesSelecionado, setMesSelecionado] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");

  const isReceita = (item: any) =>
    String(item.tipo).toLowerCase().includes("receita");

  const isDespesa = (item: any) =>
    String(item.tipo).toLowerCase().includes("despesa");

  useEffect(() => {
    async function loadAcademias() {
      if (!userId) return;
      if (!role) return;

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        const { data } = await supabase.from("academias").select("*");
        setAcademias(data || []);
        return;
      }

      // 🔵 DONO DA REDE
      if (role === "admin_rede") {
        const { data } = await supabase
          .from("academias")
          .select("*")
          .eq("cliente_id", clienteId);

        setAcademias(data || []);
        return;
      }

      // 🟢 USUARIO (FRANQUEADO)
      if (role === "usuario") {
        const { data: vinculos } = await supabase
          .from("perfis_academias")
          .select("academia_id")
          .eq("perfil_id", userId);

        console.log("VINCULOS:", vinculos);

        const ids = vinculos?.map((v) => v.academia_id) || [];

        const { data } = await supabase
          .from("academias")
          .select("*")
          .in("id", ids);

        const lista = data || [];
        setAcademias(lista);

        if (!academiaId && lista.length > 0) {
          setAcademiaId(lista[0].id);
        }
      }
    }

    loadAcademias();
  }, [role, userId, clienteId]);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.push("/login");
        return;
      }

      const uid = data.session.user.id;
      setUserId(uid);

      const { data: perfil } = await supabase
        .from("perfis")
        .select("role, cliente_id")
        .eq("id", uid)
        .single();

      setRole(perfil?.role || "");
      setClienteId(perfil?.cliente_id || "");

      await new Promise((r) => setTimeout(r, 100));

      // 🔥 pega academias vinculadas ao usuário
      const { data: vinculos } = await supabase
        .from("perfis_academias")
        .select("academia_id")
        .eq("perfil_id", uid);

      const ids = vinculos?.map((v) => v.academia_id) || [];

      if (!academiaId && ids.length > 0) {
        setAcademiaId(ids[0]);
      }
    };

    checkUser();
  }, [router]);

  useEffect(() => {
    async function carregarDados() {
      // 🔒 NÃO EXECUTA SEM CONTEXTO
      if (!role) return;

      // 🔒 USUÁRIO PRECISA TER ACADEMIA
      if (role === "usuario" && !academiaId) return;

      let query = supabase.from("lancamentos").select("*", { count: "exact" });

      // 🟢 USUARIO
      if (role === "usuario") {
        query = query.eq("academia_id", academiaId);
      }

      // 🔵 ADMIN REDE
      if (role === "admin_rede") {
        const { data: academias } = await supabase
          .from("academias")
          .select("id")
          .eq("cliente_id", clienteId);

        const ids = academias?.map((a) => a.id) || [];

        if (academiaId) {
          query = query.eq("academia_id", academiaId);
        } else {
          query = query.in("academia_id", ids);
        }
      }

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        if (academiaId) {
          query = query.eq("academia_id", academiaId);
        }
      }

      const { data, error, count } = await query.range(0, 10000);

      console.log("TOTAL DASHBOARD:", count);
      console.log("TOTAL DATA:", data?.length);

      if (error) {
        console.error(error);
        return;
      }

      setDados(data || []);

      let queryDashboard = supabase.from("vw_dashboard_mensal").select("*");

      if (role === "usuario") {
        queryDashboard = queryDashboard.eq("academia_id", academiaId);
      }

      // 🔵 ADMIN REDE
      if (role === "admin_rede") {
        const { data: academias } = await supabase
          .from("academias")
          .select("id")
          .eq("cliente_id", clienteId);

        const ids = academias?.map((a) => a.id) || [];

        if (academiaId) {
          queryDashboard = queryDashboard.eq("academia_id", academiaId);
        } else {
          queryDashboard = queryDashboard.in("academia_id", ids);
        }
      }

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        if (academiaId) {
          queryDashboard = queryDashboard.eq("academia_id", academiaId);
        }
      }

      const { data: dashboardData } = await queryDashboard;

      console.log("DASHBOARD VIEW:", dashboardData);

      setFinanceiroMensal(dashboardData || []);

      let queryChurn = supabase.from("vw_churn_mensal").select("*");

      if (role === "usuario") {
        queryChurn = queryChurn.eq("academia_id", academiaId);
      }

      // 🔵 ADMIN REDE
      if (role === "admin_rede") {
        const { data: academias } = await supabase
          .from("academias")
          .select("id")
          .eq("cliente_id", clienteId);

        const ids = academias?.map((a) => a.id) || [];

        if (academiaId) {
          queryChurn = queryChurn.eq("academia_id", academiaId);
        } else {
          queryChurn = queryChurn.in("academia_id", ids);
        }
      }

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        if (academiaId) {
          queryChurn = queryChurn.eq("academia_id", academiaId);
        }
      }

      const { data: churnData } = await queryChurn;

      console.log("CHURN VIEW:", churnData);

      setChurnMensal(churnData || []);

      let queryAlunos = supabase.from("vw_alunos_mensal").select("*");

      if (role === "usuario") {
        queryAlunos = queryAlunos.eq("academia_id", academiaId);
      }

      // 🔵 ADMIN REDE
      if (role === "admin_rede") {
        const { data: academias } = await supabase
          .from("academias")
          .select("id")
          .eq("cliente_id", clienteId);

        const ids = academias?.map((a) => a.id) || [];

        if (academiaId) {
          queryAlunos = queryAlunos.eq("academia_id", academiaId);
        } else {
          queryAlunos = queryAlunos.in("academia_id", ids);
        }
      }

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        if (academiaId) {
          queryAlunos = queryAlunos.eq("academia_id", academiaId);
        }
      }

      const { data: alunosData } = await queryAlunos;

      console.log("ALUNOS VIEW:", alunosData);

      setAlunosMensal(alunosData || []);

      let queryTicket = supabase.from("vw_ticket_medio_mensal").select("*");

      if (role === "usuario") {
        queryTicket = queryTicket.eq("academia_id", academiaId);
      }

      // 🔵 ADMIN REDE
      if (role === "admin_rede") {
        const { data: academias } = await supabase
          .from("academias")
          .select("id")
          .eq("cliente_id", clienteId);

        const ids = academias?.map((a) => a.id) || [];

        if (academiaId) {
          queryTicket = queryTicket.eq("academia_id", academiaId);
        } else {
          queryTicket = queryTicket.in("academia_id", ids);
        }
      }

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        if (academiaId) {
          queryTicket = queryTicket.eq("academia_id", academiaId);
        }
      }

      const { data: ticketData } = await queryTicket;

      console.log("TICKET VIEW:", ticketData);

      setTicketMensal(ticketData || []);

      let queryCustos = supabase.from("vw_custos_operacionais").select("*");

      if (role === "usuario") {
        queryCustos = queryCustos.eq("academia_id", academiaId);
      }

      // 🔵 ADMIN REDE
      if (role === "admin_rede") {
        const { data: academias } = await supabase
          .from("academias")
          .select("id")
          .eq("cliente_id", clienteId);

        const ids = academias?.map((a) => a.id) || [];

        if (academiaId) {
          queryCustos = queryCustos.eq("academia_id", academiaId);
        } else {
          queryCustos = queryCustos.in("academia_id", ids);
        }
      }

      // 🔴 ADMIN MASTER
      if (role === "admin_master") {
        if (academiaId) {
          queryCustos = queryCustos.eq("academia_id", academiaId);
        }
      }

      const { data: custosData } = await queryCustos;

      console.log("CUSTOS VIEW:", custosData);

      setCustosMensal(custosData || []);
    }

    carregarDados();
  }, [academiaId, role, clienteId]);

  // ================= FILTRO =================
  const dadosFiltrados = dados.filter((item: any) => {
    if (!item.data) return false;

    const [anoStr, mesStr] = item.data.split("-");

    const ano = Number(anoStr);
    const mes = Number(mesStr);

    if (mesSelecionado && Number(mesSelecionado) !== mes) return false;
    if (anoSelecionado && Number(anoSelecionado) !== ano) return false;

    return true;
  });

  // ================= INDICADORES =================
  const financeiroFiltrado = financeiroMensal.filter((item: any) => {
    if (mesSelecionado && Number(item.mes) !== Number(mesSelecionado)) {
      return false;
    }

    if (anoSelecionado && Number(item.ano) !== Number(anoSelecionado)) {
      return false;
    }

    return true;
  });

  const receita = financeiroFiltrado.reduce(
    (total: number, item: any) => total + Number(item.receita || 0),
    0,
  );

  const despesa = financeiroFiltrado.reduce(
    (total: number, item: any) => total + Number(item.despesa || 0),
    0,
  );

  const resultado = financeiroFiltrado.reduce(
    (total: number, item: any) => total + Number(item.resultado || 0),
    0,
  );

  // ================= TICKET FINANCEIRO =================
  const receitas = dadosFiltrados.filter((i: any) => isReceita(i));

  const despesasLista = dadosFiltrados.filter((i: any) => isDespesa(i));

  const totalContratos = receitas.length;

  const ticketFinanceiro = totalContratos > 0 ? receita / totalContratos : 0;

  // ================= TICKET POR ALUNO =================
  const alunosAtivos = dadosFiltrados.filter(
    (i: any) =>
      isReceita(i) && String(i.status_cliente).toLowerCase().includes("ativo"),
  ).length;

  const ticketAluno = alunosAtivos > 0 ? receita / alunosAtivos : 0;

  // ================= ALUNOS =================
  const alunos = dadosFiltrados.filter((i: any) => {
    if (!isReceita(i)) return false;

    // EVO
    if (i.sistema_origem === "evo") {
      return true;
    }

    // ULTRA
    if (i.sistema_origem === "ultra") {
      return true;
    }

    // TECNOFIT
    return i.status_cliente;
  });

  // normaliza o texto (evita erro)
  const getStatus = (i: any) =>
    String(i.status_cliente || "")
      .toLowerCase()
      .trim();

  const ativos = alunos.filter((i: any) =>
    getStatus(i).includes("ativo"),
  ).length;

  const cancelados = alunos.filter((i: any) =>
    getStatus(i).includes("cancel"),
  ).length;

  const bloqueados = alunos.filter((i: any) =>
    getStatus(i).includes("bloque"),
  ).length;

  const totalAlunos = alunos.length;

  // ================= CHURN =================
  const churn =
    ativos + cancelados > 0 ? (cancelados / (ativos + cancelados)) * 100 : 0;

  const healthScore = Math.max(
    0,
    Math.min(100, 100 - churn * 1.2 + ativos * 0.15 - cancelados * 0.4),
  );

  // ================= PERÍODO ANTERIOR =================
  const dadosMesAnterior = dados.filter((item: any) => {
    if (!item.data) return false;

    const [anoStr, mesStr] = item.data.split("-");

    const ano = Number(anoStr);
    const mes = Number(mesStr);

    if (!mesSelecionado || !anoSelecionado) return false;

    let mesAnterior = Number(mesSelecionado) - 1;
    let anoAnterior = Number(anoSelecionado);

    if (mesAnterior === 0) {
      mesAnterior = 12;
      anoAnterior--;
    }

    return mes === mesAnterior && ano === anoAnterior;
  });

  // receita anterior
  const receitaAnterior = dadosMesAnterior
    .filter((i: any) => isReceita(i))
    .reduce((t, i) => t + Number(i.valor || 0), 0);

  // despesa anterior
  const despesaAnterior = dadosMesAnterior
    .filter((i: any) => isDespesa(i))
    .reduce((t, i) => t + Number(i.valor || 0), 0);

  // resultado anterior
  const resultadoAnterior = receitaAnterior - despesaAnterior;

  // ativos anterior
  const ativosAnterior = dadosMesAnterior.filter(
    (i: any) =>
      isReceita(i) && String(i.status_cliente).toLowerCase().includes("ativo"),
  ).length;

  // cancelados anterior
  const canceladosAnterior = dadosMesAnterior.filter(
    (i: any) =>
      isReceita(i) && String(i.status_cliente).toLowerCase().includes("cancel"),
  ).length;

  // churn anterior
  const churnAnterior =
    ativosAnterior + canceladosAnterior > 0
      ? (canceladosAnterior / (ativosAnterior + canceladosAnterior)) * 100
      : 0;

  // ================= VARIAÇÃO (%) =================
  const variacao = (atual: number, anterior: number) => {
    if (!anterior) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  // ================= GRÁFICO =================
  const dadosGrafico = Object.values(
    dadosFiltrados
      .filter((item: any) => isReceita(item))
      .reduce((acc: any, item: any) => {
        const [ano, mes] = item.data.split("-");
        const mesNumero = Number(mes) - 1;

        const meses = [
          "jan",
          "fev",
          "mar",
          "abr",
          "mai",
          "jun",
          "jul",
          "ago",
          "set",
          "out",
          "nov",
          "dez",
        ];
        const mesNome = meses[mesNumero];

        if (!acc[mesNumero]) {
          acc[mesNumero] = {
            mes: mesNome,
            ordem: mesNumero,
            recorrencia: 0,
            cartao: 0,
            pix: 0,
            boleto: 0,
            dinheiro: 0,
          };
        }

        const texto = String(item.forma_pagamento || "").toLowerCase();
        const valor = Number(item.valor || 0);

        if (
          texto.includes("cart") ||
          texto.includes("credito") ||
          texto.includes("debito") ||
          texto.includes("visa") ||
          texto.includes("master") ||
          texto.includes("elo")
        ) {
          acc[mesNumero].cartao += valor;
        } else if (texto.includes("pix")) {
          acc[mesNumero].pix += valor;
        } else if (texto.includes("boleto")) {
          acc[mesNumero].boleto += valor;
        } else if (texto.includes("dinheiro")) {
          acc[mesNumero].dinheiro += valor;
        } else {
          acc[mesNumero].recorrencia += valor;
        }

        return acc;
      }, {}),
  ).sort((a: any, b: any) => a.ordem - b.ordem);

  // ================= % PARA GRÁFICO =================
  const dadosPercentuais = dadosGrafico.map((m: any) => {
    const total = m.recorrencia + m.cartao + m.pix + m.boleto + m.dinheiro;

    return {
      mes: m.mes,
      recorrencia: total ? (m.recorrencia / total) * 100 : 0,
      cartao: total ? (m.cartao / total) * 100 : 0,
      pix: total ? (m.pix / total) * 100 : 0,
      boleto: total ? (m.boleto / total) * 100 : 0,
      dinheiro: total ? (m.dinheiro / total) * 100 : 0,
    };
  });

  // ================= MESES =================
  const meses = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  // ================= GRÁFICO DE ALUNOS =================
  const dadosAlunos: any[] = Object.values(
    alunosMensal.reduce((acc: any, item: any) => {
      const mesNumero = Number(item.mes);

      if (!acc[mesNumero]) {
        acc[mesNumero] = {
          mes: meses[mesNumero - 1],
          ordem: mesNumero,
          ativos: 0,
          recorrencia: 0,
          novos: 0,
        };
      }

      acc[mesNumero].ativos += Number(item.ativos || 0);
      acc[mesNumero].recorrencia += Number(item.recorrencia || 0);
      acc[mesNumero].novos += Number(item.novos || 0);

      return acc;
    }, {}),
  ).sort((a: any, b: any) => a.ordem - b.ordem);

  const ultimoMesAlunos: any =
    dadosAlunos.length > 0 ? dadosAlunos[dadosAlunos.length - 1] : null;

  const mesAnteriorAlunos: any =
    dadosAlunos.length > 1 ? dadosAlunos[dadosAlunos.length - 2] : null;

  const totalUltimoMes = ultimoMesAlunos
    ? ultimoMesAlunos.ativos +
      ultimoMesAlunos.novos +
      ultimoMesAlunos.recorrencia
    : 0;

  const totalMesAnterior = mesAnteriorAlunos
    ? mesAnteriorAlunos.ativos +
      mesAnteriorAlunos.novos +
      mesAnteriorAlunos.recorrencia
    : 0;

  const crescimentoAlunos =
    totalMesAnterior > 0
      ? ((totalUltimoMes - totalMesAnterior) / totalMesAnterior) * 100
      : 0;

  // ================= GRÁFICO DE CHURN =================
  const dadosChurn = Object.values(
    churnMensal.reduce((acc: any, item: any) => {
      const mesNumero = Number(item.mes);

      if (!acc[mesNumero]) {
        acc[mesNumero] = {
          mes: meses[mesNumero - 1],
          ordem: mesNumero,
          ativos: 0,
          cancelados: 0,
        };
      }

      acc[mesNumero].ativos += Number(item.ativos || 0);
      acc[mesNumero].cancelados += Number(item.cancelados || 0);

      return acc;
    }, {}),
  )
    .map((item: any) => ({
      ...item,
      churn:
        item.ativos + item.cancelados > 0
          ? (item.cancelados / (item.ativos + item.cancelados)) * 100
          : 0,
    }))
    .sort((a: any, b: any) => a.ordem - b.ordem);

  // ================= GRÁFICO EVOLUÇÃO FINANCEIRA =================

  const dadosEvolucao = Object.values(
    financeiroFiltrado.reduce((acc: any, item: any) => {
      const mesNumero = Number(item.mes);

      if (!acc[mesNumero]) {
        acc[mesNumero] = {
          mes: meses[mesNumero - 1],
          ordem: mesNumero,
          receita: 0,
          despesa: 0,
          resultado: 0,
        };
      }

      acc[mesNumero].receita += Number(item.receita || 0);
      acc[mesNumero].despesa += Number(item.despesa || 0);
      acc[mesNumero].resultado += Number(item.resultado || 0);

      return acc;
    }, {}),
  ).sort((a: any, b: any) => a.ordem - b.ordem);

  const dadosMargem = financeiroFiltrado
    .map((item: any) => ({
      mes: meses[Number(item.mes) - 1],
      ordem: Number(item.mes),
      margem:
        Number(item.receita || 0) > 0
          ? (Number(item.resultado || 0) / Number(item.receita || 0)) * 100
          : 0,
    }))
    .sort((a: any, b: any) => a.ordem - b.ordem);

  const renderLabel = (props: any) => {
    const { x, y, width, height, value } = props;

    const text = `R$ ${Number(value).toLocaleString("pt-BR")}`;

    const paddingX = 6;
    const boxWidth = text.length * 6 + paddingX * 2;

    // ✔ POSICIONAMENTO BASEADO NA ALTURA DA BARRA
    const espacamento = 22;

    const posY = y - espacamento;

    return (
      <g>
        <rect
          x={x + width / 2 - boxWidth / 2}
          y={posY}
          width={boxWidth}
          height={18}
          rx={6}
          fill="rgba(0,0,0,0.5)"
          stroke="#ffffff"
          strokeWidth={1}
        />
        <text
          x={x + width / 2}
          y={posY + 12}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={10}
        >
          {text}
        </text>
      </g>
    );
  };

  // ================= GRÁFICO EVOLUÇAÕ DO TICKET MEDIO EFETIVO =================
  const dadosTicket = Object.values(
    ticketMensal.reduce((acc: any, item: any) => {
      const mesNumero = Number(item.mes);

      if (!acc[mesNumero]) {
        acc[mesNumero] = {
          mes: meses[mesNumero - 1],
          ordem: mesNumero,
          ticket: 0,
          quantidade: 0,
        };
      }

      acc[mesNumero].ticket += Number(item.ticket || 0);
      acc[mesNumero].quantidade += 1;

      return acc;
    }, {}),
  )
    .map((item: any) => ({
      ...item,
      ticket: item.quantidade > 0 ? item.ticket / item.quantidade : 0,
    }))
    .sort((a: any, b: any) => a.ordem - b.ordem);

  const ultimoTicket =
    dadosTicket.length > 0 ? dadosTicket[dadosTicket.length - 1].ticket : 0;

  const mesesComChurn = dadosChurn.filter((item) => Number(item.churn) > 0);

  const churnMedio =
    mesesComChurn.length > 0
      ? mesesComChurn.reduce((acc, item) => acc + Number(item.churn), 0) /
        mesesComChurn.length
      : 0;

  // ================= GRÁFICO EVOLUÇAÕ DOS CUSTOS OPERACIONAIS TOTAIS =================
  const dadosCustos = Object.values(
    custosMensal.reduce((acc: any, item: any) => {
      const mesNumero = Number(item.mes);

      if (!acc[mesNumero]) {
        acc[mesNumero] = {
          mes: meses[mesNumero - 1],
          ordem: mesNumero,
          receita: 0,
          despesa: 0,
        };
      }

      acc[mesNumero].receita += Number(item.receita || 0);
      acc[mesNumero].despesa += Number(item.despesa || 0);

      return acc;
    }, {}),
  )
    .map((item: any) => ({
      ...item,
      percentual: item.receita > 0 ? (item.despesa / item.receita) * 100 : 0,

      percentualReal:
        item.receita > 0 ? (item.despesa / item.receita) * 100 : 0,
    }))
    .sort((a: any, b: any) => a.ordem - b.ordem);

  const categoriasDespesas = dadosFiltrados
    .filter((i: any) => isDespesa(i))
    .map((i: any) => i.categoria || "Outros")
    .filter((v, i, arr) => arr.indexOf(v) === i);

  const dadosDespesas = Object.values(
    dadosFiltrados.reduce((acc: any, item: any) => {
      if (!item.data || !isDespesa(item)) return acc;

      const [ano, mes] = item.data.split("-");
      const mesNumero = Number(mes) - 1;

      const mesNome = meses[mesNumero];

      if (!acc[mesNumero]) {
        acc[mesNumero] = {
          mes: mesNome,
          ordem: mesNumero,
        };

        categoriasDespesas.forEach((cat: any) => {
          acc[mesNumero][cat] = 0;
        });
      }

      const categoria = item.categoria || "Outros";

      acc[mesNumero][categoria] += Number(item.valor || 0);

      return acc;
    }, {}),
  ).sort((a: any, b: any) => a.ordem - b.ordem);

  // ================= TELA =================
  return (
    <div
      id="dashboard-pdf"
      className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10"
    >
      <div className="flex items-center justify-between mb-6">
        {/* ESQUERDA */}
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>

      {/* FILTROS */}
      <div className="flex gap-4 mb-10">
        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado((e.target as any).value)}
          className="bg-[#0f1c33] border px-4 py-2 rounded"
        >
          <option value="">Todos os meses</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("pt-BR", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado((e.target as any).value)}
          className="bg-[#0f1c33] border px-4 py-2 rounded"
        >
          <option value="">Todos os anos</option>
          {[
            ...new Set(dados.map((d: any) => Number(d.data.split("-")[0]))),
          ].map((ano: any) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>

        <select
          value={academiaId}
          onChange={(e) => setAcademiaId(e.target.value)}
          className="bg-[#0f1c33] border px-4 py-2 rounded"
        >
          <option value="">Todas as unidades</option>
          {academias.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>

      {/* ================= KPIs FINANCEIROS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        {/* Receita */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-green-500/20 p-2 rounded-xl">
            <DollarSign className="text-green-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Receita</p>
            <h2 className="text-lg font-bold text-green-300">
              R$ {receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h2>
            {(() => {
              const v = variacao(receita, receitaAnterior);

              return (
                <p
                  className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-green-400" : v < 0 ? "text-red-400" : "text-gray-400"}`}
                >
                  {v > 0 && "▲"}
                  {v < 0 && "▼"}
                  {v.toFixed(1)}% vs mês anterior
                </p>
              );
            })()}
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-xl">
            <TrendingDown className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Despesas</p>
            <h2 className="text-lg font-bold text-red-300">
              R$ {despesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h2>
            {(() => {
              const v = variacao(despesa, despesaAnterior);

              return (
                <p
                  className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-red-400" : v < 0 ? "text-green-400" : "text-gray-400"}`}
                >
                  {v > 0 && "▲"}
                  {v < 0 && "▼"}
                  {v.toFixed(1)}% vs mês anterior
                </p>
              );
            })()}
          </div>
        </div>

        {/* Resultado */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-xl">
            <BarChart3 className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Resultado</p>
            <h2 className="text-lg font-bold text-white">
              R${" "}
              {resultado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h2>
            {(() => {
              const v = variacao(resultado, resultadoAnterior);

              return (
                <p
                  className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-green-400" : v < 0 ? "text-red-400" : "text-gray-400"}`}
                >
                  {v > 0 && "▲"}
                  {v < 0 && "▼"}
                  {v.toFixed(1)}% vs mês anterior
                </p>
              );
            })()}
          </div>
        </div>

        {/* Ticket Medio Total */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl">
            <BarChart3 className="text-indigo-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Ticket Medio Total</p>
            <h2 className="text-lg font-bold text-indigo-300">
              R${" "}
              {ticketFinanceiro.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h2>
          </div>
        </div>
      </div>

      {/* ================= KPIs DE ALUNOS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-10">
        {/* HEALTH SCORE */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-cyan-500/10 flex items-center justify-between relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-3xl"></div>

          <div className="flex items-center gap-3 z-10">
            {/* Ícone */}
            <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-400/20">
              <Gauge className="text-cyan-400 w-5 h-5" />
            </div>

            {/* Texto */}
            <div>
              <p className="text-gray-400 text-sm">⚡ Health Score</p>

              <h2 className="text-2xl font-bold text-cyan-300">
                {healthScore.toFixed(0)}%
              </h2>

              <p
                className={`text-xs mt-1 font-medium
        ${
          healthScore >= 80
            ? "text-green-400"
            : healthScore >= 60
              ? "text-cyan-400"
              : healthScore >= 40
                ? "text-yellow-400"
                : "text-red-400"
        }`}
              >
                {healthScore >= 80
                  ? "Excelente"
                  : healthScore >= 60
                    ? "Saudável"
                    : healthScore >= 40
                      ? "Atenção"
                      : "Crítico"}
              </p>
            </div>
          </div>
        </div>

        {/* Total de Alunos */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <Users className="text-yellow-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total de Alunos</p>
            <h2 className="text-lg font-bold text-white">
              {dadosFiltrados.some(
                (i: any) =>
                  i.sistema_origem === "evo" || i.sistema_origem === "ultra",
              )
                ? alunos.length
                : ativos + cancelados + bloqueados}
            </h2>
          </div>
        </div>

        {/* Ativos */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-green-500/20 p-2 rounded-xl">
            <Users className="text-green-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Ativos</p>
            <h2 className="text-lg font-bold text-green-300">{ativos}</h2>
          </div>
        </div>

        {/* Cancelados */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-xl">
            <Users className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Cancelados</p>
            <h2 className="text-lg font-bold text-red-300">{cancelados}</h2>
          </div>
        </div>

        {/* Bloqueados */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-yellow-500/20 p-2 rounded-xl">
            <Users className="text-yellow-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Bloqueados</p>
            <h2 className="text-lg font-bold text-yellow-300">{bloqueados}</h2>
          </div>
        </div>

        {/* Churn */}
        <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="bg-red-500/20 p-2 rounded-xl">
            <AlertTriangle className="text-red-400 w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Churn</p>
            <h2 className="text-lg font-bold text-red-300">
              {churn.toFixed(1)}%
            </h2>
            {(() => {
              const v = variacao(churn, churnAnterior);

              return (
                <p
                  className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-red-400" : v < 0 ? "text-green-400" : "text-gray-400"}`}
                >
                  {v > 0 && "▲"}
                  {v < 0 && "▼"}
                  {v.toFixed(1)}% vs mês anterior
                </p>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ================= GRÁFICOS ================= */}

      {/* EVOLUÇÃO FINANCEIRA - NOVO PADRÃO */}
      <div id="grafico-evolucao" className="bg-[#0f1c33] p-6 rounded w-full">
        <h2 className="mb-4">Receita vs Despesa vs Resultado</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={dadosEvolucao}
            margin={{ top: 50, right: 20, left: 0, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />

            <XAxis dataKey="mes" stroke="#94a3b8" />
            <YAxis
              stroke="#94a3b8"
              tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              formatter={(v: any) =>
                `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              }
              contentStyle={{
                backgroundColor: "#0a162b",
                border: "none",
                color: "#fff",
              }}
            />

            <Legend />

            {/* RECEITA */}
            <Bar
              dataKey="receita"
              fill="#22c55e"
              name="Receita"
              radius={[6, 6, 0, 0]}
              fillOpacity={0.85}
            >
              <LabelList content={renderLabel} />
            </Bar>

            {/* DESPESA */}
            <Bar
              dataKey="despesa"
              fill="#ef4444"
              name="Despesa"
              radius={[6, 6, 0, 0]}
              fillOpacity={0.85}
            >
              <LabelList content={renderLabel} />
            </Bar>

            {/* RESULTADO */}
            <Bar
              dataKey="resultado"
              fill="#3b82f6"
              name="Resultado"
              radius={[6, 6, 0, 0]}
              fillOpacity={0.85}
            >
              <LabelList content={renderLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ================= HEATMAP ================= */}
      {(() => {
        const mesesFixos = [
          "jan",
          "fev",
          "mar",
          "abr",
          "mai",
          "jun",
          "jul",
          "ago",
          "set",
          "out",
          "nov",
          "dez",
        ];

        const dadosMap = Object.fromEntries(
          dadosGrafico.map((m: any) => [m.mes, m]),
        );

        const maxValor = Math.max(
          ...mesesFixos.flatMap((mes) => {
            const m = dadosMap[mes] || {};
            return [
              m.recorrencia || 0,
              m.cartao || 0,
              m.pix || 0,
              m.boleto || 0,
              m.dinheiro || 0,
            ];
          }),
        );

        function getHeatColor(valor: number) {
          const intensidade = maxValor > 0 ? valor / maxValor : 0;

          if (intensidade > 0.85) return "bg-blue-700";
          if (intensidade > 0.65) return "bg-blue-600";
          if (intensidade > 0.45) return "bg-blue-500";
          if (intensidade > 0.25) return "bg-blue-400";
          if (intensidade > 0.1) return "bg-blue-300";
          return "bg-[#1e293b]";
        }

        return (
          <div className="mt-10">
            <div
              id="grafico-heatmap-receita"
              className="bg-gradient-to-br from-[#0b1220] to-[#0f1c33] p-6 rounded-2xl shadow-lg w-full"
            >
              <h2 className="mb-6 text-lg font-semibold">
                Heatmap de Receita por Origem
              </h2>

              <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-2 text-xs">
                {/* MESES */}
                <div></div>
                {mesesFixos.map((mes) => (
                  <div key={mes} className="text-center text-gray-400">
                    {mes}
                  </div>
                ))}

                {/* RECORRÊNCIA */}
                <div className="text-gray-400 flex items-center">
                  Recorrência
                </div>
                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};
                  return (
                    <div
                      key={mes}
                      className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.recorrencia || 0)}`}
                    >
                      {(m.recorrencia || 0).toLocaleString("pt-BR")}
                    </div>
                  );
                })}

                {/* CARTÃO */}
                <div className="text-gray-400 flex items-center">Cartão</div>
                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};
                  return (
                    <div
                      key={mes}
                      className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.cartao || 0)}`}
                    >
                      {(m.cartao || 0).toLocaleString("pt-BR")}
                    </div>
                  );
                })}

                {/* PIX */}
                <div className="text-gray-400 flex items-center">PIX</div>
                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};
                  return (
                    <div
                      key={mes}
                      className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.pix || 0)}`}
                    >
                      {(m.pix || 0).toLocaleString("pt-BR")}
                    </div>
                  );
                })}

                {/* BOLETO */}
                <div className="text-gray-400 flex items-center">Boleto</div>
                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};
                  return (
                    <div
                      key={mes}
                      className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.boleto || 0)}`}
                    >
                      {(m.boleto || 0).toLocaleString("pt-BR")}
                    </div>
                  );
                })}

                {/* DINHEIRO */}
                <div className="text-gray-400 flex items-center">Dinheiro</div>
                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};
                  return (
                    <div
                      key={mes}
                      className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.dinheiro || 0)}`}
                    >
                      {(m.dinheiro || 0).toLocaleString("pt-BR")}
                    </div>
                  );
                })}

                {/* TOTAL POR MÊS */}
                <div className="text-green-400 flex items-center font-bold">
                  TOTAL
                </div>

                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};

                  const total =
                    (m.recorrencia || 0) +
                    (m.cartao || 0) +
                    (m.pix || 0) +
                    (m.boleto || 0) +
                    (m.dinheiro || 0);

                  return (
                    <div className="h-12 flex items-center justify-center text-green-400 font-bold">
                      {total.toLocaleString("pt-BR")}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ================= HEATMAP DESPESAS ================= */}
      {(() => {
        const mesesFixos = [
          "jan",
          "fev",
          "mar",
          "abr",
          "mai",
          "jun",
          "jul",
          "ago",
          "set",
          "out",
          "nov",
          "dez",
        ];

        const dadosMap = Object.fromEntries(
          dadosDespesas.map((m: any) => [m.mes, m]),
        );

        const maxValor = Math.max(
          ...mesesFixos.flatMap((mes) => {
            const m = dadosMap[mes] || {};
            return categoriasDespesas.map((cat: any) => m[cat] || 0);
          }),
        );

        function getHeatColor(valor: number) {
          const intensidade = maxValor > 0 ? valor / maxValor : 0;

          if (intensidade > 0.85) return "bg-red-700";
          if (intensidade > 0.65) return "bg-red-600";
          if (intensidade > 0.45) return "bg-red-500";
          if (intensidade > 0.25) return "bg-red-400";
          if (intensidade > 0.1) return "bg-red-300";

          return "bg-[#1e293b]";
        }

        return (
          <div className="mt-10">
            <div
              id="grafico-heatmap-despesas"
              className="bg-[#0f1c33] p-6 rounded-2xl shadow-lg w-full max-h-[700px] overflow-y-auto"
            >
              <h2 className="mb-6 text-lg font-semibold text-red-400">
                Heatmap de Despesas por Categoria
              </h2>

              <div className="grid grid-cols-[160px_repeat(12,1fr)] gap-2 text-xs">
                {/* MESES */}
                <div></div>
                {mesesFixos.map((mes) => (
                  <div key={mes} className="text-center text-gray-400">
                    {mes}
                  </div>
                ))}

                {/* LINHAS DINÂMICAS */}
                {categoriasDespesas.map((cat: any) => (
                  <>
                    <div className="text-gray-400 flex items-center">{cat}</div>

                    {mesesFixos.map((mes) => {
                      const m = dadosMap[mes] || {};

                      return (
                        <div
                          className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m[cat] || 0)}`}
                        >
                          {(m[cat] || 0).toLocaleString("pt-BR")}
                        </div>
                      );
                    })}
                  </>
                ))}

                {/* TOTAL POR MÊS */}
                <div className="text-red-400 flex items-center font-bold">
                  TOTAL
                </div>

                {mesesFixos.map((mes) => {
                  const m = dadosMap[mes] || {};

                  const total = categoriasDespesas.reduce(
                    (acc: any, cat: any) => {
                      return acc + (m[cat] || 0);
                    },
                    0,
                  );

                  return (
                    <div className="h-12 flex items-center justify-center text-red-400 font-bold">
                      {total.toLocaleString("pt-BR")}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2 - EVOLUÇÃO DE ALUNOS */}
      <div className="mt-6">
        <div
          id="grafico-alunos"
          className="bg-[#0f172a] rounded-3xl border border-purple-500/20 p-8 w-full"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>

                <div>
                  <h2 className="text-4xl font-bold text-white">
                    Evolução de Alunos
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Visão geral do crescimento da base de alunos
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#1b1033] border border-purple-500/30 rounded-3xl px-8 py-5 min-w-[260px]">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Total de Alunos</p>

                  <h3 className="text-purple-400 text-6xl font-bold mt-2">
                    {dadosAlunos.length > 0
                      ? (dadosAlunos[dadosAlunos.length - 1] as any).ativos +
                        (dadosAlunos[dadosAlunos.length - 1] as any).novos +
                        (dadosAlunos[dadosAlunos.length - 1] as any).recorrencia
                      : 0}
                  </h3>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-lg text-sm font-medium ${
                        crescimentoAlunos >= 0
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {crescimentoAlunos > 0 ? "+" : ""}
                      {crescimentoAlunos.toFixed(1)}%
                    </span>

                    <span className="text-gray-400 text-sm">
                      vs mês anterior
                    </span>
                  </div>
                </div>

                <svg width="90" height="50" viewBox="0 0 90 50" fill="none">
                  <path
                    d="M5 35 C20 10, 35 45, 50 20 S75 25, 85 5"
                    stroke="#a855f7"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={dadosAlunos}
              barGap={25}
              margin={{
                top: 40,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient id="ativosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#065f46" />
                </linearGradient>

                <linearGradient id="novosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#581c87" />
                </linearGradient>

                <linearGradient
                  id="recorrenciaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#1f2a44"
                strokeOpacity={0.25}
                vertical={false}
              />

              <XAxis dataKey="mes" stroke="#94a3b8" />

              <YAxis stroke="#94a3b8" />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #7c3aed",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Legend />

              <Bar
                dataKey="ativos"
                fill="url(#ativosGradient)"
                radius={[12, 12, 0, 0]}
              >
                <LabelList dataKey="ativos" position="top" fill="#ffffff" />
              </Bar>

              <Bar
                dataKey="recorrencia"
                fill="url(#recorrenciaGradient)"
                radius={[12, 12, 0, 0]}
              >
                <LabelList
                  dataKey="recorrencia"
                  position="top"
                  fill="#ffffff"
                />
              </Bar>

              <Bar
                dataKey="novos"
                fill="url(#novosGradient)"
                radius={[12, 12, 0, 0]}
              >
                <LabelList dataKey="novos" position="top" fill="#ffffff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3 - TICKET - MEIDO */}
      <div className="flex flex-col gap-6 mt-6">
        {/* TICKET MEDIO */}
        <div
          id="grafico-ticket"
          className="bg-[#0f172a] rounded-3xl border border-cyan-500/20 p-8 w-full"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">Ticket Médio</h2>

              <p className="text-gray-400 mt-2">
                Histórico mensal do ticket médio
              </p>
            </div>

            <div className="bg-[#0b2345] border border-cyan-500/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-gray-400 text-sm">Média Anual</p>

              <h3 className="text-cyan-400 text-3xl font-bold mt-1">
                R$ {Math.round(ticketFinanceiro)}
              </h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={420}>
            <AreaChart
              data={dadosTicket}
              margin={{
                top: 50,
                right: 30,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e335a" strokeDasharray="3 3" />

              <XAxis dataKey="mes" stroke="#6b87b3" />

              <YAxis stroke="#6b87b3" tickFormatter={(v) => `R$ ${v}`} />

              <Tooltip
                formatter={(v: any) => [
                  `R$ ${Number(v).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}`,
                  "Ticket Médio",
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #06b6d4",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Area
                type="monotone"
                dataKey="ticket"
                stroke="#22d3ee"
                strokeWidth={5}
                fill="url(#ticketGradient)"
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
                  dataKey="ticket"
                  position="top"
                  formatter={(v: any) =>
                    `R$ ${Number(v).toLocaleString("pt-BR", {
                      maximumFractionDigits: 0,
                    })}`
                  }
                  fill="#ffffff"
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CHURN */}
        <div
          id="grafico-churn"
          className="bg-[#0f172a] rounded-3xl border border-red-500/20 p-8 w-full"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Churn Mensal (%)
              </h2>

              <p className="text-gray-400 mt-2">
                Histórico mensal de cancelamentos
              </p>
            </div>

            <div className="bg-[#2a0f14] border border-red-500/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-gray-400 text-sm">Churn Médio</p>

              <h3 className="text-red-400 text-3xl font-bold mt-1">
                {churnMedio.toFixed(1)}%
              </h3>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={420}>
            <AreaChart
              data={dadosChurn}
              margin={{
                top: 50,
                right: 30,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="churnGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis domain={[0, 100]} stroke="#94a3b8" />
              <Tooltip formatter={(v: any) => `${v.toFixed(1)}%`} />
              <Area
                type="monotone"
                dataKey="churn"
                stroke="#ef4444"
                strokeWidth={5}
                fill="url(#churnGradient)"
                dot={{
                  r: 6,
                  fill: "#ef4444",
                  stroke: "#ef4444",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 10,
                  fill: "#ef4444",
                }}
              >
                <LabelList
                  dataKey="churn"
                  position="top"
                  formatter={(v: any) => `${v.toFixed(1)}%`}
                  fill="#ffffff"
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 - RESTANTE */}
      <div className="flex flex-col gap-6 mt-6">
        {/* CUSTOS OPERACIONAIS */}
        <div
          id="grafico-custos"
          className="bg-[#0f172a] rounded-3xl border border-green-500/20 p-8 w-full"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Custos Operacionais
              </h2>

              <p className="text-gray-400 mt-2">Evolução mensal dos custos</p>
            </div>

            <div className="bg-[#0f2a14] border border-green-500/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-gray-400 text-sm">Média de Custos</p>

              <h3 className="text-green-400 text-3xl font-bold mt-1">
                R${" "}
                {Math.round(
                  dadosCustos.reduce((acc, item) => acc + item.despesa, 0) /
                    (dadosCustos.length || 1),
                ).toLocaleString("pt-BR")}
              </h3>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={420}>
            <AreaChart
              data={dadosCustos}
              margin={{
                top: 50,
                right: 30,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="custosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />

              <XAxis dataKey="mes" stroke="#94a3b8" />

              <YAxis
                stroke="#94a3b8"
                tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
              />

              <Tooltip
                formatter={(v: any) => [
                  `R$ ${Number(v).toLocaleString("pt-BR")}`,
                  "Custos",
                ]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #22c55e",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Area
                type="monotone"
                dataKey="despesa"
                stroke="#22c55e"
                strokeWidth={5}
                fill="url(#custosGradient)"
                dot={{
                  r: 6,
                  fill: "#22c55e",
                  stroke: "#22c55e",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 10,
                  fill: "#22c55e",
                }}
              >
                <LabelList
                  dataKey="despesa"
                  position="top"
                  formatter={(v: any) =>
                    `R$ ${Number(v).toLocaleString("pt-BR")}`
                  }
                  fill="#ffffff"
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* MARGEM OPERACIONAL */}
        <div
          id="grafico-margem"
          className="bg-[#0f172a] rounded-3xl border border-purple-500/20 p-8 w-full"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Margem Operacional (%)
              </h2>

              <p className="text-gray-400 mt-2">
                Histórico mensal da margem operacional
              </p>
            </div>

            <div className="bg-[#22123a] border border-purple-500/20 rounded-2xl px-6 py-4 text-center">
              <p className="text-gray-400 text-sm">Margem Média</p>

              <h3 className="text-purple-400 text-3xl font-bold mt-1">
                {(
                  dadosMargem.reduce((acc, item) => acc + item.margem, 0) /
                  (dadosMargem.length || 1)
                ).toFixed(1)}
                %
              </h3>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={420}>
            <AreaChart
              data={dadosMargem}
              margin={{
                top: 50,
                right: 30,
                left: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="margemGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />

              <XAxis dataKey="mes" stroke="#94a3b8" />

              <YAxis stroke="#94a3b8" />

              <Tooltip
                formatter={(v: any) => [`${Number(v).toFixed(1)}%`, "Margem"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #a855f7",
                  borderRadius: "12px",
                  color: "#fff",
                }}
              />

              <Area
                type="monotone"
                dataKey="margem"
                stroke="#a855f7"
                strokeWidth={5}
                fill="url(#margemGradient)"
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
                  dataKey="margem"
                  position="top"
                  formatter={(v: any) => `${Number(v).toFixed(1)}%`}
                  fill="#ffffff"
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
