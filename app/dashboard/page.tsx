"use client"

import { useEffect, } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts"

const dataFinanceiro = [
  { mes: "Jan", faturamento: 20000 },
  { mes: "Fev", faturamento: 28000 },
  { mes: "Mar", faturamento: 32000 },
  { mes: "Abr", faturamento: 41000 },
  { mes: "Mai", faturamento: 39000 },
]

const dataAlunos = [
  { mes: "Jan", alunos: 180 },
  { mes: "Fev", alunos: 210 },
  { mes: "Mar", alunos: 240 },
  { mes: "Abr", alunos: 300 },
  { mes: "Mai", alunos: 320 },
]

const faturamentoAtual = 41000
const faturamentoAnterior = 32000

const alunosAtual = 320
const alunosAnterior = 240

const novosAtual = 40
const novosAnterior = 30

const cancelAtual = 12
const cancelAnterior = 10

const metaFaturamento = 50000

function variacao(atual: number, anterior: number) {
  return (((atual - anterior) / anterior) * 100).toFixed(1)
}

export default function Dashboard() {

  const router = useRouter()

  useEffect(() => {

    const checkUser = async () => {

      const { data } = await supabase.auth.getSession()

      if (!data.session) {
      router.push("/login")
      }

    }

    checkUser()

}, [])

  const varFat = Number(variacao(faturamentoAtual, faturamentoAnterior))
  const varAlunos = Number(variacao(alunosAtual, alunosAnterior))
  const varNovos = Number(variacao(novosAtual, novosAnterior))
  const varCancel = Number(variacao(cancelAtual, cancelAnterior))

  const ticketMedio = Math.round(faturamentoAtual / alunosAtual)
  const churn = ((cancelAtual / alunosAtual) * 100).toFixed(1)
  const progressoMeta = ((faturamentoAtual / metaFaturamento) * 100).toFixed(1)

  // HEALTH SCORE

  let score = 100

  if (Number(churn) > 8) score -= 20
  if (Number(churn) > 12) score -= 20
  if (varCancel > 0) score -= 15
  if (varFat > 0) score += 10

  score = Math.max(0, Math.min(100, score))

  const gaugeData = [
    { name: "score", value: score },
    { name: "resto", value: 100 - score }
  ]

  // ALERTAS DO HEALTH REPORT

  let alertas: string[] = []

  if (Number(churn) > 5) {
    alertas.push("⚠ Churn acima do ideal")
  }

  if (varCancel > 0) {
    alertas.push("⚠ Cancelamentos aumentaram")
  }

  if (varFat > 0) {
    alertas.push("📈 Faturamento em crescimento")
  }

  if (varAlunos > 0) {
    alertas.push("👥 Base de alunos em expansão")
  }

  return (

    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

    {/* FILTROS */}

    <div className="flex gap-4 mb-8">

    <select className="p-3 bg-[#0a162b] rounded-lg">
    <option>Rede</option>
    </select>

    <select className="p-3 bg-[#0a162b] rounded-lg">
    <option>Unidade</option>
    </select>

    <select className="p-3 bg-[#0a162b] rounded-lg">
    <option>Mês</option>
    </select>

    <select className="p-3 bg-[#0a162b] rounded-lg">
    <option>Ano</option>
    </select>

    </div>  

      <h1 className="text-4xl font-bold mb-10">
        Analytics Dashboard
      </h1>


      {/* CARDS PRINCIPAIS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-[#0f1c33] border border-cyan-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Faturamento</p>
          <h2 className="text-3xl font-bold text-cyan-400">
            R$ {faturamentoAtual}
          </h2>
          <p className={`text-sm mt-2 ${varFat >= 0 ? "text-green-400" : "text-red-400"}`}>
            {varFat >= 0 ? "↑" : "↓"} {varFat}% vs mês anterior
          </p>
        </div>

        <div className="bg-[#0f1c33] border border-purple-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Alunos Ativos</p>
          <h2 className="text-3xl font-bold text-purple-400">
            {alunosAtual}
          </h2>
          <p className={`text-sm mt-2 ${varAlunos >= 0 ? "text-green-400" : "text-red-400"}`}>
            {varAlunos >= 0 ? "↑" : "↓"} {varAlunos}% vs mês anterior
          </p>
        </div>

        <div className="bg-[#0f1c33] border border-pink-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Novos Alunos</p>
          <h2 className="text-3xl font-bold text-pink-400">
            {novosAtual}
          </h2>
          <p className={`text-sm mt-2 ${varNovos >= 0 ? "text-green-400" : "text-red-400"}`}>
            {varNovos >= 0 ? "↑" : "↓"} {varNovos}% vs mês anterior
          </p>
        </div>

        <div className="bg-[#0f1c33] border border-yellow-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Cancelamentos</p>
          <h2 className="text-3xl font-bold text-yellow-300">
            {cancelAtual}
          </h2>
          <p className={`text-sm mt-2 ${varCancel <= 0 ? "text-green-400" : "text-red-400"}`}>
            {varCancel >= 0 ? "↑" : "↓"} {varCancel}% vs mês anterior
          </p>
        </div>

      </div>


      {/* INDICADORES */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-[#0f1c33] border border-blue-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Ticket Médio</p>
          <h2 className="text-3xl font-bold text-blue-400">
            R$ {ticketMedio}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Receita por aluno
          </p>
        </div>

        <div className="bg-[#0f1c33] border border-red-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Churn Rate</p>
          <h2 className="text-3xl font-bold text-red-400">
            {churn}%
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Taxa de cancelamento
          </p>
        </div>

        <div className="bg-[#0f1c33] border border-green-400/20 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Meta de Faturamento</p>
          <h2 className="text-3xl font-bold text-green-400">
            {progressoMeta}%
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Progresso da meta
          </p>
        </div>

      </div>


      {/* HEALTH SCORE + REPORT */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        <div className="bg-[#0f1c33] border border-green-400/20 rounded-xl p-8">

          <h2 className="text-xl text-green-400 mb-4">
            Academy Health Score
          </h2>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={gaugeData}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
              >
                <Cell fill="#22c55e" />
                <Cell fill="#1f2937" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="text-center mt-4">

            <p className="text-4xl font-bold text-green-400">
              {score}
            </p>

            <p className="text-gray-400 text-sm">
              Health Score
            </p>

          </div>

        </div>


        <div className="bg-[#0f1c33] border border-cyan-400/20 rounded-xl p-8">

          <h2 className="text-xl text-cyan-400 mb-4">
            Health Report
          </h2>

          <div className="space-y-3 text-gray-300">

            {alertas.map((alerta, index) => (
              <p key={index}>{alerta}</p>
            ))}

          </div>

        </div>

      </div>


      {/* GRÁFICOS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="bg-[#0f1c33] p-6 rounded-xl border border-cyan-400/20">

          <h2 className="text-xl mb-4 text-cyan-300">
            Evolução do Faturamento
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dataFinanceiro}>
              <XAxis dataKey="mes" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="#22d3ee"
                fill="#22d3ee40"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>

        </div>


        <div className="bg-[#0f1c33] p-6 rounded-xl border border-purple-400/20">

          <h2 className="text-xl mb-4 text-purple-300">
            Evolução de Alunos
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataAlunos}>
              <XAxis dataKey="mes" stroke="#aaa"/>
              <YAxis stroke="#aaa"/>
              <Tooltip />
              <Line
                type="monotone"
                dataKey="alunos"
                stroke="#a855f7"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>

    </div>

  )

}