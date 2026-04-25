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
      const { data } = await supabase
        .from("academias")
        .select("*")

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

    if (!academiaId) {
      alert("Selecione uma academia antes de importar")
      return
    }

    setLoading(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {

        const dadosConvertidos = results.data
          .map((item: any) => {

            // =========================
            // 🔥 DATA (CORRIGIDO)
            // =========================
            const dataBruta =
              item["Data"] ||
              item["Vencimento"] ||
              item["Data de Vencimento"]

            if (!dataBruta) {
              console.log("❌ sem data:", item)
              return null
            }

            let data = ""

            if (String(dataBruta).includes("/")) {
              const partes = String(dataBruta).split("/")
              if (partes.length === 3) {
                const [dia, mes, ano] = partes
                data = `${ano}-${mes}-${dia}`
              }
            } else {
              data = dataBruta
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
            } 
            else if (
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
              academia_id: academiaId
            }
          })
          .filter(Boolean)

        // =========================
        // 🔥 DEBUG
        // =========================
        console.log("TOTAL REGISTROS:", dadosConvertidos.length)
        console.log("DADOS:", dadosConvertidos)

        // =========================
        // 🚫 BLOQUEAR SE VAZIO
        // =========================
        if (dadosConvertidos.length === 0) {
          alert("Nenhum dado válido foi encontrado no arquivo")
          setLoading(false)
          return
        }

        // =========================
        // 🔥 INSERT
        // =========================
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

      {/* SELECT ACADEMIA */}
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

      {/* RECEITAS */}
      <div className="mb-6">
        <p className="mb-2">Importar RECEITAS</p>

        <label className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg cursor-pointer inline-block">
          Selecionar Arquivo

          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              console.log("📁 arquivo selecionado")

              if (e.target.files?.[0]) {
                console.log("🔥 chamando handleFile")
                handleFile(e.target.files[0], "receita")
              }
            }}
          />
        </label>
      </div>

      {/* DESPESAS */}
      <div>
        <p className="mb-2">Importar DESPESAS</p>

        <label className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg cursor-pointer inline-block">
          Selecionar Arquivo

          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              console.log("📁 arquivo selecionado")
              
              if (e.target.files?.[0]) {
               console.log("🔥 chamando handleFile")  
                handleFile(e.target.files[0], "despesa")
              }
            }}
          />
        </label>
      </div>

      {loading && <p className="mt-4">Importando...</p>}

    </div>
  )
}