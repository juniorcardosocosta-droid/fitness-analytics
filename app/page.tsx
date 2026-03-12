"use client"

import Link from "next/link"
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

const faturamentoData = [
  { mes: "Jan", valor: 80000 },
  { mes: "Fev", valor: 92000 },
  { mes: "Mar", valor: 105000 },
  { mes: "Abr", valor: 120000 },
  { mes: "Mai", valor: 128000 }
]

const churnData = [
  { name: "Ativos", value: 92 },
  { name: "Cancelados", value: 8 }
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-28 text-center">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Transforme os dados da sua academia
          em decisões inteligentes
        </h1>

        <p className="text-gray-400 mt-6 text-xl max-w-2xl mx-auto">
          Analytics avançado para academias. Conecte seus sistemas
          e acompanhe métricas como faturamento, churn e ticket médio
          em tempo real.
        </p>

        <div className="flex gap-4 justify-center mt-10">

          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-semibold"
          >
            Começar agora
          </Link>

          <button className="border border-gray-600 px-8 py-4 rounded-lg text-lg">
            Ver demonstração
          </button>

        </div>

      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">

<div className="bg-[#1e3a5f] rounded-3xl p-10 shadow-2xl">

<h3 className="text-center text-gray-300 mb-10">
Gym Fitness Analytics — Dashboard
</h3>

<div className="grid md:grid-cols-2 gap-6">

<div className="bg-[#2b4a73] p-6 rounded-xl">
<p className="text-gray-300 text-sm">FATURAMENTO</p>
<p className="text-3xl font-bold mt-2">R$ 48k</p>
<p className="text-green-400 text-sm mt-2">▲ 12% vs anterior</p>
</div>

<div className="bg-[#2b4a73] p-6 rounded-xl">
<p className="text-gray-300 text-sm">ALUNOS ATIVOS</p>
<p className="text-3xl font-bold mt-2">342</p>
<p className="text-green-400 text-sm mt-2">▲ 8 novos</p>
</div>

<div className="bg-[#2b4a73] p-6 rounded-xl">
<p className="text-gray-300 text-sm">CHURN RATE</p>
<p className="text-3xl font-bold mt-2">4,2%</p>
<p className="text-red-400 text-sm mt-2">▼ 1,1% vs anterior</p>
</div>

<div className="bg-[#2b4a73] p-6 rounded-xl">
<p className="text-gray-300 text-sm">TICKET MÉDIO</p>
<p className="text-3xl font-bold mt-2">R$ 140</p>
<p className="text-green-400 text-sm mt-2">▲ R$ 8</p>
</div>

</div>

<div className="mt-10">

<p className="text-gray-300 mb-4">
Faturamento por unidade
</p>

<div className="space-y-4">

<div>
<div className="flex justify-between text-sm">
<span>Unidade 1</span>
<span>85%</span>
</div>
<div className="w-full bg-gray-700 rounded-full h-2 mt-1">
<div className="bg-blue-500 h-2 rounded-full w-[85%]"></div>
</div>
</div>

<div>
<div className="flex justify-between text-sm">
<span>Unidade 2</span>
<span>68%</span>
</div>
<div className="w-full bg-gray-700 rounded-full h-2 mt-1">
<div className="bg-green-500 h-2 rounded-full w-[68%]"></div>
</div>
</div>

<div>
<div className="flex justify-between text-sm">
<span>Unidade 3</span>
<span>51%</span>
</div>
<div className="w-full bg-gray-700 rounded-full h-2 mt-1">
<div className="bg-yellow-500 h-2 rounded-full w-[51%]"></div>
</div>
</div>

</div>

</div>

</div>

</section>

      {/* MÉTRICAS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-[#1e293b] p-6 rounded-xl">
            <p className="text-gray-400">Faturamento mensal</p>
            <p className="text-3xl font-bold mt-2">R$ 128.000</p>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-xl">
            <p className="text-gray-400">Alunos ativos</p>
            <p className="text-3xl font-bold mt-2">842</p>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-xl">
            <p className="text-gray-400">Churn</p>
            <p className="text-3xl font-bold mt-2">4.2%</p>
          </div>

          <div className="bg-[#1e293b] p-6 rounded-xl">
            <p className="text-gray-400">Ticket médio</p>
            <p className="text-3xl font-bold mt-2">R$ 142</p>
          </div>

        </div>

      </section>

      {/* GRÁFICOS */}
      <section className="max-w-7xl mx-auto px-6 pb-28">

        <h2 className="text-4xl font-bold mb-16 text-center">
          Visualize os dados da sua academia
        </h2>

        <div className="grid md:grid-cols-2 gap-10">

          {/* Faturamento */}
          <div className="bg-[#1e293b] p-8 rounded-xl">

            <h3 className="text-xl font-semibold mb-6">
              Crescimento de faturamento
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={faturamentoData}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                />
              </AreaChart>
            </ResponsiveContainer>

          </div>

          {/* Churn */}
          <div className="bg-[#1e293b] p-8 rounded-xl">

            <h3 className="text-xl font-semibold mb-6">
              Taxa de retenção
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={churnData}
                  dataKey="value"
                  outerRadius={80}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

          </div>

        </div>

      </section>

      {/* FUNCIONALIDADES */}
      <section className="max-w-7xl mx-auto px-6 pb-28">

        <h2 className="text-4xl font-bold text-center mb-16">
          Funcionalidades que transformam sua gestão
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          <div className="bg-[#1e293b] p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">
              📊 Dashboard em tempo real
            </h3>
            <p className="text-gray-400">
              Todos os indicadores estratégicos da academia
              em um único painel.
            </p>
          </div>

          <div className="bg-[#1e293b] p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">
              🔗 Integração com sistemas
            </h3>
            <p className="text-gray-400">
              Conecte Tecnofit, EVO, Pacto e Nextfit
              via API em poucos minutos.
            </p>
          </div>

          <div className="bg-[#1e293b] p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">
              ⚠️ Alertas inteligentes
            </h3>
            <p className="text-gray-400">
              Receba avisos automáticos quando indicadores
              importantes começarem a cair.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20 text-center">

        <h2 className="text-4xl font-bold mb-6">
          Comece agora gratuitamente
        </h2>

        <p className="text-blue-100 mb-10">
          Descubra como dados podem transformar
          a gestão da sua academia.
        </p>

        <Link
          href="/login"
          className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg"
        >
          Criar conta
        </Link>

      </section>

    </main>
  )
}