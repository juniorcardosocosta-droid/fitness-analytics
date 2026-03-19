import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    const { data: integracoes } = await supabase
      .from("integracoes")
      .select("*")
      .ilike("sistema", "tecnofit")

    if (!integracoes || integracoes.length === 0) {
      return NextResponse.json({ error: "Integração não encontrada" })
    }

    const integracao = integracoes[0]

    // 🔥 PASSO 1 — LOGIN
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

    if (!loginData || !loginData.access_token) {
      return NextResponse.json({
        error: "Erro ao autenticar",
        detalhe: loginData
      })
    }

    const token = loginData.access_token

    // 🔥 PASSO 2 — CHAMAR API (exemplo alunos)
    const apiResponse = await fetch("https://integracao.tecnofit.com.br/v1/students", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await apiResponse.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ error: "Erro interno", detalhe: String(error) })
  }
}