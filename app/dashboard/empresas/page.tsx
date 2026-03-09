"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"

export default function Empresas() {

  const [nome, setNome] = useState("")
  const [cidade, setCidade] = useState("")
  const [loading, setLoading] = useState(false)

  async function cadastrarEmpresa() {

    if (!nome) {
      alert("Informe o nome da academia")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("empresas")
      .insert([
        {
          nome: nome,
          cidade: cidade
        }
      ])

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Erro ao cadastrar academia")
    } else {
      alert("Academia cadastrada com sucesso!")
      setNome("")
      setCidade("")
    }

  }

  return (

    <div>

      <h1 className="text-3xl font-bold mb-8">
        Academias
      </h1>

      <div className="bg-[#0f1c33] p-8 rounded-xl max-w-xl">

        <label className="block text-gray-400 mb-2">
          Nome da Academia
        </label>

        <input
          className="w-full p-3 mb-6 bg-[#0a162b] rounded-lg"
          value={nome}
          onChange={(e)=>setNome(e.target.value)}
        />

        <label className="block text-gray-400 mb-2">
          Cidade
        </label>

        <input
          className="w-full p-3 mb-6 bg-[#0a162b] rounded-lg"
          value={cidade}
          onChange={(e)=>setCidade(e.target.value)}
        />

        <button
          onClick={cadastrarEmpresa}
          className="w-full bg-cyan-500 hover:bg-cyan-600 p-3 rounded-lg"
        >

          {loading ? "Salvando..." : "Cadastrar Academia"}

        </button>

      </div>

    </div>

  )

}