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
      .map((item: any, index: number) => {

        // ================= STATUS (COLUNA A) =================
        const statusTexto = String(item.A || "").toLowerCase()
        const status =
          statusTexto.includes("vencida") ? "pendente" : "pago"

        // ================= DESCRIÇÃO =================
        const descricao =
          item["Descrição"] ||
          item["Cliente"] ||
          item["Fornecedor"] ||
          ""
        // ================= STATUS DO CLIENTE =================
        const status_cliente =
          tipo === "receita"
            ? item["Status do cliente"] || ""
            : ""


        // ================= VALOR =================
        const valor =
          tipo === "receita"
            ? parseNumero(item["Valor Líquido"])
            : parseNumero(item["Valor Pago"] || item["Valor"])

        // ❌ NÃO descarta mais por zero
        if (valor === null || valor === undefined || isNaN(valor)) {
          console.log("ERRO NO VALOR:", item)
          return null
        }

        // ================= VALORES EXTRA =================
        const valorBruto =
          tipo === "receita"
            ? parseNumero(item["Valor Bruto"])
            : 0

        const taxa =
          tipo === "receita"
            ? parseNumero(item["Valor Taxa"])
            : 0

        // ================= DATA =================
        const dataBruta =
          tipo === "receita"
            ? item["Data Crédito"]
            : item["Data Pagamento"]

        let data = new Date().toISOString().split("T")[0]

        if (dataBruta) {
          const partes = String(dataBruta).split("/")

          if (partes.length === 3) {
            const [dia, mes, ano] = partes
            data = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`
          }
        }

        // ================= ORIGEM =================
        const origem =
          item["Forma"] || (tipo === "despesa" ? "despesa" : "")

        // ================= CATEGORIA =================
        const categoria =
          tipo === "despesa"
            ? item["Categoria"] || "outros"
            : "receita"

         // ================= IMPORT_ID (🔥 CHAVE DO SISTEMA) =================
        const import_id = btoa(
          `${item["Cliente"]}-${item["Data Crédito"]}-${item["Valor Líquido"]}-${item["Descrição"]}-${index}`
        )

        return {
          data,
          descricao,
          tipo,
          categoria,
          valor,
          valor_bruto: valorBruto,
          taxa,
          origem,
          status,
          status_cliente,
          import_id,
          academia_id: academiaId,
        }
      })
      .filter(Boolean)

    console.log("✅ TOTAL REGISTROS:", dadosConvertidos.length)

    if (dadosConvertidos.length === 0) {
      alert("Nenhum dado válido encontrado")
      return
    }

    // ================= ALERTA DE MÊS JÁ IMPORTADO =================
const primeiraData = dadosConvertidos[0]?.data

if (primeiraData) {

  const dataRef = new Date(primeiraData)
  const mes = dataRef.getMonth() + 1
  const ano = dataRef.getFullYear()

  const inicioMes = `${ano}-${String(mes).padStart(2, "0")}-01`
  const fimMes = `${ano}-${String(mes).padStart(2, "0")}-31`

  const { data: existentes } = await supabase
    .from("lancamentos")
    .select("id")
    .eq("academia_id", academiaId)
    .gte("data", inicioMes)
    .lte("data", fimMes)
    .limit(1)

  if (existentes && existentes.length > 0) {

    const confirmar = confirm(
      `Já existem dados para ${mes}/${ano}. Deseja reimportar?`
    )

    if (!confirmar) {
      alert("Importação cancelada")
      return
    }
  }
}

    // 🔥 UPSERT (NÃO DUPLICA)
    const { error } = await supabase
      .from("lancamentos")
      .upsert(dadosConvertidos, {
        onConflict: "academia_id,import_id"
    })

    if (error) {
      console.error(error)
      alert("Erro ao importar")
    } else {
      alert("Importação concluída sem duplicidade!")
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