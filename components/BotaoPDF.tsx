"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import RelatorioPDF from "./RelatorioPDF"

export default function BotaoPDF({ dados }: any) {
  return (
    <PDFDownloadLink
      document={<RelatorioPDF dados={dados} />}
      fileName="relatorio.pdf"
    >
      {({ loading }) =>
        loading ? "Gerando PDF..." : (
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold">
            Baixar Relatório
          </button>
        )
      }
    </PDFDownloadLink>
  )
}