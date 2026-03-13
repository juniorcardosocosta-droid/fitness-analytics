"use client"

import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a1f44] text-white">

      {/* TOPBAR */}
      <div className="bg-blue-600 text-center text-sm py-2 font-semibold">
        🎯 Vagas limitadas por mês! Diagnóstico Financeiro Gratuito para Academias
      </div>

      {/* HEADER */}
      <header className="bg-[#0a1f44] border-b border-blue-900">

        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">

          <div className="flex items-center gap-4">

            <div className="text-2xl font-bold">
              CF <span className="text-blue-400">Consultoria</span>
            </div>

            <div className="h-6 w-px bg-gray-600"></div>

            <div className="text-sm text-gray-300">
              <strong className="text-white">Gym Fitness Analytics</strong>
              <br/>
              Inteligência Financeira para Academias
            </div>

          </div>

          <div className="flex gap-4">

            <a
              href="https://wa.me/55619982067189"
              target="_blank"
              className="bg-green-500 hover:bg-green-400 px-5 py-2 rounded-lg font-semibold"
            >
              WhatsApp
            </a>

            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg font-semibold"
            >
              Login
            </Link>

          </div>

        </div>

      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">

        <div>

          <span className="bg-blue-900/40 text-blue-300 px-4 py-2 rounded-full text-sm">
            Consultoria Financeira Especializada no Mercado Fitness
          </span>

          <h1 className="text-5xl font-bold mt-6 leading-tight">
            Sua academia pode estar perdendo dinheiro agora
            e você ainda <span className="text-blue-300">não sabe onde.</span>
          </h1>

          <p className="text-gray-300 mt-6 text-lg">
            A CF Consultoria ajuda donos de academia a entender exatamente
            onde estão os gargalos financeiros e transformar dados em decisões
            que aumentam lucro e retenção de alunos.
          </p>

          <div className="flex gap-4 mt-10">

            <a
              href="https://wa.me/55619982067189"
              className="bg-green-500 hover:bg-green-400 px-8 py-4 rounded-lg font-semibold"
            >
              Quero meu diagnóstico
            </a>

            <a
              href="#como-funciona"
              className="border border-gray-500 px-8 py-4 rounded-lg"
            >
              Como funciona
            </a>

          </div>

          <p className="text-gray-400 text-sm mt-6">
            🔒 Sem custo. Sem compromisso. Sem cartão de crédito.
          </p>

        </div>


        {/* DASHBOARD MOCKUP */}
        <div className="bg-[#1e3a5f] rounded-3xl p-10 shadow-2xl">

          <h3 className="text-gray-300 mb-6 text-center">
            Gym Fitness Analytics — Dashboard
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-[#0d2d63] p-4 rounded-xl">
              <p className="text-sm text-gray-300">Faturamento</p>
              <p className="text-2xl font-bold mt-1">R$ 48k</p>
              <p className="text-green-400 text-sm">▲ 12%</p>
            </div>

            <div className="bg-[#0d2d63] p-4 rounded-xl">
              <p className="text-sm text-gray-300">Alunos</p>
              <p className="text-2xl font-bold mt-1">342</p>
              <p className="text-green-400 text-sm">▲ 8</p>
            </div>

            <div className="bg-[#0d2d63] p-4 rounded-xl">
              <p className="text-sm text-gray-300">Churn</p>
              <p className="text-2xl font-bold mt-1">4.2%</p>
              <p className="text-red-400 text-sm">▼ 1.1%</p>
            </div>

            <div className="bg-[#0d2d63] p-4 rounded-xl">
              <p className="text-sm text-gray-300">Ticket</p>
              <p className="text-2xl font-bold mt-1">R$140</p>
              <p className="text-green-400 text-sm">▲ R$8</p>
            </div>

          </div>

        </div>

      </section>

      {/* SEÇÃO DOR */}
      <section className="bg-gray-100 text-gray-900 py-28">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-16">
            Você sabe responder essas perguntas sobre sua academia?
          </h2>

          <div className="space-y-6 text-left">

            <div className="bg-white p-6 rounded-xl border">
              Você sabe exatamente qual é a <b>margem de lucro real</b> da sua academia?
            </div>

            <div className="bg-white p-6 rounded-xl border">
              Quantos alunos <b>cancelaram nos últimos 90 dias</b>?
            </div>

            <div className="bg-white p-6 rounded-xl border">
              Você consegue comparar o desempenho <b>das suas unidades</b>?
            </div>

            <div className="bg-white p-6 rounded-xl border">
              Você sabe quais despesas estão <b>corroendo seu lucro</b>?
            </div>

            <div className="bg-white p-6 rounded-xl border">
              Qual é o <b>LTV médio de um aluno</b> na sua academia?
            </div>

          </div>

        </div>

      </section>



      {/* CONSEQUÊNCIAS */}
      <section className="py-28 bg-white text-gray-900">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            Gerir academia sem clareza financeira tem um custo.
          </h2>

          <div className="grid md:grid-cols-2 gap-10">

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                📉 Você trabalha mais e lucra menos
              </h3>

              <p>
                Sem entender os números da academia,
                aumentar alunos nem sempre significa aumentar lucro.
              </p>

            </div>

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                🔄 Você perde alunos sem entender
              </h3>

              <p>
                O churn alto parece inevitável,
                mas com dados certos ele pode ser previsto e reduzido.
              </p>

            </div>

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                🚫 Decisões no feeling
              </h3>

              <p>
                Investimentos, contratações e expansão
                sem base financeira viram apostas.
              </p>

            </div>

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                😰 Gestão no escuro
              </h3>

              <p>
                Dados espalhados em sistemas e planilhas
                tornam impossível ter clareza real do negócio.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* SOLUÇÃO */}
      <section className="bg-gray-100 py-28 text-gray-900">

        <div className="max-w-5xl mx-auto text-center px-6">

          <h2 className="text-4xl font-bold mb-10">
            Conheça o Gym Fitness Analytics
          </h2>

          <p className="text-lg max-w-3xl mx-auto">
            Uma plataforma que transforma os dados da sua academia
            em indicadores estratégicos para tomada de decisão.
            Com dashboards claros, análises financeiras e métricas
            de retenção de alunos.
          </p>

        </div>

      </section>



      {/* ENTREGÁVEIS */}
      <section className="py-28 bg-white text-gray-900">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            O que você recebe
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                📊 Dashboard completo
              </h3>

              <p>
                Todos os indicadores financeiros e operacionais
                da academia em um único painel.
              </p>

            </div>

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                📈 Análise de faturamento
              </h3>

              <p>
                Visualize crescimento, tendências e desempenho
                de cada unidade da academia.
              </p>

            </div>

            <div className="p-8 border rounded-xl">

              <h3 className="text-xl font-semibold mb-4">
                ⚠️ Alertas inteligentes
              </h3>

              <p>
                Receba avisos automáticos quando indicadores
                importantes começarem a cair.
              </p>

            </div>

          </div>

        </div>

      </section>

       {/* PÚBLICO IDEAL */}
      <section className="bg-gray-100 py-28 text-gray-900">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-16">
            Para quem é o Gym Fitness Analytics?
          </h2>

          <div className="grid md:grid-cols-2 gap-8 text-left">

            <div className="bg-white p-6 rounded-xl border">
              ✔ Donos de academia que querem parar de gerir no escuro
            </div>

            <div className="bg-white p-6 rounded-xl border">
              ✔ Redes com múltiplas unidades
            </div>

            <div className="bg-white p-6 rounded-xl border">
              ✔ Academias que querem aumentar lucro
            </div>

            <div className="bg-white p-6 rounded-xl border">
              ✔ Gestores que querem tomar decisões com dados
            </div>

          </div>

        </div>

      </section>



      {/* PROCESSO */}
      <section className="py-28 bg-white text-gray-900" id="como-funciona">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-16">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-5 gap-8">

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-4">1</div>
              <p>Diagnóstico gratuito da academia</p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-4">2</div>
              <p>Análise dos dados financeiros</p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-4">3</div>
              <p>Dashboard personalizado</p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-4">4</div>
              <p>Plano de ação estratégico</p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-4">5</div>
              <p>Acompanhamento mensal</p>
            </div>

          </div>

        </div>

      </section>



      {/* DEPOIMENTOS */}
      <section className="bg-gray-100 py-28 text-gray-900">

        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            O que dizem nossos clientes
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="bg-white p-8 rounded-xl border">

              <p className="mb-6">
                "Descobri um vazamento financeiro na academia que eu não via.
                O diagnóstico foi um divisor de águas."
              </p>

              <strong>Cliente CF</strong>

            </div>

            <div className="bg-white p-8 rounded-xl border">

              <p className="mb-6">
                "Nunca tinha visto meus números tão claros.
                O dashboard mudou completamente minha gestão."
              </p>

              <strong>Rede de academias</strong>

            </div>

            <div className="bg-white p-8 rounded-xl border">

              <p className="mb-6">
                "Hoje tomo decisões baseadas em dados,
                não mais em achismo."
              </p>

              <strong>Academia Premium</strong>

            </div>

          </div>

        </div>

      </section>



      {/* OFERTA */}
      <section className="bg-[#0a1f44] py-28 text-center">

        <h2 className="text-4xl font-bold mb-6">
          Comece pelo diagnóstico gratuito
        </h2>

        <p className="text-gray-300 mb-10">
          Uma conversa estratégica de 45 minutos
          que pode mudar a forma como você gere sua academia.
        </p>

        <a
          href="https://wa.me/55619982067189"
          className="bg-green-500 hover:bg-green-400 px-10 py-4 rounded-lg font-semibold text-lg"
        >
          Agendar diagnóstico no WhatsApp
        </a>

      </section>



      {/* FAQ */}
      <section className="bg-white py-28 text-gray-900">

        <div className="max-w-4xl mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-16">
            Perguntas frequentes
          </h2>

          <div className="space-y-8">

            <div>
              <h3 className="font-semibold mb-2">
                O diagnóstico é realmente gratuito?
              </h3>
              <p>
                Sim. A primeira análise da academia é gratuita e sem compromisso.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Preciso trocar meu sistema atual?
              </h3>
              <p>
                Não. Integramos com os principais sistemas de gestão fitness.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Funciona para academias pequenas?
              </h3>
              <p>
                Sim. O sistema foi pensado para academias de todos os tamanhos.
              </p>
            </div>

          </div>

        </div>

      </section>



      {/* CTA FINAL */}
      <section className="bg-black py-28 text-center">

        <h2 className="text-5xl font-bold mb-6">
          Pronto para transformar sua academia?
        </h2>

        <p className="text-gray-400 mb-10">
          Comece agora e tenha clareza financeira sobre seu negócio.
        </p>

        <div className="flex justify-center gap-4">

          <Link
            href="/login"
            className="bg-blue-600 px-10 py-4 rounded-lg font-semibold"
          >
            Acessar plataforma
          </Link>

          <a
            href="https://wa.me/55619982067189"
            className="bg-green-500 px-10 py-4 rounded-lg font-semibold"
          >
            WhatsApp
          </a>

        </div>

      </section>



      {/* FOOTER */}
      <footer className="bg-[#0a1f44] text-gray-400 text-center py-10">

        <p>
          © {new Date().getFullYear()} CF Consultoria — Gym Fitness Analytics
        </p>

      </footer>



      {/* BOTÃO WHATSAPP FLUTUANTE */}
      <a
        href="https://wa.me/55619982067189"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-white px-5 py-3 rounded-full shadow-lg"
      >
        WhatsApp
      </a>

    </main>
  )
}