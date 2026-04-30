"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import { ComposedChart } from "recharts"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList
} from "recharts"

import {
  DollarSign,
  TrendingDown,
  BarChart3,
  Users,
  AlertTriangle
} from "lucide-react"

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

    const [anoStr, mesStr] = item.data.split("-")

    const ano = Number(anoStr)
    const mes = Number(mesStr)

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

     const [anoStr, mesStr] = item.data.split("-")

     const ano = Number(anoStr)
     const mes = Number(mesStr)

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

  // despesa anterior
  const despesaAnterior = dadosMesAnterior
    .filter((i:any)=> i.tipo === "despesa")
    .reduce((t,i)=> t + Number(i.valor || 0), 0)

  // resultado anterior
  const resultadoAnterior = receitaAnterior - despesaAnterior  

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

        const [ano, mes] = item.data.split("-")
        const mesNumero = Number(mes) - 1

        const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
        const mesNome = meses[mesNumero]

        if (!acc[mesNumero]) {
          acc[mesNumero] = {
            mes: mesNome,
            ordem: mesNumero,
            recorrencia: 0,
            cartao: 0,
            pix: 0,
            boleto: 0,
            dinheiro: 0,
            
          }
        }

        const texto = String(item.origem || "").toLowerCase()
const valor = Number(item.valor || 0)

if (
  texto.includes("cart") ||
  texto.includes("credito") ||
  texto.includes("debito")
) {
  acc[mesNumero].cartao += valor
}
else if (texto.includes("pix")) {
  acc[mesNumero].pix += valor
}
else if (texto.includes("boleto")) {
  acc[mesNumero].boleto += valor
}
else if (texto.includes("dinheiro")) {
  acc[mesNumero].dinheiro += valor
}
else {
  acc[mesNumero].recorrencia += valor
}

        return acc

      }, {})
  ).sort((a: any, b: any) => a.ordem - b.ordem)

  // ================= % PARA GRÁFICO =================
  const dadosPercentuais = dadosGrafico.map((m:any) => {
  const total =
    m.recorrencia +
    m.cartao +
    m.pix +
    m.boleto +
    m.dinheiro

  return {
    mes: m.mes,
    recorrencia: total ? (m.recorrencia / total) * 100 : 0,
    cartao: total ? (m.cartao / total) * 100 : 0,
    pix: total ? (m.pix / total) * 100 : 0,
    boleto: total ? (m.boleto / total) * 100 : 0,
    dinheiro: total ? (m.dinheiro / total) * 100 : 0,
  }
})

  // ================= GRÁFICO DE ALUNOS =================
  const dadosAlunos = Object.values(
     dadosFiltrados.reduce((acc:any, item:any) => {

       if (!item.data) return acc

       const [ano, mes] = item.data.split("-")
       const mesNumero = Number(mes) - 1

       const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
       const mesNome = meses[mesNumero]

       if (!acc[mesNumero]) {
         acc[mesNumero] = {
           mes: mesNome,
           ordem: mesNumero,
           ativos: 0,
           recorrencia: 0,
           novos: 0
         }
       }

       if (item.tipo === "receita") {

      const status = String(item.status_cliente || "").toLowerCase()

      acc[mesNumero].ativos++

      if (status.includes("ativo")) {
        acc[mesNumero].recorrencia++
      }

      if (status.includes("novo")) {
        acc[mesNumero].novos++
      }
    }

    return acc

  }, {})
).sort((a:any,b:any)=> a.ordem - b.ordem)

   // ================= GRÁFICO DE CHURN =================
const dadosChurn = Object.values(
  dadosFiltrados.reduce((acc:any, item:any) => {

    if (!item.data) return acc

    const [ano, mes] = item.data.split("-")
    const mesNumero = Number(mes) - 1

    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
    const mesNome = meses[mesNumero]

    if (!acc[mesNumero]) {
      acc[mesNumero] = {
        mes: mesNome,
        ordem: mesNumero,
        ativos: 0,
        cancelados: 0
      }
    }

    if (item.tipo === "receita") {
      const status = String(item.status_cliente || "").toLowerCase()

      if (status.includes("ativo")) {
        acc[mesNumero].ativos++
      }

      if (status.includes("cancel")) {
        acc[mesNumero].cancelados++
      }
    }

    return acc

  }, {})
).map((m:any) => {
  const total = m.ativos + m.cancelados

  return {
    ...m,
    churn: total > 0 ? (m.cancelados / total) * 100 : 0
  }
}).sort((a:any,b:any)=> a.ordem - b.ordem)

// ================= GRÁFICO EVOLUÇAÕ FINANCEIRA =================
const dadosEvolucao = Object.values(
  dadosFiltrados.reduce((acc:any, item:any) => {

    if (!item.data) return acc

    const [ano, mes] = item.data.split("-")
    const mesNumero = Number(mes) - 1

    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
    const mesNome = meses[mesNumero]

    if (!acc[mesNumero]) {
      acc[mesNumero] = {
        mes: mesNome,
        ordem: mesNumero,
        receita: 0,
        despesa: 0,
        resultado: 0
      }
    }

    if (item.tipo === "receita") {
      acc[mesNumero].receita += Number(item.valor || 0)
    }

    if (item.tipo === "despesa") {
      acc[mesNumero].despesa += Number(item.valor || 0)
    }

    acc[mesNumero].resultado =
      acc[mesNumero].receita - acc[mesNumero].despesa

    return acc

  }, {})
).sort((a:any,b:any)=> a.ordem - b.ordem)

// ================= GRÁFICO EVOLUÇAÕ DO TICKET MEDIO EFETIVO =================
const dadosTicket = Object.values(
  dadosFiltrados.reduce((acc:any, item:any) => {

    if (!item.data) return acc

    const [ano, mes] = item.data.split("-")
    const mesNumero = Number(mes) - 1

    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
    const mesNome = meses[mesNumero]

    if (!acc[mesNumero]) {
      acc[mesNumero] = {
        mes: mesNome,
        ordem: mesNumero,
        recorrencia: 0,
        agregador: 0,
        countRec: 0,
        countAgr: 0
      }
    }

    const texto = String(item.origem || "").toLowerCase()
const valor = Number(item.valor || 0)

// agregador
if (
  texto.includes("cart") ||
  texto.includes("credito") ||
  texto.includes("debito")
) {
  acc[mesNumero].agregador += valor
  acc[mesNumero].countAgr += 1
}

// outros (pix/dinheiro) → você pode ignorar no ticket médio ou incluir
else if (
  texto.includes("pix") ||
  texto.includes("dinheiro")
) {
  // opcional: pode tratar como agregador se quiser
}

// recorrência (todo resto)
else {
  acc[mesNumero].recorrencia += valor
  acc[mesNumero].countRec += 1
}

    return acc

  }, {})
).map((m:any) => ({
  ...m,
  recorrencia:
    m.countRec > 0 ? m.recorrencia / m.countRec : 0,
  agregador:
    m.countAgr > 0 ? m.agregador / m.countAgr : 0
}))
.sort((a:any,b:any)=> a.ordem - b.ordem)

const categoriasDespesas = dadosFiltrados
  .filter((i:any) => i.tipo === "despesa")
  .map((i:any) => i.categoria || "Outros")
  .filter((v, i, arr) => arr.indexOf(v) === i)

  const dadosDespesas = Object.values(
  dadosFiltrados.reduce((acc:any, item:any) => {

    if (!item.data || item.tipo !== "despesa") return acc

    const [ano, mes] = item.data.split("-")
    const mesNumero = Number(mes) - 1

    const meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]
    const mesNome = meses[mesNumero]

    if (!acc[mesNumero]) {
      acc[mesNumero] = {
        mes: mesNome,
        ordem: mesNumero
      }

      categoriasDespesas.forEach((cat:any)=>{
        acc[mesNumero][cat] = 0
      })
    }

    const categoria = item.categoria || "Outros"
    const valor = Number(item.valor || 0)

    acc[mesNumero][categoria] += valor

    return acc

  }, {})
).sort((a:any,b:any)=> a.ordem - b.ordem)

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
        {[...new Set(dados.map((d:any)=> Number(d.data.split("-")[0])))]
          .map((ano:any)=>(
            <option key={ano} value={ano}>{ano}</option>
        ))}
      </select>

      <select
        value={academiaId}
        onChange={(e) => setAcademiaId(e.target.value)}
        className="bg-[#0f1c33] border px-4 py-2 rounded"
      >
        <option value="">Todas as unidades</option>
        {academias.map((a:any) => (
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
        R$ {receita.toLocaleString("pt-BR",{minimumFractionDigits:2})}
      </h2>
       {(() => {
      const v = variacao(receita, receitaAnterior)

      return (
        <p className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-green-400" : v < 0 ? "text-red-400" : "text-gray-400"}`}>

          {v > 0 && "▲"}
          {v < 0 && "▼"}

          {v.toFixed(1)}% vs mês anterior
        </p>
      )
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
        R$ {despesa.toLocaleString("pt-BR",{minimumFractionDigits:2})}
      </h2>
      {(() => {
      const v = variacao(despesa, despesaAnterior)

      return (
        <p className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-red-400" : v < 0 ? "text-green-400" : "text-gray-400"}`}>

          {v > 0 && "▲"}
          {v < 0 && "▼"}

          {v.toFixed(1)}% vs mês anterior
        </p>
      )
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
        R$ {resultado.toLocaleString("pt-BR",{minimumFractionDigits:2})}
      </h2>
       {(() => {
      const v = variacao(resultado, resultadoAnterior)

      return (
        <p className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-green-400" : v < 0 ? "text-red-400" : "text-gray-400"}`}>

          {v > 0 && "▲"}
          {v < 0 && "▼"}

          {v.toFixed(1)}% vs mês anterior
        </p>
      )
    })()}
    </div>
  </div>

  {/* Ticket Financeiro */}
  <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
    <div className="bg-indigo-500/20 p-2 rounded-xl">
      <BarChart3 className="text-indigo-400 w-5 h-5" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">Ticket Financeiro</p>
      <h2 className="text-lg font-bold text-indigo-300">
        R$ {ticketFinanceiro.toLocaleString("pt-BR",{minimumFractionDigits:2})}
      </h2>
    </div>
  </div>

</div>

{/* ================= KPIs DE ALUNOS ================= */}
<div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-10">

  {/* Ticket por Aluno */}
  <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
    <div className="bg-indigo-500/20 p-2 rounded-xl">
      <Users className="text-indigo-400 w-5 h-5" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">Ticket por Aluno</p>
      <h2 className="text-lg font-bold text-indigo-300">
        R$ {ticketAluno.toLocaleString("pt-BR",{minimumFractionDigits:2})}
      </h2>
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
        {ativos + cancelados + bloqueados}
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
      const v = variacao(churn, churnAnterior)

      return (
        <p className={`text-xs font-medium flex items-center gap-1 
          ${v > 0 ? "text-red-400" : v < 0 ? "text-green-400" : "text-gray-400"}`}>

          {v > 0 && "▲"}
          {v < 0 && "▼"}

          {v.toFixed(1)}% vs mês anterior
        </p>
      )
    })()}
    </div>
  </div>

</div>

      {/* ================= GRID DE GRÁFICOS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

        {/* GRÁFICO 1 */}
        <div className="bg-[#0f1c33] p-6 rounded w-full" style={{ minHeight: 350 }}>
          <h2 className="mb-4">Receitas por Categoria</h2>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={dadosGrafico} barGap={10}>
              <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />

              <Bar dataKey="outros" fill="#2563eb">
                <LabelList dataKey="outros" position="top" 
                 formatter={(v:any)=> Number(v).toLocaleString("pt-BR",{maximumFractionDigits:2})}
                 fill="#ffffff"
                />
              </Bar>

              <Bar dataKey="agregador" fill="#94a3b8">
                <LabelList dataKey="agregador" position="top" 
                formatter={(v:any)=> Number(v).toLocaleString("pt-BR",{maximumFractionDigits:2})}
                fill="#ffffff"
                />
              </Bar>

              <Bar dataKey="recorrencia" fill="#16a34a">
                <LabelList dataKey="recorrencia" position="top" 
                formatter={(v:any)=> Number(v).toLocaleString("pt-BR",{maximumFractionDigits:2})}
                fill="#ffffff"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO 2 */}
        <div className="bg-[#0f1c33] p-6 rounded w-full" style={{ minHeight: 350 }}>
          <h2 className="mb-4">Composição da Receita (%)</h2>

          <ResponsiveContainer width="100%" height={350}>
  <ComposedChart data={dadosPercentuais}>

    <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />

    <XAxis dataKey="mes" stroke="#94a3b8" />
    <YAxis stroke="#94a3b8" domain={[0, 100]} />

    <Tooltip />
    <Legend />

    {/* BARRAS */}
    <Bar dataKey="recorrencia" stackId="a" fill="#14b8a6" />
    <Bar dataKey="cartao" stackId="a" fill="#3b82f6" />
    <Bar dataKey="pix" stackId="a" fill="#22c55e" />
    <Bar dataKey="boleto" stackId="a" fill="#eab308" />
    <Bar dataKey="dinheiro" stackId="a" fill="#a3a3a3" />

    {/* 🔥 LINHA (VOLTA DO JEITO CERTO) */}
    <Line
      type="monotone"
      dataKey="cartao"
      stroke="#ffffff"
      strokeWidth={3}
      dot={{ r: 4 }}
    />

  </ComposedChart>
</ResponsiveContainer>
        </div>

        {/* GRÁFICO 3 - ALUNOS */}
<div className="bg-[#0f1c33] p-6 rounded w-full" style={{ minHeight: 350 }}>
  <h2 className="mb-4">Evolução de Alunos</h2>

  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={dadosAlunos} barGap={10}>
      <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
      <XAxis dataKey="mes" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip />
      <Legend />

      <Bar dataKey="ativos" fill="#22c55e" name="Ativos">
        <LabelList dataKey="ativos" position="top" fill="#ffffff" />
      </Bar>

      <Bar dataKey="recorrencia" fill="#3b82f6" name="Recorrência">
        <LabelList dataKey="recorrencia" position="top" fill="#ffffff" />
      </Bar>

      <Bar dataKey="novos" fill="#a855f7" name="Novos">
        <LabelList dataKey="novos" position="top" fill="#ffffff" />
      </Bar>

    </BarChart>
  </ResponsiveContainer>
</div>

{/* GRÁFICO 4 - CHURN */}
<div className="bg-[#0f1c33] p-6 rounded w-full" style={{ minHeight: 350 }}>
  <h2 className="mb-4">Churn Mensal (%)</h2>

  <ResponsiveContainer width="100%" height={350}>
    <BarChart data={dadosChurn}>
      <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
      <XAxis dataKey="mes" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" domain={[0, 100]} />
      <Tooltip formatter={(v:any)=> `${v.toFixed(1)}%`} />
      <Legend />

      <Bar dataKey="churn" fill="#ef4444" name="Churn (%)">
        <LabelList
          dataKey="churn"
          position="top"
          formatter={(v:any)=> `${v.toFixed(1)}%`}
          fill="#ffffff"
        />
      </Bar>

    </BarChart>
  </ResponsiveContainer>
</div>

{/* GRÁFICO NOVO - EVOLUÇÃO FINANCEIRA */}
<div className="bg-[#0f1c33] p-6 rounded w-full" style={{ minHeight: 350 }}>

  <h2 className="mb-4">Evolução Financeira</h2>

  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={dadosEvolucao}>

      <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />

      <XAxis dataKey="mes" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />

      <Tooltip />
      <Legend />

      <Line
        type="monotone"
        dataKey="receita"
        stroke="#22c55e"
        strokeWidth={3}
      />

      <Line
        type="monotone"
        dataKey="despesa"
        stroke="#ef4444"
        strokeWidth={3}
      />

      <Line
        type="monotone"
        dataKey="resultado"
        stroke="#3b82f6"
        strokeWidth={3}
      />

    </LineChart>
  </ResponsiveContainer>

</div>

{/* EVOLUÇÃO DO TICKET MÉDIO */}
<div className="bg-[#0f1c33] p-6 rounded w-full" style={{ minHeight: 350 }}>

  <h2 className="mb-4">
    Evolução do Ticket Médio (R$)
  </h2>

  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={dadosTicket}>

      <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />

      <XAxis dataKey="mes" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />

      <Tooltip
        formatter={(value:any)=> 
          `R$ ${Number(value).toFixed(2)}`
        }
      />

      <Legend />

      {/* RECORRÊNCIA */}
      <Line
        type="monotone"
        dataKey="recorrencia"
        stroke="#9ca3af"
        strokeWidth={3}
        dot={{ r: 4 }}
      />

      {/* AGREGADOR */}
      <Line
        type="monotone"
        dataKey="agregador"
        stroke="#3b82f6"
        strokeWidth={3}
        dot={{ r: 4 }}
      />

    </LineChart>
  </ResponsiveContainer>

</div>

      </div>

      {/* ================= HEATMAP ================= */}
{(() => {

  const mesesFixos = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]

  const dadosMap = Object.fromEntries(
    dadosGrafico.map((m:any) => [m.mes, m])
  )

  const maxValor = Math.max(
    ...mesesFixos.flatMap((mes) => {
      const m = dadosMap[mes] || {}
      return [
        m.recorrencia || 0,
        m.cartao || 0,
        m.pix || 0,
        m.boleto || 0,
        m.dinheiro || 0
      ]
    })
  )

  function getHeatColor(valor:number) {
    const intensidade = maxValor > 0 ? valor / maxValor : 0

    if (intensidade > 0.85) return "bg-blue-700"
    if (intensidade > 0.65) return "bg-blue-600"
    if (intensidade > 0.45) return "bg-blue-500"
    if (intensidade > 0.25) return "bg-blue-400"
    if (intensidade > 0.1) return "bg-blue-300"
    return "bg-[#1e293b]"
  }

  return (
    <div className="mt-10">
      <div className="bg-gradient-to-br from-[#0b1220] to-[#0f1c33] p-6 rounded-2xl shadow-lg w-full">

        <h2 className="mb-6 text-lg font-semibold">
          Heatmap de Receita por Origem
        </h2>

        <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-2 text-xs">

          {/* MESES */}
          <div></div>
          {mesesFixos.map((mes)=>(
            <div key={mes} className="text-center text-gray-400">
              {mes}
            </div>
          ))}

          {/* RECORRÊNCIA */}
          <div className="text-gray-400 flex items-center">Recorrência</div>
          {mesesFixos.map((mes)=>{
            const m = dadosMap[mes] || {}
            return (
              <div key={mes} className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.recorrencia || 0)}`}>
                {(m.recorrencia || 0).toLocaleString("pt-BR")}
              </div>
            )
          })}

          {/* CARTÃO */}
          <div className="text-gray-400 flex items-center">Cartão</div>
          {mesesFixos.map((mes)=>{
            const m = dadosMap[mes] || {}
            return (
              <div key={mes} className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.cartao || 0)}`}>
                {(m.cartao || 0).toLocaleString("pt-BR")}
              </div>
            )
          })}

          {/* PIX */}
          <div className="text-gray-400 flex items-center">PIX</div>
          {mesesFixos.map((mes)=>{
            const m = dadosMap[mes] || {}
            return (
              <div key={mes} className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.pix || 0)}`}>
                {(m.pix || 0).toLocaleString("pt-BR")}
              </div>
            )
          })}

          {/* BOLETO */}
          <div className="text-gray-400 flex items-center">Boleto</div>
          {mesesFixos.map((mes)=>{
            const m = dadosMap[mes] || {}
            return (
              <div key={mes} className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.boleto || 0)}`}>
                {(m.boleto || 0).toLocaleString("pt-BR")}
              </div>
            )
          })}

          {/* DINHEIRO */}
          <div className="text-gray-400 flex items-center">Dinheiro</div>
          {mesesFixos.map((mes)=>{
            const m = dadosMap[mes] || {}
            return (
              <div key={mes} className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m.dinheiro || 0)}`}>
                {(m.dinheiro || 0).toLocaleString("pt-BR")}
              </div>
            )
          })}

        </div>

        {/* LEGENDA */}
        <div className="flex items-center gap-2 mt-6">
          <span className="text-xs text-gray-400">Menor</span>

          {[
            "bg-[#1e293b]",
            "bg-blue-300",
            "bg-blue-400",
            "bg-blue-500",
            "bg-blue-600",
            "bg-blue-700"
          ].map((c,i)=>(
            <div key={i} className={`w-6 h-3 rounded ${c}`} />
          ))}

          <span className="text-xs text-gray-400">Maior</span>
        </div>

      </div>
    </div>
  )
})()}

{/* ================= HEATMAP DESPESAS ================= */}
{(() => {

  const mesesFixos = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"]

  const dadosMap = Object.fromEntries(
    dadosDespesas.map((m:any) => [m.mes, m])
  )

  const maxValor = Math.max(
    ...mesesFixos.flatMap((mes)=>{
      const m = dadosMap[mes] || {}
      return categoriasDespesas.map((cat:any)=> m[cat] || 0)
    })
  )

  function getHeatColor(valor:number) {
    const intensidade = maxValor > 0 ? valor / maxValor : 0

    if (intensidade > 0.85) return "bg-red-700"
    if (intensidade > 0.65) return "bg-red-600"
    if (intensidade > 0.45) return "bg-red-500"
    if (intensidade > 0.25) return "bg-red-400"
    if (intensidade > 0.1) return "bg-red-300"

    return "bg-[#1e293b]"
  }

  return (
    <div className="mt-10">
      <div className="bg-[#0f1c33] p-6 rounded-2xl shadow-lg w-full">

        <h2 className="mb-6 text-lg font-semibold text-red-400">
          Heatmap de Despesas por Categoria
        </h2>

        <div className="grid grid-cols-[160px_repeat(12,1fr)] gap-2 text-xs">

          {/* MESES */}
          <div></div>
          {mesesFixos.map((mes)=>(
            <div key={mes} className="text-center text-gray-400">{mes}</div>
          ))}

          {/* LINHAS DINÂMICAS */}
          {categoriasDespesas.map((cat:any)=>(
            <>
              <div className="text-gray-400 flex items-center">
                {cat}
              </div>

              {mesesFixos.map((mes)=>{
                const m = dadosMap[mes] || {}

                return (
                  <div
                    className={`h-12 rounded-lg flex items-center justify-center text-white ${getHeatColor(m[cat] || 0)}`}
                  >
                    {(m[cat] || 0).toLocaleString("pt-BR")}
                  </div>
                )
              })}
            </>
          ))}

        </div>

      </div>
    </div>
  )
})()}
    </div>
  )
}