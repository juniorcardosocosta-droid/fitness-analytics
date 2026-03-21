import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔎 Buscar integração
    const { data: integracoes, error } = await supabase
      .from("integracoes")
      .select("*")
      .ilike("sistema", "tecnofit")

    if (error) {
      return NextResponse.json({ error: "Erro Supabase", detalhe: error })
    }

    if (!integracoes || integracoes.length === 0) {
      return NextResponse.json({ error: "Integração não encontrada" })
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

    if (!loginResponse.ok) {
      return NextResponse.json({ error: "Erro login Tecnofit" })
    }

    const loginData = await loginResponse.json()

    if (!loginData?.token) {
      return NextResponse.json({
        error: "Token não retornado",
        detalhe: loginData
      })
    }

   const token = loginData.token

    // 📊 Buscar alunos
    const apiResponse = await fetch("https://integracao.tecnofit.com.br/v1/products/1", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })

    if (!apiResponse.ok) {
      const erro = await apiResponse.text()
      return NextResponse.json({
         error: "Erro ao buscar alunos",
         detalhe: erro
       }) 
    }

    const data = await apiResponse.json()

    return NextResponse.json(data)

  } catch (error) {
    return NextResponse.json({
      error: "Erro interno",
      detalhe: String(error)
    })
  }
}