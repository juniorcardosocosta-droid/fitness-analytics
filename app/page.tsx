"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white">

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-28 text-center">

        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Transforme os dados da sua academia <br />
          em decisões inteligentes
        </h1>

        <p className="text-gray-400 mt-6 text-xl max-w-2xl mx-auto">
          Analytics avançado para academias.
          Conecte seus sistemas e acompanhe métricas essenciais como
          faturamento, churn e ticket médio em tempo real.
        </p>

        <div className="flex gap-4 justify-center mt-10">

          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-semibold"
          >
            Começar agora
          </Link>

          <button className="border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-lg text-lg">
            Ver demonstração
          </button>

        </div>

      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 pb-28">

        <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl">

          <h2 className="text-3xl font-bold mb-6">
            Dashboard estratégico em tempo real
          </h2>

          <p className="text-gray-400 mb-10 max-w-xl">
            Visualize os principais indicadores da sua academia em um único
            painel e tome decisões baseadas em dados.
          </p>

          <div className="grid md:grid-cols-4 gap-6">

            <div className="bg-[#0f172a] p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Faturamento</p>
              <p className="text-3xl font-bold mt-2">R$ 120.000</p>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Alunos ativos</p>
              <p className="text-3xl font-bold mt-2">842</p>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Churn</p>
              <p className="text-3xl font-bold mt-2">4.2%</p>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-xl">
              <p className="text-gray-400 text-sm">Ticket médio</p>
              <p className="text-3xl font-bold mt-2">R$ 142</p>
            </div>

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
              Visualize faturamento, alunos ativos, churn e ticket médio em
              tempo real.
            </p>
          </div>

          <div className="bg-[#1e293b] p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">
              📉 Análise de churn
            </h3>
            <p className="text-gray-400">
              Identifique quando alunos estão cancelando e descubra padrões
              de evasão.
            </p>
          </div>

          <div className="bg-[#1e293b] p-8 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">
              ⚠️ Alertas inteligentes
            </h3>
            <p className="text-gray-400">
              Receba avisos automáticos quando métricas importantes
              começarem a cair.
            </p>
          </div>

        </div>

      </section>

      {/* INTEGRAÇÕES */}
      <section className="max-w-7xl mx-auto px-6 pb-28 text-center">

        <h2 className="text-4xl font-bold mb-8">
          Integração com os principais sistemas do mercado
        </h2>

        <p className="text-gray-400 mb-12">
          Conecte sua academia em segundos via API
        </p>

        <div className="flex flex-wrap justify-center gap-10 text-xl text-gray-300">

          <div className="bg-[#1e293b] px-8 py-4 rounded-lg">
            Tecnofit
          </div>

          <div className="bg-[#1e293b] px-8 py-4 rounded-lg">
            EVO
          </div>

          <div className="bg-[#1e293b] px-8 py-4 rounded-lg">
            Pacto
          </div>

          <div className="bg-[#1e293b] px-8 py-4 rounded-lg">
            Nextfit
          </div>

        </div>

      </section>

      {/* CTA FINAL */}
      <section className="bg-blue-600 py-20 text-center">

        <h2 className="text-4xl font-bold mb-6">
          Comece agora gratuitamente
        </h2>

        <p className="text-blue-100 mb-10">
          Descubra como dados podem transformar a gestão da sua academia.
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