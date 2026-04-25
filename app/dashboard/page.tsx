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
      const { data } = await supabase
        .from("academias")
        .select("*")

      if (data) {
        setAcademias(data)

        // se tiver só 1 academia
        if (data.length === 1) {
          setAcademiaId(data[0].id)
        }
      }
    }

    loadAcademias()
  }, [])

  // LOGIN
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/login")
      }
    }
    checkUser()
  }, [router])

  // BUSCAR DADOS
  useEffect(() => {
    async function carregarDados() {

      let query = supabase
        .from("lancamentos")
        .select("*")

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

  // ANOS DINÂMICOS
  const anosDisponiveis = [...new Set(
    dados.map((item: any) => {
      if (!item.data) return null
      return new Date(item.data).getFullYear()
    })
  )].filter(Boolean)

  // FILTRO REAL
  const dadosFiltrados = dados.filter((item: any) => {

    if (!item.data) return false

    const dataItem = new Date(item.data)
    const mes = dataItem.getMonth() + 1
    const ano = dataItem.getFullYear()

    if (mesSelecionado && Number(mesSelecionado) !== mes) return false
    if (anoSelecionado && Number(anoSelecionado) !== ano) return false

    return true
  })

  // FATURAMENTO REAL
  const faturamento = dadosFiltrados
    .filter((item: any) => item.tipo === "receita")
    .reduce((total: number, item: any) => {
      return total + Number(item.valor || 0)
    }, 0)

  const dadosGrafico = Object.values(
  dadosFiltrados
    .filter((item: any) => item.tipo === "receita")
    .reduce((acc: any, item: any) => {

      const dataItem = new Date(item.data)
      const mesNumero = dataItem.getMonth()
      const mesNome = dataItem.toLocaleDateString("pt-BR", {
        month: "short"
      })

      if (!acc[mesNumero]) {
        acc[mesNumero] = { mes: mesNome, total: 0, ordem: mesNumero }
      }

      acc[mesNumero].total += Number(item.valor || 0)

      return acc

    }, {})
)
.sort((a: any, b: any) => a.ordem - b.ordem)

  return (

    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold">
          Dashboard Real
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

      {/* FILTROS */}
      {academias.length > 1 && (
        <select
          value={academiaId}
          onChange={(e) => setAcademiaId(e.target.value)}
          className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg mb-4"
        >
          <option value="">Todas as academias</option>

          {academias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-4 mb-10">

        {/* MÊS */}
        <select
          value={mesSelecionado}
          onChange={(e) => setMesSelecionado(e.target.value)}
          className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="">Todos os meses</option>
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </select>

        {/* ANO DINÂMICO */}
        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(e.target.value)}
          className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg"
        >
          <option value="">Todos os anos</option>
          {anosDisponiveis.map((ano: any) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>

      </div>

      {/* FATURAMENTO */}

      <div className="bg-[#0f1c33] p-6 rounded-xl">

        <p className="text-gray-400 text-sm">
          Faturamento
        </p>

        <h2 className="text-4xl font-bold text-green-400">
          R$ {faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h2>

      </div>

      <div className="bg-[#0f1c33] p-6 rounded-xl mt-10">

        <h2 className="text-xl mb-4">
          Evolução das Receitas Mensais
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2a44" />
            <XAxis dataKey="mes" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#22c55e"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* DEBUG (REMOVER DEPOIS) */}

      <div className="mt-10">

      </div>

    </div>
  )
}