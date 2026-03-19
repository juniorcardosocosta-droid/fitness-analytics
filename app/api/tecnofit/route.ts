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

    // 🔥 TESTE 1 - Bearer
    try {
      const res1 = await fetch("https://api.tecnofit.com.br/v1/alunos", {
        headers: {
          Authorization: `Bearer ${integracao.api_key}`
        }
      })
      const data1 = await res1.text()

      return NextResponse.json({
        tipo: "Bearer",
        status: res1.status,
        resposta: data1
      })
    } catch (e) {}

    // 🔥 TESTE 2 - x-api-key
    try {
      const res2 = await fetch("https://api.tecnofit.com.br/v1/alunos", {
        headers: {
          "x-api-key": integracao.api_key
        }
      })
      const data2 = await res2.text()

      return NextResponse.json({
        tipo: "x-api-key",
        status: res2.status,
        resposta: data2
      })
    } catch (e) {}

    // 🔥 TESTE 3 - api-key direto
    try {
      const res3 = await fetch("https://api.tecnofit.com.br/v1/alunos", {
        headers: {
          "api-key": integracao.api_key
        }
      })
      const data3 = await res3.text()

      return NextResponse.json({
        tipo: "api-key",
        status: res3.status,
        resposta: data3
      })
    } catch (e) {}

    return NextResponse.json({ error: "Nenhum método funcionou" })

  } catch (error) {
    return NextResponse.json({ error: "Erro geral", detalhe: String(error) })
  }
}