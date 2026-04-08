import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔎 Buscar integração tecnofit
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

    // 📊 BUSCAR DADOS
    const apiResponse = await fetch("https://integracao.tecnofit.com.br/v1/financial/receivables?page=1&limit=100", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    })

    const json = await apiResponse.json()

    // 🧠 AGRUPAR POR MÊS
    const mapa: any = {}

    json.data.forEach((item: any) => {

      if (item.type !== "sale") return

    // 🔥 GARANTE QUE TEM VALOR REAL
      if (!item.receipt) return
      if (!item.receipt.netValue) return

    // 🔥 PEGA DATA DE PAGAMENTO OU FALLBACK
    const data = item.receipt?.paymentDate || item.receipt?.date

    if (!data) return

      const ano = Number(data.split("-")[0])
      const mes = Number(data.split("-")[1])

      const chave = `${ano}-${mes}`

      if (!mapa[chave]) {
        mapa[chave] = {
          faturamento: 0
        }
      }

      mapa[chave].faturamento =
        Number((mapa[chave].faturamento + Number(item.receipt?.netValue || 0)).toFixed(2))
    })

    // 💾 SALVAR NO BANCO
    for (const chave in mapa) {

      const [ano, mes] = chave.split("-")

      await supabase
        .from("dados_mensais")
        .upsert({
          academia_id: integracao.academia_id,
          ano: Number(ano),
          mes: Number(mes),
          faturamento: mapa[chave].faturamento
        }, {
          onConflict: "academia_id,ano,mes"
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}