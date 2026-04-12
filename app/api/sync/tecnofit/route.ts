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

    const mapa: any = {}
    const idsProcessados = new Set()

    let pagina = 1

    // 🔥 LOOP CORRETO
    while (true) {

      const response = await fetch(
        `https://integracao.tecnofit.com.br/v1/financial/receivables?page=${pagina}&limit=100&dueDateStart=2026-04-01&dueDateEnd=2026-04-30`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      )

      const json = await response.json()

      if (!json.data || json.data.length === 0) {
        break
      }

      console.log("Página:", pagina, "Qtd:", json.data.length)

      json.data.forEach((item: any) => {

        if (!item.receipt) return

        // 🔥 EVITA DUPLICIDADE
        if (idsProcessados.has(item.id)) return
        idsProcessados.add(item.id)

       // 🔥 FILTRO DE STATUS
        if (item.status !== "paid" && item.status !== "pending") return

        const valor =
          Number(item.receipt.paidAmount) ||
          Number(item.receipt.netValue) ||
          Number(item.receipt.grossValue) ||
          0

        if (valor <= 0) return

        const dataPagamento = item.receipt.paymentDate
        const dataRef = item.receipt.paymentDate || item.receipt.dueDate

        if (!dataRef) return

        const ano = Number(dataRef.split("-")[0])
        const mes = Number(dataRef.split("-")[1])

        const chave = `${ano}-${mes}`

        if (!mapa[chave]) {
          mapa[chave] = {
            faturamento: 0,
            faturamento_previsto: 0
          }
        }

        // 🔥 PREVISTO
        mapa[chave].faturamento_previsto += valor

        // 🔥 REAL
        if (dataPagamento) {
          mapa[chave].faturamento += valor
        }

      })

      pagina++
    }

    // 💾 SALVAR NO BANCO
    for (const chave in mapa) {

      const [ano, mes] = chave.split("-")
      const dados = mapa[chave]

      await supabase
        .from("dados_mensais")
        .upsert({
          academia_id: integracao.academia_id,
          ano: Number(ano),
          mes: Number(mes),
          faturamento: Number(dados.faturamento.toFixed(2)),
          faturamento_previsto: Number(dados.faturamento_previsto.toFixed(2))
        }, {
          onConflict: "academia_id,ano,mes"
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}