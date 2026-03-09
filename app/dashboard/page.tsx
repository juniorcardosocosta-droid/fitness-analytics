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

  useEffect(() => {

    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
      }
    }

    checkUser()

  }, [router])


  const alunosData = [
    { mes: "Jan", alunos: 180 },
    { mes: "Fev", alunos: 210 },
    { mes: "Mar", alunos: 240 },
    { mes: "Abr", alunos: 300 },
    { mes: "Mai", alunos: 320 },
  ]

  const faturamentoData = [
    { mes: "Jan", valor: 20000 },
    { mes: "Fev", valor: 28000 },
    { mes: "Mar", valor: 32000 },
    { mes: "Abr", valor: 41000 },
    { mes: "Mai", valor: 39000 },
  ]

  const cancelamentosData = [
    { name: "Ativos", value: 308 },
    { name: "Cancelados", value: 12 },
  ]

  const COLORS = ["#22c55e", "#ef4444"]

  return (

<div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

<h1 className="text-4xl font-bold mb-10">
Analytics Dashboard
</h1>

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-[#0f1c33] p-6 rounded-xl">
<h2 className="text-xl mb-4">Evolução de Alunos</h2>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={alunosData}>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Line
type="monotone"
dataKey="alunos"
stroke="#22d3ee"
strokeWidth={3}
/>
</LineChart>
</ResponsiveContainer>

</div>


<div className="bg-[#0f1c33] p-6 rounded-xl">
<h2 className="text-xl mb-4">Evolução do Faturamento</h2>

<ResponsiveContainer width="100%" height={300}>
<AreaChart data={faturamentoData}>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Area
type="monotone"
dataKey="valor"
stroke="#22c55e"
fill="#22c55e33"
strokeWidth={3}
/>
</AreaChart>
</ResponsiveContainer>

</div>


<div className="bg-[#0f1c33] p-6 rounded-xl">
<h2 className="text-xl mb-4">Cancelamentos</h2>

<ResponsiveContainer width="100%" height={300}>
<PieChart>
<Pie
data={cancelamentosData}
dataKey="value"
nameKey="name"
outerRadius={100}
label
>
{cancelamentosData.map((entry, index) => (
<Cell key={index} fill={COLORS[index]} />
))}
</Pie>
<Tooltip/>
</PieChart>
</ResponsiveContainer>

</div>

</div>

</div>

  )
}