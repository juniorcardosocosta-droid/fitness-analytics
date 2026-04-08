"use client"

import { useEffect, useState } from "react"
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
 const [dadosApi, setDadosApi] = useState<any>(null)
 const [mesSelecionado, setMesSelecionado] = useState("")
 const [mesAplicado, setMesAplicado] = useState("")

 useEffect(() => {
  const checkUser = async () => {
   const { data } = await supabase.auth.getSession()
   if (!data.session) {
    router.push("/login")
   }
  }
  checkUser()
 }, [router])

 useEffect(() => {
  async function carregarDados() {

    const { data, error } = await supabase
      .from("dados_mensais")
      .select("*")

    if (error) {
      console.error(error)
      return
    }

    setDadosApi({ data })
  }

  carregarDados()
}, [])


 // DADOS

 const hoje = new Date()

const mesAtual = hoje.getMonth() + 1
const anoAtual = hoje.getFullYear()

const mesFiltro = mesAplicado ? Number(mesAplicado) : mesAtual

const dadosFiltrados = dadosApi?.data?.filter((item: any) => {
  if (!item.mes || !item.ano) return false

  return item.mes === mesFiltro && item.ano === anoAtual
}) || []

const faturamento = dadosFiltrados.reduce((total: any, item: any) => {
  return total + Number(item.faturamento || 0)
}, 0) 
 const faturamentoAnterior = 32000

 const alunos = 320
 const alunosAnterior = 240

 const novos = 40
 const novosAnterior = 30

 const cancelamentos = 12
 const cancelAnterior = 10


 // FUNÇÃO VARIAÇÃO %

 const variacao = (atual:number, anterior:number) => {
  return (((atual - anterior) / anterior) * 100).toFixed(1)
 }

 const varFat = Number(variacao(faturamento, faturamentoAnterior))
 const varAlunos = Number(variacao(alunos, alunosAnterior))
 const varNovos = Number(variacao(novos, novosAnterior))
 const varCancel = Number(variacao(cancelamentos, cancelAnterior))


 // OUTROS INDICADORES

 const ticketMedio = (faturamento / alunos).toFixed(2)
 const churn = ((cancelamentos / alunos) * 100).toFixed(1)
 const healthScore = 82


 // DADOS GRÁFICOS

 const alunosData = [
  { mes:"Jan", alunos:180 },
  { mes:"Fev", alunos:210 },
  { mes:"Mar", alunos:240 },
  { mes:"Abr", alunos:300 },
  { mes:"Mai", alunos:320 },
 ]

 const faturamentoData = [
  { mes:"Jan", valor:20000 },
  { mes:"Fev", valor:28000 },
  { mes:"Mar", valor:32000 },
  { mes:"Abr", valor:41000 },
  { mes:"Mai", valor:39000 },
 ]

 const cancelamentosData = [
  { name:"Ativos", value:308 },
  { name:"Cancelados", value:12 }
 ]

 const COLORS = ["#22c55e","#ef4444"]


 return (

<div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">


<div className="flex justify-between items-center mb-10">

<h1 className="text-4xl font-bold">
Analytics Dashboard
</h1>

<button
onClick={async () => {
 await supabase.auth.signOut()
 router.push("/login")
}}
className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
>
Sair
</button>

</div>

<div className="flex flex-wrap items-center gap-4 mb-10">

<select className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg">
<option>Academia</option>
<option>Rede Alpha</option>
<option>Rede Beta</option>
</select>

<select className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg">
<option>Unidade</option>
<option>Matriz</option>
<option>Filial 1</option>
<option>Filial 2</option>
</select>

<select
  value={mesSelecionado}
  onChange={(e) => setMesSelecionado(e.target.value)}
  className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg"
>
  <option value="">Mês (Automático)</option>
  <option value="01">Janeiro</option>
  <option value="02">Fevereiro</option>
  <option value="03">Março</option>
  <option value="04">Abril</option>
  <option value="05">Maio</option>
  <option value="06">Junho</option>
  <option value="07">Julho</option>
  <option value="08">Agosto</option>
  <option value="09">Setembro</option>
  <option value="10">Outubro</option>
  <option value="11">Novembro</option>
  <option value="12">Dezembro</option>
</select>

<select className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg">
<option>Ano</option>
<option>2024</option>
<option>2025</option>
<option>2026</option>
</select>

<button
  onClick={() => setMesAplicado(mesSelecionado)}
  className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg"
>
  Filtrar
</button>

</div>


{/* KPI CARDS */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

{/* FATURAMENTO */}

<div className="bg-[#0f1c33] p-6 rounded-xl">

<p className="text-gray-400 text-sm">
Faturamento
</p>

<h2 className="text-3xl font-bold text-green-400">
R$ {faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
</h2>

<p className={`text-sm mt-2 ${varFat >= 0 ? "text-green-400":"text-red-400"}`}>
{varFat >= 0 ? "↑":"↓"} {varFat}% vs mês anterior
</p>

</div>


{/* ALUNOS */}

<div className="bg-[#0f1c33] p-6 rounded-xl">

<p className="text-gray-400 text-sm">
Alunos Ativos
</p>

<h2 className="text-3xl font-bold text-cyan-400">
{alunos}
</h2>

<p className={`text-sm mt-2 ${varAlunos >= 0 ? "text-green-400":"text-red-400"}`}>
{varAlunos >= 0 ? "↑":"↓"} {varAlunos}% vs mês anterior
</p>

</div>


{/* NOVOS */}

<div className="bg-[#0f1c33] p-6 rounded-xl">

<p className="text-gray-400 text-sm">
Novos Alunos
</p>

<h2 className="text-3xl font-bold text-purple-400">
{novos}
</h2>

<p className={`text-sm mt-2 ${varNovos >= 0 ? "text-green-400":"text-red-400"}`}>
{varNovos >= 0 ? "↑":"↓"} {varNovos}% vs mês anterior
</p>

</div>


{/* CANCELAMENTOS */}

<div className="bg-[#0f1c33] p-6 rounded-xl">

<p className="text-gray-400 text-sm">
Cancelamentos
</p>

<h2 className="text-3xl font-bold text-red-400">
{cancelamentos}
</h2>

<p className={`text-sm mt-2 ${varCancel <= 0 ? "text-green-400":"text-red-400"}`}>
{varCancel >= 0 ? "↑":"↓"} {varCancel}% vs mês anterior
</p>

</div>

</div>


{/* SEGUNDA LINHA KPI */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Ticket Médio</p>
<h2 className="text-3xl font-bold text-blue-400">
R$ {ticketMedio}
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Churn</p>
<h2 className="text-3xl font-bold text-yellow-400">
{churn}%
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Meta</p>
<h2 className="text-3xl font-bold text-indigo-400">
82%
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Health Score</p>
<h2 className="text-3xl font-bold text-green-300">
{healthScore}
</h2>
</div>

</div>


{/* GRÁFICOS */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">


<div className="bg-[#0f1c33] p-6 rounded-xl">

<h2 className="text-xl mb-4">
Evolução de Alunos
</h2>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={alunosData}>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Line type="monotone" dataKey="alunos" stroke="#22d3ee" strokeWidth={3}/>
</LineChart>
</ResponsiveContainer>

</div>


<div className="bg-[#0f1c33] p-6 rounded-xl">

<h2 className="text-xl mb-4">
Evolução do Faturamento
</h2>

<ResponsiveContainer width="100%" height={300}>
<AreaChart data={faturamentoData}>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Area type="monotone" dataKey="valor" stroke="#22c55e" fill="#22c55e33" strokeWidth={3}/>
</AreaChart>
</ResponsiveContainer>

</div>

</div>


{/* CANCELAMENTOS + EVOLUÇÃO */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

{/* EVOLUÇÃO CANCELAMENTOS */}

<div className="bg-[#0f1c33] p-6 rounded-xl">

<h2 className="text-xl mb-4">
Evolução Cancelamentos
</h2>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={[
{ mes:"Jan", cancel:5 },
{ mes:"Fev", cancel:7 },
{ mes:"Mar", cancel:8 },
{ mes:"Abr", cancel:10 },
{ mes:"Mai", cancel:12 },
]}>
<XAxis dataKey="mes"/>
<YAxis/>
<Tooltip/>
<Line
type="monotone"
dataKey="cancel"
stroke="#ef4444"
strokeWidth={3}
/>
</LineChart>
</ResponsiveContainer>

</div>


{/* CANCELAMENTOS */}

<div className="bg-[#0f1c33] p-6 rounded-xl">

<h2 className="text-xl mb-4">
Cancelamentos
</h2>

<ResponsiveContainer width="100%" height={300}>
<PieChart>
<Pie data={cancelamentosData} dataKey="value" nameKey="name" outerRadius={100} label>
{cancelamentosData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index]} />
))}
</Pie>
<Tooltip/>
</PieChart>
</ResponsiveContainer>

</div>

</div>

</div>

);
}