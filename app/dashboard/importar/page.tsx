"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { supabase } from "../../../lib/supabaseClient"

export default function Importar() {
  const [loading, setLoading] = useState(false)
  const [academias, setAcademias] = useState<any[]>([])
  const [academiaId, setAcademiaId] = useState<string>("")

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

  const parseNumero = (v: any): number => {
    if (!v) return 0

    if (typeof v === "number") return v

    return Number(
      String(v)
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    )
  }

  async function processarDados(dados: any[], tipo: "receita" | "despesa") {

    const dadosConvertidos = dados
      .map((item: any) => {

        // 🔥 DESCRIÇÃO
        const descricao =
          item["Descrição"] ||
          item["Cliente"] ||
          item["Fornecedor"] ||
          ""

        // 🔥 VALORES CORRETOS
        const valor = parseNumero(item["Valor Líquido"])
        const valorBruto = parseNumero(item["Valor Bruto"])
        const taxa = parseNumero(item["Valor Taxa"])

        if (!valor) {
          console.log("❌ sem valor:", item)
          return null
        }

        // 🔥 DATA CORRETA (CRÉDITO)
        const dataBruta = item["Data Crédito"]

        let data = new Date().toISOString().split("T")[0]

        if (dataBruta) {
          const partes = String(dataBruta).split("/")

          if (partes.length === 3) {
            const [dia, mes, ano] = partes
            data = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`
          }
        }

        // 🔥 CATEGORIA
        let categoria = "outros"
        const desc = descricao.toLowerCase()

        if (desc.includes("plano") || desc.includes("mensalidade")) {
          categoria = "recorrencia"
        } else if (
          desc.includes("online") ||
          desc.includes("app") ||
          desc.includes("ifood")
        ) {
          categoria = "agregador"
        }

        const origem = item["Forma"] || ""

        return {
          data,
          descricao,
          tipo,
          categoria,
          valor,
          valor_bruto: valorBruto,
          taxa,
          origem,
          academia_id: academiaId,
        }
      })
      .filter(Boolean)

    console.log("✅ TOTAL REGISTROS:", dadosConvertidos.length)

    if (dadosConvertidos.length === 0) {
      alert("Nenhum dado válido encontrado")
      return
    }

    // 🔥 LIMPA ANTES DE IMPORTAR
    await supabase
      .from("lancamentos")
      .delete()
      .eq("academia_id", academiaId)

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

    if (nome.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processarDados(results.data, tipo)
          setLoading(false)
        }
      })
    } else {
      const reader = new FileReader()

      reader.onload = async (e) => {

        const data = new Uint8Array(e.target?.result as ArrayBuffer)

        const workbook = XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]

        // 🔥 AQUI ESTÁ O SEGREDO: SEM RANGE
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          range: 1
        })  

        await processarDados(jsonData, tipo)

        setLoading(false)
      }

      reader.readAsArrayBuffer(file)
    }
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Importar Dados</h1>

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