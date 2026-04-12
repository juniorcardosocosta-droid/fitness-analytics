import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: integracoes } = await supabase
      .from("integracoes")
      .select("*")
      .ilike("sistema", "tecnofit")

    const integracao = integracoes?.[0]

    // LOGIN
    const loginResponse = await fetch("https://integracao.tecnofit.com.br/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: integracao.api_key,
        api_secret: integracao.api_secret
      })
    })

    const loginData = await loginResponse.json()
    const token = loginData.token

    // 🔥 DASHBOARD REAL
    const dashboardResponse = await fetch(
      `https://app.tecnofit.com.br/api-core/${integracao.academia_id}/nps/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    console.log("STATUS DASHBOARD:", dashboardResponse.status)

    let dashboardData: any = {}

try {
  const text = await dashboardResponse.text()
  dashboardData = text ? JSON.parse(text) : {}
} catch (e) {
  console.log("Erro ao ler dashboard:", e)
  dashboardData = {}
}

    const revenue = dashboardData.revenue || {}

    const faturamento_real = Number(revenue.monthRevenue || 0)
    const faturamento_previsto_real = Number(revenue.overallRevenue || 0)

    const hoje = new Date()
    const ano = hoje.getFullYear()
    const mes = hoje.getMonth() + 1

    await supabase
      .from("dados_mensais")
      .upsert({
        academia_id: integracao.academia_id,
        ano,
        mes,
        faturamento: faturamento_real,
        faturamento_previsto: faturamento_previsto_real
      }, {
        onConflict: "academia_id,ano,mes"
      })

    return NextResponse.json({
      success: true,
      faturamento_real,
      faturamento_previsto_real
    })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}