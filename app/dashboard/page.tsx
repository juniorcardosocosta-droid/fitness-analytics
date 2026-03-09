"use client"

import { useEffect } from "react"
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

export default function Dashboard() {

  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  useEffect(() => {

    const checkUser = async () => {

      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
      }

    }

    checkUser()

  }, [])

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

  const varFat = Number(variacao(faturamentoAtual, faturamentoAnterior))
  const varAlunos = Number(variacao(alunosAtual, alunosAnterior))
  const varNovos = Number(variacao(novosAtual, novosAnterior))
  const varCancel = Number(variacao(cancelAtual, cancelAnterior))

  const ticketMedio = Math.round(faturamentoAtual / alunosAtual)
  const churn = ((cancelAtual / alunosAtual) * 100).toFixed(1)
  const progressoMeta = ((faturamentoAtual / metaFaturamento) * 100).toFixed(1)

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

  let alertas: string[] = []

  if (Number(churn) > 5) alertas.push("⚠ Churn acima do ideal")
  if (varCancel > 0) alertas.push("⚠ Cancelamentos aumentaram")
  if (varFat > 0) alertas.push("📈 Faturamento em crescimento")
  if (varAlunos > 0) alertas.push("👥 Base de alunos em expansão")

  return (

<div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

  <div className="flex justify-between items-center mb-10">

    <h1 className="text-4xl font-bold">
      Analytics Dashboard
    </h1>

    <button
      onClick={logout}
      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
    >
      Logout
    </button>

  </div>

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

{/* RESTO DO DASHBOARD CONTINUA AQUI */}

</div>
)
}