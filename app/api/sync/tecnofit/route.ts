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

    const integracao = integracoes?.[0]

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

    // 🔥 BUSCA DADOS DA API
    const response = await fetch(
      "https://integracao.tecnofit.com.br/v1/financial/receivables?page=1&limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const json = await response.json()

    return NextResponse.json(json)

  } catch (error) {
    return NextResponse.json({ erro: String(error) })
  }
}