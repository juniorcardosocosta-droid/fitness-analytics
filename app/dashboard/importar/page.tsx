"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import { supabase } from "../../../lib/supabaseClient"

export default function Importar() {
  const [loading, setLoading] = useState(false)
  const [academias, setAcademias] = useState<any[]>([])
  const [academiaId, setAcademiaId] = useState("")

  useEffect(() => {
    async function loadAcademias() {
      const { data } = await supabase.from("academias").select("*")

      if (data) {
        setAcademias(data)

        if (data.length === 1) {
          setAcademiaId(data[0].id)
        }
      }
    }

    loadAcademias()
  }, [])

  async function handleFile(file: File, tipo: "receita" | "despesa") {
    console.log("🔥 HANDLE FILE EXECUTOU")

    if (!academiaId) {
      alert("Selecione uma academia antes de importar")
      return
    }

    setLoading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log("📊 RESULTADOS BRUTOS:", results.data)

        const dadosConvertidos = results.data
          .map((item: any) => {

            // =========================
            // 🔥 DATA (CORRIGIDO TECNOFIT)
            // =========================
            let data = null

            const dataBruta =
              item["Data"] ||
              item["Vencimento"] ||
              item["Data de Vencimento"] ||
              item["Pagamento"]

            // tenta pegar direto
            if (dataBruta) {
              if (String(dataBruta).includes("/")) {
                const partes = String(dataBruta).split("/")
                if (partes.length === 3) {
                  const [dia, mes, ano] = partes
                  data = `${ano}-${mes}-${dia}`
                }
              } else {
                data = dataBruta
              }
            }

            // 🔥 fallback Tecnofit → Período
            if (!data && item["Período"]) {
              const periodo = String(item["Período"])
              const partes = periodo.split("-")

              if (partes.length > 0) {
                const inicio = partes[0].trim()

                if (inicio.includes("/")) {
                  const [dia, mes, ano] = inicio.split("/")
                  data = `${ano}-${mes}-${dia}`
                }
              }
            }

            // 🔥 fallback final (NUNCA PERDE DADO)
            if (!data) {
              console.log("⚠️ usando data atual:", item)
              data = new Date().toISOString().split("T")[0]
            }

            // =========================
            // 🔥 DESCRIÇÃO
            // =========================
            const descricao =
              item["Descrição"] ||
              item["Aluno"] ||
              item["Cliente"] ||
              item["Fornecedor"] ||
              item["Histórico"]

            // =========================
            // 🔥 VALOR
            // =========================
            const valorBruto =
              item["Valor"] ||
              item["Valor Total"] ||
              item["Valor Original"] ||
              item["Valor Pago"] ||
              item["Recebido"] ||
              item["Pago"]

            if (!valorBruto) {
              console.log("❌ sem valor:", item)
              return null
            }

            const valor = Number(
              String(valorBruto)
                .replace("R$", "")
                .replace(/\./g, "")
                .replace(",", ".")
                .trim()
            )

            if (isNaN(valor)) {
              console.log("❌ valor inválido:", valorBruto)
              return null
            }

            // =========================
            // 🔥 CATEGORIA
            // =========================
            let categoria = "outros"
            const desc = descricao?.toLowerCase() || ""

            if (desc.includes("mensalidade") || desc.includes("plano")) {
              categoria = "recorrencia"
            } else if (
              desc.includes("ifood") ||
              desc.includes("app") ||
              desc.includes("online")
            ) {
              categoria = "agregador"
            }

            return {
              data,
              descricao,
              tipo,
              categoria,
              valor,
              academia_id: academiaId,
            }
          })
          .filter(Boolean)

        console.log("✅ TOTAL REGISTROS:", dadosConvertidos.length)
        console.log("📦 DADOS FINAL:", dadosConvertidos)

        if (dadosConvertidos.length === 0) {
          alert("Nenhum dado válido encontrado")
          setLoading(false)
          return
        }

        const { error } = await supabase
          .from("lancamentos")
          .insert(dadosConvertidos)

        if (error) {
          console.error(error)
          alert("Erro ao importar")
        } else {
          alert("Importação concluída com sucesso!")
        }

        setLoading(false)
      },
    })
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Importar Dados</h1>

      {academias.length > 1 && (
        <select
          value={academiaId}
          onChange={(e) => setAcademiaId(e.target.value)}
          className="bg-[#0f1c33] border border-gray-700 text-white px-4 py-2 rounded-lg mb-6"
        >
          <option value="">Selecione a academia</option>

          {academias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      )}

      {/* RECEITA */}
      <div className="mb-6">
        <p className="mb-2">Importar RECEITAS</p>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            console.log("📁 arquivo selecionado RECEITA")

            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "receita")
            }
          }}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      {/* DESPESA */}
      <div>
        <p className="mb-2">Importar DESPESAS</p>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            console.log("📁 arquivo selecionado DESPESA")

            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "despesa")
            }
          }}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      {loading && <p className="mt-4">Importando...</p>}
    </div>
  )
}