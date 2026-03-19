"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Integracoes() {

  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [loading, setLoading] = useState(false)

  const salvarIntegracao = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    const user = userData.user

    if (!user) {
      alert("Usuário não autenticado")
      return
    }

    // ⚠️ IMPORTANTE: você precisa ter academia_id
    const academia_id = "COLOQUE_ID_FIXO_POR_ENQUANTO"

    const { error } = await supabase
      .from("integracoes")
      .insert([
        {
          sistema: "tecnofit",
          api_key: apiKey,
          api_secret: apiSecret,
          academia_id: academia_id
        }
      ])

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Erro ao salvar integração")
    } else {
      alert("Integração salva com sucesso!")
    }
  }

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        Integração Tecnofit
      </h1>

      <input
        type="text"
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <input
        type="text"
        placeholder="API Secret"
        value={apiSecret}
        onChange={(e) => setApiSecret(e.target.value)}
        className="border p-2 w-full mb-3"
      />

      <button
        onClick={salvarIntegracao}
        className="bg-blue-600 text-white px-4 py-2"
      >
        {loading ? "Salvando..." : "Salvar Integração"}
      </button>

    </div>
  )
}