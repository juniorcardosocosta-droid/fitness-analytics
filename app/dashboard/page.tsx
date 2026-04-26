"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"

import {
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from "recharts"

export default function Dashboard() {

  const router = useRouter()

  const [dados, setDados] = useState<any[]>([])
  const [academias, setAcademias] = useState<any[]>([])
  const [academiaId, setAcademiaId] = useState("")

  const [mesSelecionado, setMesSelecionado] = useState("")
  const [anoSelecionado, setAnoSelecionado] = useState("")

  useEffect(() => {
    async function loadAcademias() {
      const { data } = await supabase.from("academias").select("*")

      if (data) {
        setAcademias(data)
        if (data.length === 1) {
          setAcademiaId(data[0].id)
        }
      }
    }

    loadAcademias()
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) router.push("/login")
    }

    checkUser()
  }, [router])

  useEffect(() => {
    async function carregarDados() {
      let query = supabase.from("lancamentos").select("*")

      if (academiaId) {
        query = query.eq("academia_id", academiaId)
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        return
      }

      setDados(data || [])
    }

    carregarDados()
  }, [academiaId])

  // ================= FILTRO =================
  const dadosFiltrados = dados.filter((item: any) => {
    if (!item.data) return false

    const dataItem = new Date(item.data)
    const mes = dataItem.getMonth() + 1
    const ano = dataItem.getFullYear()

    if (mesSelecionado && Number(mesSelecionado) !== mes) return false
    if (anoSelecionado && Number(anoSelecionado) !== ano) return false

    return true
  })

  // ================= INDICADORES =================
  const receitas = dadosFiltrados.filter((i:any)=> i.tipo === "receita")
  const despesasLista = dadosFiltrados.filter((i:any)=> i.tipo === "despesa")

  const receita = receitas.reduce((t,i)=> t + Number(i.valor || 0), 0)
  const despesa = despesasLista.reduce((t,i)=> t + Number(i.valor || 0), 0)
  const resultado = receita - despesa

  // ================= TICKET FINANCEIRO =================
  const totalContratos = receitas.length

  const ticketFinanceiro =
    totalContratos > 0
      ? receita / totalContratos
      : 0

  // ================= TICKET POR ALUNO =================
  const alunosAtivos = dadosFiltrados.filter(
    (i:any) =>
      i.tipo === "receita" &&
      String(i.status_cliente).toLowerCase().includes("ativo")
  ).length

  const ticketAluno =
    alunosAtivos > 0
      ? receita / alunosAtivos
      : 0

  // ================= ALUNOS =================
   const alunos = dadosFiltrados.filter(
     (i:any) => i.tipo === "receita" && i.status_cliente
   )

  // normaliza o texto (evita erro)
  const getStatus = (i:any) =>
    String(i.status_cliente || "").toLowerCase().trim()

  const ativos = alunos.filter((i:any) =>
    getStatus(i).includes("ativo")
  ).length

  const cancelados = alunos.filter((i:any) =>
    getStatus(i).includes("cancel")
  ).length

  const bloqueados = alunos.filter((i:any) =>
    getStatus(i).includes("bloque")
  ).length

  const totalAlunos = alunos.length

  // ================= CHURN =================
  const churn =
    (ativos + cancelados) > 0
      ? (cancelados / (ativos + cancelados)) * 100
      : 0

  // ================= PERÍODO ANTERIOR =================
  const dadosMesAnterior = dados.filter((item:any) => {
    if (!item.data) return false

    const dataItem = new Date(item.data)
    const mes = dataItem.getMonth() + 1
    const ano = dataItem.getFullYear()

    if (!mesSelecionado || !anoSelecionado) return false

    let mesAnterior = Number(mesSelecionado) - 1
    let anoAnterior = Number(anoSelecionado)

    if (mesAnterior === 0) {
    mesAnterior = 12
    anoAnterior--
    }

    return mes === mesAnterior && ano === anoAnterior
  })

  // receita anterior
  const receitaAnterior = dadosMesAnterior
    .filter((i:any)=> i.tipo === "receita")
    .reduce((t,i)=> t + Number(i.valor || 0), 0)

  // ativos anterior
  const ativosAnterior = dadosMesAnterior.filter((i:any)=>
    i.tipo === "receita" &&
    String(i.status_cliente).toLowerCase().includes("ativo")
  ).length

   // cancelados anterior
   const canceladosAnterior = dadosMesAnterior.filter((i:any)=>
     i.tipo === "receita" &&
     String(i.status_cliente).toLowerCase().includes("cancel")
   ).length

   // churn anterior
   const churnAnterior =
     (ativosAnterior + canceladosAnterior) > 0
       ? (canceladosAnterior / (ativosAnterior + canceladosAnterior)) * 100
       : 0    

  // ================= VARIAÇÃO (%) =================
  const variacao = (atual:number, anterior:number) => {
    if (!anterior) return 0
    return ((atual - anterior) / anterior) * 100
  }     

  // ================= GRÁFICO =================
  const dadosGrafico = Object.values(
    dadosFiltrados
      .filter((item: any) => item.tipo === "receita")
      .reduce((acc: any, item: any) => {

        const dataItem = new Date(item.data)
        const mesNumero = dataItem.getMonth()
        const mesNome = dataItem.toLocaleDateString("pt-BR", { month: "short" })

        if (!acc[mesNumero]) {
          acc[mesNumero] = {
            mes: mesNome,
            ordem: mesNumero,
            recorrencia: 0,
            agregador: 0,
            outros: 0,
          }
        }

        const texto = String(item.origem || "").toLowerCase()
        const valor = Number(item.valor || 0)

        if (
          texto.includes("cart") ||
          texto.includes("credito") ||
          texto.includes("debito")
        ) {
          acc[mesNumero].agregador += valor
        } else if (
          texto.includes("pix") ||
          texto.includes("dinheiro")
        ) {
          acc[mesNumero].outros += valor
        } else {
          acc[mesNumero].recorrencia += valor
        }

        return acc

      }, {})
  ).sort((a: any, b: any) => a.ordem - b.ordem)

  // ================= TELA =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

      <h1 className="text-4xl font-bold mb-10">Dashboard</h1>

      {/* FILTROS */}
      <div className="flex gap-4 mb-10">
        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado((e.target as any).value)}
          className="bg-[#0f1c33] border px-4 py-2 rounded"
        >
          <option value="">Todos os meses</option>
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>
              {new Date(0, i).toLocaleString("pt-BR",{month:"long"})}
            </option>
          ))}
        </select>

        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado((e.target as any).value)}
          className="bg-[#0f1c33] border px-4 py-2 rounded"
        >
          <option value="">Todos os anos</option>
          {[...new Set(dados.map((d:any)=> new Date(d.data).getFullYear()))].map((ano:any)=>(
            <option key={ano} value={ano}>{ano}</option>
          ))}
        </select>
      </div>

      {/* ================= KPIs FINANCEIROS ================= */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

  {/* Receita */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Receita</p>
    <h2 className="text-2xl font-bold text-green-300">
      R$ {receita.toLocaleString("pt-BR",{minimumFractionDigits:2})}
    </h2>
    <p className="text-sm text-gray-400">
      {variacao(receita, receitaAnterior).toFixed(1)}% vs mês anterior
    </p>
  </div>

  {/* Despesas */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Despesas</p>
    <h2 className="text-2xl font-bold text-red-300">
      R$ {despesa.toLocaleString("pt-BR",{minimumFractionDigits:2})}
    </h2>
  </div>

  {/* Resultado */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Resultado</p>
    <h2 className={`text-2xl font-bold ${resultado >= 0 ? "text-green-300" : "text-red-300"}`}>
      R$ {resultado.toLocaleString("pt-BR",{minimumFractionDigits:2})}
    </h2>
  </div>

  {/* Ticket Financeiro */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Ticket Financeiro</p>
    <h2 className="text-2xl font-bold text-blue-300">
      R$ {ticketFinanceiro.toLocaleString("pt-BR",{minimumFractionDigits:2})}
    </h2>
  </div>

</div>

{/* ================= KPIs DE ALUNOS ================= */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">

  {/* Ticket Aluno */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Ticket por Aluno</p>
    <h2 className="text-2xl font-bold text-indigo-300">
      R$ {ticketAluno.toLocaleString("pt-BR",{minimumFractionDigits:2})}
    </h2>
  </div>

  {/* Ativos */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Ativos</p>
    <h2 className="text-2xl font-bold text-green-300">
      {ativos}
    </h2>
  </div>

  {/* Cancelados */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Cancelados</p>
    <h2 className="text-2xl font-bold text-red-300">
      {cancelados}
    </h2>
  </div>

  {/* Bloqueados */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Bloqueados</p>
    <h2 className="text-2xl font-bold text-yellow-300">
      {bloqueados}
    </h2>
  </div>

  {/* Churn */}
  <div className="bg-[#0f1c33] p-6 rounded">
    <p className="text-gray-400">Churn</p>
    <h2 className="text-2xl font-bold text-red-300">
      {churn.toFixed(1)}%
    </h2>
    <p className="text-sm text-gray-400">
      {variacao(churn, churnAnterior).toFixed(1)}% vs mês anterior
    </p>
  </div>

</div>

      {/* GRÁFICO */}
      <div className="bg-[#0f1c33] p-6 rounded">

        <h2 className="mb-4">Receitas por Categoria</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dadosGrafico} barGap={10}>

            <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
            <XAxis dataKey="mes" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />

            <Tooltip />
            <Legend />

            <Bar dataKey="outros" fill="#2563eb">
              <LabelList dataKey="outros" position="top" formatter={(v) => Number(v).toLocaleString("pt-BR")} />
            </Bar>

            <Bar dataKey="agregador" fill="#94a3b8">
              <LabelList dataKey="agregador" position="top" formatter={(v) => Number(v).toLocaleString("pt-BR")} />
            </Bar>

            <Bar dataKey="recorrencia" fill="#16a34a">
              <LabelList dataKey="recorrencia" position="top" formatter={(v) => Number(v).toLocaleString("pt-BR")} />
            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  )
}