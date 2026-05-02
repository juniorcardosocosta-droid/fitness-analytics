"use client"

import { pdf } from "@react-pdf/renderer"
import RelatorioPDF from "./RelatorioPDF"

export default function BotaoPDF({ dados, gerarImagens }: any) {

  const handlePDF = async () => {
    try {
      const imagens = await gerarImagens()

      const blob = await pdf(
        <RelatorioPDF dados={dados} imagens={imagens} />
      ).toBlob()

      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "relatorio.pdf"
      a.click()

    } catch (error) {
      console.error(error)
      alert("Erro ao gerar PDF")
    }
  }

  return (
    <button
      onClick={handlePDF}
      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold"
    >
      Gerar Relatório Completo
    </button>
  )
}