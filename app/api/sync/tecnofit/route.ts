import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔎 Buscar integração
    const { data: integracoes } = await supabase
      .from("integracoes")
      .select("*")
      .ilike("sistema", "tecnofit")

    if (!integracoes || integracoes.length === 0) {
      return NextResponse.json({ error: "Sem integração" })
    }

    const integracao = integracoes[0]

    // 🔐 LOGIN
    const loginResponse = await fetch("https://integracao.tecnofit.com.br/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: integracao.api_key,
        api_secret: integracao.api_secret
      })
    })

    const loginData = await loginResponse.json()
    const token = loginData.token

    // 🔥 BUSCAR DASHBOARD REAL
    const dashboardResponse = await fetch(
      `https://app.tecnofit.com.br/api-core/${integracao.academia_id}/nps/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    )

    const dashboardData = await dashboardResponse.json()

    const revenue = dashboardData.revenue || {}

    const faturamento = Number(revenue.monthRevenue || 0)
    const faturamento_previsto = Number(revenue.overallRevenue || 0)

    // 📅 DATA ATUAL
    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = hoje.getMonth() + 1

    // 💾 SALVAR NO BANCO
    await supabase
      .from("dados_mensais")
      .upsert({
        academia_id: integracao.academia_id,
        ano,
        mes,
        faturamento,
        faturamento_previsto
      }, {
        onConflict: "academia_id,ano,mes"
      })

    return NextResponse.json({
      success: true,
      faturamento,
      faturamento_previsto
    })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}