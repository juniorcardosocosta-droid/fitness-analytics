"use client"

import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "../../../lib/supabaseClient"

export default function Importar() {

  const [loading, setLoading] = useState(false)

  async function handleFile(file: File, tipo: "receita" | "despesa") {

    setLoading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {

        const dadosConvertidos = results.data.map((item: any) => {

          // AJUSTE AQUI CONFORME SEU CSV
          const data = item["Data"] || item["Vencimento"]
          const descricao = item["Descrição"] || item["Cliente"] || item["Fornecedor"]
          const valorBruto = item["Valor"] || item["Valor Total"]

          // CONVERTER VALOR
          const valor = Number(
            String(valorBruto)
              .replace("R$", "")
              .replace(/\./g, "")
              .replace(",", ".")
              .trim()
          )

          return {
            data: data,
            descricao: descricao,
            tipo: tipo,
            categoria: "importado",
            valor: valor
          }
        })

        const { error } = await supabase
          .from("lancamentos")
          .insert(dadosConvertidos)

        if (error) {
          console.error(error)
          alert("Erro ao importar")
        } else {
          alert("Importação concluída!")
        }

        setLoading(false)
      }
    })
  }

  return (
    <div className="p-10 text-white">

      <h1 className="text-3xl mb-6">Importar Dados</h1>

      <div className="mb-6">
        <p className="mb-2">Importar RECEITAS (Contas a Receber)</p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "receita")
            }
          }}
        />
      </div>

      <div>
        <p className="mb-2">Importar DESPESAS (Contas a Pagar)</p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "despesa")
            }
          }}
        />
      </div>

      {loading && <p className="mt-4">Importando...</p>}

    </div>
  )
}