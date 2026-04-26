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
  CartesianGrid
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

  // ================= FATURAMENTO =================
  const faturamento = dadosFiltrados
    .filter((item: any) => item.tipo === "receita")
    .reduce((total: number, item: any) => {
      return total + Number(item.valor || 0)
    }, 0)

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

        // 🔥 USA SOMENTE A COLUNA CERTA
        const texto = String(item.origem || "").toLowerCase()
        const valor = Number(item.valor || 0)


        // 🔥 AGREGADOR (cartão)
        if (
          texto.includes("cart") ||
          texto.includes("credito") ||
          texto.includes("débito") ||
          texto.includes("debito")
        ) {
          acc[mesNumero].agregador += valor
        }

        // 🔥 OUTROS (pix e dinheiro)
        else if (
          texto.includes("pix") ||
          texto.includes("dinheiro")
        ) {
          acc[mesNumero].outros += valor
        }

        // 🔥 RECORRÊNCIA (TODO O RESTO)
        else {
           acc[mesNumero].recorrencia += valor
        }

        return acc

      }, {})
  ).sort((a: any, b: any) => a.ordem - b.ordem)

  // ================= TELA =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

      <h1 className="text-4xl font-bold mb-10">Dashboard</h1>

      {/* ACADEMIA */}
      {academias.length > 1 && (
        <select
          value={academiaId}
          onChange={(e) => setAcademiaId((e.target as any).value)}
          className="bg-[#0f1c33] border px-4 py-2 rounded mb-4"
        >
          <option value="">Todas as academias</option>
          {academias.map((a: any) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      )}

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

      {/* FATURAMENTO */}
      <div className="bg-[#0f1c33] p-6 rounded mb-10">
        <p className="text-gray-400">Faturamento</p>
        <h2 className="text-3xl text-green-400">
          R$ {faturamento.toLocaleString("pt-BR",{minimumFractionDigits:2})}
        </h2>
      </div>

      {/* GRÁFICO */}
      <div className="bg-[#0f1c33] p-6 rounded">
        <h2 className="mb-4">Receitas por Categoria</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosGrafico}>
            <CartesianGrid stroke="#1f2a44" />
            <XAxis dataKey="mes" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Legend />

            <Bar dataKey="recorrencia" stackId="a" fill="#22c55e" />
            <Bar dataKey="agregador" stackId="a" fill="#64748b" />
            <Bar dataKey="outros" stackId="a" fill="#3b82f6" />

          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}