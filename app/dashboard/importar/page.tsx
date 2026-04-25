"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
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

  async function processarDados(dados: any[], tipo: "receita" | "despesa") {

    const dadosConvertidos = dados
      .map((item: any) => {

         const itemLimpo: any = {}

         Object.keys(item).forEach((key) => {
           const novaKey = key.trim().replace(/\s+/g, " ")
           itemLimpo[novaKey] = item[key]
         })  

          const valores = Object.values(itemLimpo)

        const temHeader =
          item["Descrição"] ||
          item["Valor Pago"] ||
          item["Valor Total"]

        // ======================
        // 🔥 DESCRIÇÃO
        // ======================
        let descricao = null

        if (temHeader) {
          descricao =
            item["Descrição"] ||
            item["Cliente"] ||
            item["Fornecedor"]
        } else {
          descricao = valores[1]
        }

        // ======================
        // 🔥 VALOR
        // ======================
        let valorBruto = null

        if (temHeader) {
          valorBruto =
            item["Valor Pago"] ||
            item["Valor Total"] ||
            item["Valor"]
        } else {
          valorBruto = valores.find((v: any) =>
            String(v).includes("R$")
          )
        }

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

        // ======================
        // 🔥 DATA
        // ======================
        let dataBruta = null

        if (temHeader) {
          dataBruta =
            item["Data Pagamento"] ||
            item["Data Vencimento"]
        } else {
          dataBruta = valores.find((v: any) =>
            String(v).includes("/")
          )
        }

        let data = null

        if (dataBruta && String(dataBruta).includes("/")) {
          const partes = String(dataBruta).split("/")
          if (partes.length === 3) {
            const [dia, mes, ano] = partes
            data = `${ano}-${mes}-${dia}`
          }
        }

        if (!data) {
          console.log("⚠️ usando data atual:", item)
          data = new Date().toISOString().split("T")[0]
        }

        // ======================
        // 🔥 CATEGORIA
        // ======================
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

    if (dadosConvertidos.length === 0) {
      alert("Nenhum dado válido encontrado")
      return
    }

    const { error } = await supabase
      .from("lancamentos")
      .insert(dadosConvertidos)

    if (error) {
      console.error(error)
      alert("Erro ao importar")
    } else {
      alert("Importação concluída!")
    }
  }

  async function handleFile(file: File, tipo: "receita" | "despesa") {

    if (!academiaId) {
      alert("Selecione uma academia")
      return
    }

    setLoading(true)

    const nome = file.name.toLowerCase()

    // ======================
    // 🔥 CSV
    // ======================
    if (nome.endsWith(".csv")) {

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: async (results) => {
          console.log("📊 CSV:", results.data)
          await processarDados(results.data, tipo)
          setLoading(false)
        }
      })

    } else {

      // ======================
      // 🔥 EXCEL
      // ======================
      const reader = new FileReader()

      reader.onload = async (e) => {

        const data = new Uint8Array(e.target?.result as ArrayBuffer)

        const workbook = XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          range: 2 // pula as 2 primeiras linhas
        })  

        console.log("📊 EXCEL:", jsonData)

        await processarDados(jsonData, tipo)

        setLoading(false)
      }

      reader.readAsArrayBuffer(file)
    }
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Importar Dados</h1>

      {academias.length > 1 && (
        <select
          value={academiaId}
          onChange={(e) => setAcademiaId(e.target.value)}
          className="bg-[#0f1c33] border border-gray-700 px-4 py-2 rounded mb-6"
        >
          <option value="">Selecione a academia</option>
          {academias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      )}

      <div className="mb-6">
        <p>Importar RECEITAS</p>
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "receita")
            }
          }}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      <div>
        <p>Importar DESPESAS</p>
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={(e) => {
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