import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔥 pega integração salva
    const { data: integracao, error } = await supabase
      .from("integracoes")
      .select("*")
      .ilike("sistema", "tecnofit")
      .single()

    if (error || !integracao) {
      return NextResponse.json({ error: "Integração não encontrada" })
    }

    // 🔥 chamada para Tecnofit (primeiro teste)
    const response = await fetch("https://api.tecnofit.com.br/v1/alunos", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${integracao.api_key}`,
        "Content-Type": "application/json"
      }
    })

    const data = await response.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({ error: "Erro interno na API" })
  }
}