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
      headers: { "Content-Type": "application/json" },
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

    while (true) {

      const response = await fetch(
        `https://integracao.tecnofit.com.br/v1/financial/receivables?page=${pagina}&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const json = await response.json()

      if (!json.data || json.data.length === 0) break

      json.data.forEach((item: any) => {

        if (!item.receipt) return

        // evita duplicidade
        if (idsProcessados.has(item.id)) return
        idsProcessados.add(item.id)

        const valor =
          Number(item.receipt.netValue) ||
          Number(item.receipt.grossValue) ||
          0

        if (valor <= 0) return

        // 🔥 CAMPO CORRETO (DATA REAL DO PAGAMENTO)
        const paymentDate = item.receipt.date

        if (!paymentDate) return

        const ano = Number(paymentDate.split("-")[0])
        const mes = Number(paymentDate.split("-")[1])

        const chave = `${ano}-${mes}`

        if (!mapa[chave]) {
          mapa[chave] = {
            faturamento: 0,
            vendas_realizadas: 0
          }
        }

        // 💰 FATURAMENTO REAL
        mapa[chave].faturamento += valor

        // 📊 VENDAS
        mapa[chave].vendas_realizadas += valor

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
          vendas_realizadas: Number(dados.vendas_realizadas.toFixed(2))
        }, {
          onConflict: "academia_id,ano,mes"
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}