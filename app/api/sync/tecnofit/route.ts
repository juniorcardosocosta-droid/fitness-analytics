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
    

    // 🧠 AGRUPAR POR MÊS (NOVO CORRETO)
const mapa: any = {}

const idsProcessados = new Set()

const anoAtual = new Date().getFullYear()
const anoInicial = 2024

for (let ano = anoInicial; ano <= anoAtual; ano++) {

  for (let mes = 1; mes <= 12; mes++) {

    const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`
    const fim = `${ano}-${String(mes).padStart(2, "0")}-31`

    let pagina = 1
    let continuar = true

    while (continuar) {

      const response = await fetch(
        `https://integracao.tecnofit.com.br/v1/financial/receivables?page=${pagina}&limit=100&paymentDateStart=${inicio}&paymentDateEnd=${fim}`,
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

        json.data.forEach((item: any) => {

  if (item.type !== "sale") return
  if (!item.receipt) return
  if (!item.receipt.grossValue) return

  // 🔥 EVITA DUPLICIDADE
  if (idsProcessados.has(item.receipt.id)) return
  idsProcessados.add(item.receipt.id)

  const data = item.receipt?.paymentDate || item.receipt?.date
  if (!data) return

  const anoData = Number(data.split("-")[0])
  const mesData = Number(data.split("-")[1])

  const chave = `${anoData}-${mesData}`

  if (!mapa[chave]) {
    mapa[chave] = { faturamento: 0 }
  }

  mapa[chave].faturamento += Number(item.receipt.grossValue || 0)
})

        pagina++
      }
    }
  }
}
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