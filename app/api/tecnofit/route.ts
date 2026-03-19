import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔥 pega TODAS integrações tecnofit
    const { data: integracoes, error } = await supabase
      .from("integracoes")
      .select("*")
      .ilike("sistema", "tecnofit")

    if (error || !integracoes || integracoes.length === 0) {
      return NextResponse.json({ error: "Integração não encontrada" })
    }

    // 🔥 pega a primeira integração
    const integracao = integracoes[0]

    // 🔥 chamada API Tecnofit
    const response = await fetch("https://api.tecnofit.com.br/v1/alunos", {
      method: "GET",
      headers: {
        "x-api-key": integracao.api_key,
        "Content-Type": "application/json"
      }
    })

    const data = await response.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ error: "Erro interno na API" })
  }
}