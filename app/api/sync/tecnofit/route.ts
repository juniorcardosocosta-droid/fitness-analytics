import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {

    // 🔎 Buscar integração
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

    // 🔥 BUSCAR TODOS OS DADOS (SEM FILTRO)
    let pagina = 1
    let continuar = true

    const todosDados: any[] = []

    while (continuar) {

      const response = await fetch(
        `https://integracao.tecnofit.com.br/v1/financial/receivables?page=${pagina}&limit=100`,
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
        continuar = false
      } else {
        todosDados.push(...json.data)
        pagina++
      }
    }

    // 🔥 PROCESSAR DADOS
    todosDados.forEach((item: any) => {

      if (!item.receipt) return

      const valor = Number(item.receipt.netValue || 0)
      if (valor <= 0) return

      const dataPagamento = item.receipt.paymentDate
      const dataRef = item.receipt.paymentDate || item.receipt.dueDate

      if (!dataRef) return

      const anoData = Number(dataRef.split("-")[0])
      const mesData = Number(dataRef.split("-")[1])

      const chave = `${anoData}-${mesData}`

      if (!mapa[chave]) {
        mapa[chave] = {
          faturamento: 0,
          vendas_recebidas: 0,
          vendas_realizadas: 0,
          faturamento_previsto: 0
        }
      }

      // 🔥 PREVISTO = TUDO
      mapa[chave].faturamento_previsto += valor

      // 🔥 REAL = PAGO
      if (dataPagamento) {
        mapa[chave].faturamento += valor
        mapa[chave].vendas_recebidas += valor
      }

      // 🔥 REALIZADAS
      mapa[chave].vendas_realizadas += valor

    })

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
          vendas_recebidas: Number(dados.vendas_recebidas.toFixed(2)),
          vendas_realizadas: Number(dados.vendas_realizadas.toFixed(2)),
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