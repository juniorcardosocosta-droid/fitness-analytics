"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"
import { ComposedChart } from "recharts"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

import dynamic from "next/dynamic"

const BotaoPDF = dynamic(() => import("@/components/BotaoPDF"), {
   ssr: false
   })

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


  const capturarGrafico = async (id: string) => {
  const el = document.getElementById(id)
  if (!el) return null

  // 🔥 CLONA O ELEMENTO
  const clone = el.cloneNode(true) as HTMLElement

  // 🔥 CRIA CONTAINER TEMPORÁRIO
  const wrapper = document.createElement("div")

wrapper.style.position = "fixed"
wrapper.style.top = "0"
wrapper.style.left = "0"
wrapper.style.width = "1200px"
wrapper.style.height = "700px"
wrapper.style.background = "#0a162b"
wrapper.style.display = "flex"
wrapper.style.alignItems = "center"
wrapper.style.justifyContent = "center"
wrapper.style.zIndex = "-1"

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  // 🔥 REMOVE PROBLEMA DE CORES (FORÇA CSS SIMPLES)
  const allElements = wrapper.querySelectorAll("*")
  allElements.forEach((node: any) => {
    node.style.color = "#ffffff"
    node.style.backgroundColor = "transparent"
    node.style.borderColor = "#1f2a44"
  })

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      backgroundColor: "#0a162b",
      useCORS: true
    })

    return canvas.toDataURL("image/png")
  } catch (err) {
    console.error("Erro ao capturar:", err)
    return null
  } finally {
    document.body.removeChild(wrapper)
  }
}

const gerarImagens = async () => {
  return {
    receita: await capturarGrafico("grafico-receita"),
    alunos: await capturarGrafico("grafico-alunos"),
    composicao: await capturarGrafico("grafico-composicao"),
    churn: await capturarGrafico("grafico-churn"),
    evolucao: await capturarGrafico("grafico-evolucao"),
    ticket: await capturarGrafico("grafico-ticket"),
    custos: await capturarGrafico("grafico-custos"),
    margem: await capturarGrafico("grafico-margem"),
    heatReceita: await capturarGrafico("grafico-heatmap-receita"),
    heatDespesa: await capturarGrafico("grafico-heatmap-despesas"),
  }
}

  const router = useRouter()

  const [dados, setDados] = useState<any[]>([])
  const [academias, setAcademias] = useState<any[]>([])
  const [academiaId, setAcademiaId] = useState("")

  const [mesSelecionado, setMesSelecionado] = useState("")
  const [anoSelecionado, setAnoSelecionado] = useState("")

   const isReceita = (item:any) =>
    String(item.tipo).toLowerCase().includes("receita")

  const isDespesa = (item:any) =>
    String(item.tipo).toLowerCase().includes("despesa")

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

    if (!data.session) {
      router.push("/login")
      return
    }

    const userId = data.session.user.id

    const { data: perfil } = await supabase
      .from("perfis")
      .select("role")
      .eq("id", userId)
      .single()

    console.log("USUARIO:", userId)
    console.log("ROLE:", perfil?.role)
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
  const receitas = dadosFiltrados.filter((i:any)=> isReceita(i))
  const despesasLista = dadosFiltrados.filter((i:any)=> isDespesa(i))

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
      isReceita(i) &&
      String(i.status_cliente).toLowerCase().includes("ativo")
  ).length

  const ticketAluno =
    alunosAtivos > 0
      ? receita / alunosAtivos
      : 0

  // ================= ALUNOS =================
   const alunos = dadosFiltrados.filter(
     (i:any) => isReceita(i) && i.status_cliente
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
    .filter((i:any)=> isReceita(i))
    .reduce((t,i)=> t + Number(i.valor || 0), 0)

  // despesa anterior
  const despesaAnterior = dadosMesAnterior
    .filter((i:any)=> isDespesa(i))
    .reduce((t,i)=> t + Number(i.valor || 0), 0)

  // resultado anterior
  const resultadoAnterior = receitaAnterior - despesaAnterior  

  // ativos anterior
  const ativosAnterior = dadosMesAnterior.filter((i:any)=>
    isReceita(i) &&
    String(i.status_cliente).toLowerCase().includes("ativo")
  ).length

   // cancelados anterior
   const canceladosAnterior = dadosMesAnterior.filter((i:any)=>
     isReceita(i) &&
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
      .filter((item: any) => isReceita(item))
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

       if (isReceita(item)) {

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

    if (isReceita(item)) {
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

    if (isReceita(item)) {
      acc[mesNumero].receita += Number(item.valor || 0)
    }

    if (isDespesa(item)) {
      acc[mesNumero].despesa += Number(item.valor || 0)
    }

    acc[mesNumero].resultado =
      acc[mesNumero].receita - acc[mesNumero].despesa

    return acc

  }, {})
).sort((a:any,b:any)=> a.ordem - b.ordem)

const dadosMargem = dadosEvolucao.map((m:any) => ({
  mes: m.mes,
  margem: m.receita > 0
    ? (m.resultado / m.receita) * 100
    : 0
}))

const renderLabel = (props:any) => {
  const { x, y, width, height, value } = props

  const text = `R$ ${Number(value).toLocaleString("pt-BR")}`

  const paddingX = 6
  const boxWidth = text.length * 6 + paddingX * 2

  // ✔ POSICIONAMENTO BASEADO NA ALTURA DA BARRA
  const espacamento = 22

  const posY = y - espacamento  


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
  )
}

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

// ================= GRÁFICO EVOLUÇAÕ DOS CUSTOS OPERACIONAIS TOTAIS =================
const dadosCustos = Object.values(
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
        despesa: 0
      }
    }

    const valor = Number(item.valor || 0)

    if (isReceita(item)) {
      acc[mesNumero].receita += valor
    }

    if (isDespesa(item)) {
      acc[mesNumero].despesa += valor
    }

    return acc

  }, {})
)
.map((m:any) => {
  const percentualReal = m.receita > 0
    ? (m.despesa / m.receita) * 100
    : 0

  return {
    mes: m.mes,
    ordem: m.ordem, // 👉 SÓ ISSO QUE FALTAVA
    receita: m.receita,
    despesa: m.despesa,
    percentual: m.despesa,
    percentualReal
  }
})
.sort((a:any,b:any)=> a.ordem - b.ordem)

const categoriasDespesas = dadosFiltrados
  .filter((i:any) => isDespesa(i))
  .map((i:any) => i.categoria || "Outros")
  .filter((v, i, arr) => arr.indexOf(v) === i)

  const dadosDespesas = Object.values(
  dadosFiltrados.reduce((acc:any, item:any) => {

    if (!item.data || !isDespesa(item)) return acc

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
  <div
  id="dashboard-pdf"
  className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10"
>

    <div className="flex items-center justify-between mb-6">
  
  {/* ESQUERDA */}
  <h1 className="text-4xl font-bold">Dashboard</h1>

  {/* DIREITA */}
  <div>
    <BotaoPDF
      gerarImagens={gerarImagens}
      dados={{
        receita: receita.toFixed(2),
        despesa: despesa.toFixed(2),
        resultado: resultado.toFixed(2),
        margem: receita > 0
          ? ((resultado / receita) * 100).toFixed(1)
          : "0"
      }}
    />
  </div>

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

  {/* Ticket Medio Total */}
  <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
    <div className="bg-indigo-500/20 p-2 rounded-xl">
      <BarChart3 className="text-indigo-400 w-5 h-5" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">Ticket Medio Total</p>
      <h2 className="text-lg font-bold text-indigo-300">
        R$ {ticketFinanceiro.toLocaleString("pt-BR",{minimumFractionDigits:2})}
      </h2>
    </div>
  </div>

</div>

{/* ================= KPIs DE ALUNOS ================= */}
<div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-10">

  {/* Ticket por Aluno Ativos */}
  <div className="bg-[#0f1c33] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
    <div className="bg-indigo-500/20 p-2 rounded-xl">
      <Users className="text-indigo-400 w-5 h-5" />
    </div>
    <div>
      <p className="text-gray-400 text-sm">Ticket por Alunos Ativos</p>
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
        tickFormatter={(v)=> `R$ ${(v/1000).toFixed(0)}k`}
      />

      <Tooltip
        formatter={(v:any)=> 
          `R$ ${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}`
        }
        contentStyle={{
          backgroundColor: "#0a162b",
          border: "none",
          color: "#fff"
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
      <div id="grafico-heatmap-receita" className="bg-gradient-to-br from-[#0b1220] to-[#0f1c33] p-6 rounded-2xl shadow-lg w-full">

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

          {/* TOTAL POR MÊS */}
<div className="text-green-400 flex items-center font-bold">
  TOTAL
</div>

{mesesFixos.map((mes)=>{
  const m = dadosMap[mes] || {}

  const total =
    (m.recorrencia || 0) +
    (m.cartao || 0) +
    (m.pix || 0) +
    (m.boleto || 0) +
    (m.dinheiro || 0)

  return (
    <div className="h-12 flex items-center justify-center text-green-400 font-bold">
      {total.toLocaleString("pt-BR")}
    </div>
  )
})}

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
      <div id="grafico-heatmap-despesas" className="bg-[#0f1c33] p-6 rounded-2xl shadow-lg w-full">

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

          {/* TOTAL POR MÊS */}
<div className="text-red-400 flex items-center font-bold">
  TOTAL
</div>

{mesesFixos.map((mes)=>{
  const m = dadosMap[mes] || {}

  const total = categoriasDespesas.reduce((acc:any, cat:any)=>{
    return acc + (m[cat] || 0)
  }, 0)

  return (
    <div className="h-12 flex items-center justify-center text-red-400 font-bold">
      {total.toLocaleString("pt-BR")}
    </div>
  )
})}

        </div>

      </div>
    </div>
  )
})()}

{/* 2 - EVOLUÇÃO DE ALUNOS */}
<div className="mt-6">
  <div id="grafico-alunos" className="bg-[#0f1c33] p-6 rounded w-full">
    <h2 className="mb-4">Evolução de Alunos</h2>

    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={dadosAlunos}>
        <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
        <XAxis dataKey="mes" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Legend />

        {["ativos","recorrencia","novos"].map((key) => {
          const colors:any = {
            ativos:"#22c55e",
            recorrencia:"#3b82f6",
            novos:"#a855f7"
          }

          return (
            <Bar key={key} dataKey={key} fill={colors[key]}>
              <LabelList dataKey={key} position="top" fill="#fff" />
            </Bar>
          )
        })}

      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* 3 - TICKET - MEIDO + CHURN */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

 {/* TICKET MEDIO */}
  <div id="grafico-ticket" className="bg-[#0f1c33] p-6 rounded w-full">
      <h2 className="mb-4">Ticket Médio</h2>
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={dadosTicket}>
        <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
        <XAxis dataKey="mes" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip />
        <Legend />

        <Line dataKey="recorrencia" stroke="#9ca3af" strokeWidth={3} dot={{ r: 4 }} />
        <Line dataKey="agregador" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* CHURN */}
  <div id="grafico-churn" className="bg-[#0f1c33] p-6 rounded w-full">
    <h2 className="mb-4">Churn Mensal (%)</h2>

    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={dadosChurn}>
        <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
        <XAxis dataKey="mes" stroke="#94a3b8" />
        <YAxis domain={[0,100]} stroke="#94a3b8" />
        <Tooltip formatter={(v:any)=> `${v.toFixed(1)}%`} />
        <Legend />

        <Bar dataKey="churn" fill="#ef4444">
          <LabelList
            dataKey="churn"
            position="top"
            formatter={(v:any)=> `${v.toFixed(1)}%`}
            fill="#fff"
          />
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  </div>

</div>

{/* 4 - RESTANTE */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

    

  {/* CUSTOS OPERACIONAL*/}
  <div id="grafico-custos" className="bg-[#0f1c33] p-6 rounded w-full">
      <h2 className="mb-4">Custos Operacionais</h2>
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={dadosCustos}>
        <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
        <XAxis dataKey="mes" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <YAxis yAxisId="right" orientation="right" domain={[0,100]} stroke="#3b82f6" />

        <Tooltip />
        <Legend />

        <Bar dataKey="despesa" fill="#22c55e">
          <LabelList
            dataKey="despesa"
            position="top"
            formatter={(v:any)=> `R$ ${v.toLocaleString("pt-BR")}`}
            fill="#fff"
          />
        </Bar>

       <Line
  type="monotone"
  dataKey="percentualReal"
  stroke="#3b82f6"
  yAxisId="right"
  strokeWidth={3}
  dot={{ r: 4 }}
>
  <LabelList
    dataKey="percentualReal"
    position="top"
    formatter={(v:any)=> `${Number(v).toFixed(0)}%`}
    fill="#3b82f6"
  />
</Line>

      </ComposedChart>
    </ResponsiveContainer>
  </div>

  {/* MARGEM OPERACIONAL */}
<div id="grafico-margem" className="bg-[#0f1c33] p-6 rounded w-full">
  <h2 className="mb-4">Margem Operacional (%)</h2>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={dadosMargem}>

      <CartesianGrid stroke="#1f2a44" strokeOpacity={0.3} />
      <XAxis dataKey="mes" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />

      <Tooltip formatter={(v:any)=> `${v.toFixed(1)}%`} />
      <Legend />

      <Line
        type="monotone"
        dataKey="margem"
        stroke="#22c55e"
        strokeWidth={3}
        dot={{ r: 4 }}
      >
        <LabelList
          dataKey="margem"
          position="top"
          formatter={(v:any)=> `${v.toFixed(1)}%`}
          fill="#fff"
        />
      </Line>

    </LineChart>
  </ResponsiveContainer>
</div>

</div>


    </div>
  )
}