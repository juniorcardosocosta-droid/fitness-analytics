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
  ResponsiveContainer
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


  const data = [
    { mes: "Jan", alunos: 180 },
    { mes: "Fev", alunos: 210 },
    { mes: "Mar", alunos: 240 },
    { mes: "Abr", alunos: 300 },
    { mes: "Mai", alunos: 320 },
  ]

  return (

<div className="min-h-screen bg-[#050b18] text-white p-10">

<h1 className="text-4xl font-bold mb-10">
Analytics Dashboard
</h1>

<div className="bg-[#0f1c33] p-6 rounded-xl">

<h2 className="text-xl mb-4">
Evolução de Alunos
</h2>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={data}>
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

</div>

  )
}