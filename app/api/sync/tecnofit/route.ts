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

    if (!integracoes || integracoes.length === 0) {
      return NextResponse.json({ error: "Sem integração" })
    }

    const integracao = integracoes[0]

    // LOGIN
    const loginResponse = await fetch("https://integracao.tecnofit.com.br/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: integracao.api_key,
        api_secret: integracao.api_secret
      })
    })

    const { token } = await loginResponse.json()

    const mapa: any = {}
    const ids = new Set()

    // 🔥 INTERVALO GRANDE (ULTIMOS 12 MESES)
    const inicio = "2025-01-01"
    const fim = "2026-12-31"

    let pagina = 1

    while (true) {

      const response = await fetch(
        `https://integracao.tecnofit.com.br/v1/financial/receivables?page=${pagina}&limit=100&startDate=${inicio}&endDate=${fim}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const json = await response.json()

      console.log("Página:", pagina, "Qtd:", json.data?.length)

      if (!json.data || json.data.length === 0) break

      json.data.forEach((item: any) => {

        if (!item.receipt) return

        if (ids.has(item.id)) return
        ids.add(item.id)

        const valor = Number(item.receipt.netValue || 0)
        if (valor <= 0) return

        const data = item.receipt.date
        if (!data) return

        const [ano, mes] = data.split("-")

        const chave = `${ano}-${mes}`

        if (!mapa[chave]) {
          mapa[chave] = {
            faturamento: 0
          }
        }

        mapa[chave].faturamento += valor

      })

      pagina++
    }

    // SALVAR
    for (const chave in mapa) {

      const [ano, mes] = chave.split("-")

      await supabase
        .from("dados_mensais")
        .upsert({
          academia_id: integracao.academia_id,
          ano: Number(ano),
          mes: Number(mes),
          faturamento: Number(mapa[chave].faturamento.toFixed(2))
        }, {
          onConflict: "academia_id,ano,mes"
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}