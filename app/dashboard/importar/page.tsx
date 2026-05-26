"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { supabase } from "../../../lib/supabaseClient";
import { importarTecnofit } from "../../../lib/importadores/tecnofit";
import { importarEvo } from "../../../lib/importadores/evo";
import { importarUltra } from "../../../lib/importadores/ultra";
import { importarPacto } from "../../../lib/importadores/pacto";
import { importarComercialTecnofit } from "../../../lib/importadores/comercialTecnofit";

export default function Importar() {
  const [loading, setLoading] = useState(false);
  const [academias, setAcademias] = useState<any[]>([]);
  const [academiaId, setAcademiaId] = useState<string>("");
  const [erp, setErp] = useState("tecnofit");

  useEffect(() => {
    async function loadAcademias() {
      const { data } = await supabase.from("academias").select("*");

      if (data) {
        setAcademias(data);
        if (data.length === 1) {
          setAcademiaId(data[0].id);
        }
      }
    }

    loadAcademias();
  }, []);

  const parseNumero = (v: any): number => {
    if (!v) return 0;

    if (typeof v === "number") return v;

    return Number(
      String(v)
        .replace(/R\$\s?/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim(),
    );
  };

  async function processarDados(
    dados: any[],
    tipo: "receita" | "despesa" | "comercial",
  ) {
    let dadosConvertidos: any[] = [];

    if (erp === "tecnofit") {
      if (tipo === "comercial") {
        dadosConvertidos = importarComercialTecnofit(dados, academiaId);
      } else {
        dadosConvertidos = importarTecnofit(dados, tipo, academiaId);
      }
    } else if (tipo !== "comercial") {
      if (erp === "evo") {
        dadosConvertidos = await importarEvo(dados, tipo, academiaId);
      } else if (erp === "ultra") {
        dadosConvertidos = importarUltra(dados, tipo, academiaId);
      } else if (erp === "pacto") {
        dadosConvertidos = importarPacto(dados, tipo, academiaId);
      }
    }

    console.log("✅ TOTAL REGISTROS:", dadosConvertidos.length);

    if (dadosConvertidos.length === 0) {
      alert("Nenhum dado válido encontrado");
      return;
    }

    // ================= ALERTA DE MÊS JÁ IMPORTADO =================
    const primeiraData = dadosConvertidos[0]?.data;

    if (primeiraData) {
      const dataRef = new Date(primeiraData);
      const mes = dataRef.getMonth() + 1;
      const ano = dataRef.getFullYear();

      const inicioMes = `${ano}-${String(mes).padStart(2, "0")}-01`;

      const ultimoDiaMes = new Date(ano, mes, 0).getDate();

      const fimMes = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDiaMes).padStart(2, "0")}`;

      const { data: existentes } = await supabase
        .from("lancamentos")
        .select("id")
        .eq("academia_id", academiaId)
        .eq("tipo", tipo)
        .gte("data", inicioMes)
        .lte("data", fimMes)
        .limit(1);

      if (existentes && existentes.length > 0) {
        const confirmar = confirm(
          `Já existem dados para ${mes}/${ano}. Deseja reimportar?`,
        );

        if (!confirmar) {
          alert("Importação cancelada");
          return;
        }
      }
    }

    // 🔥 UPSERT (NÃO DUPLICA)
    const { error } = await supabase
      .from(tipo === "comercial" ? "fato_comercial" : "lancamentos")
      .upsert(dadosConvertidos, {
        onConflict: "academia_id,import_id",
      });

    if (error) {
      console.error(error);
      alert("Erro ao importar");
    } else {
      alert("Importação concluída sem duplicidade!");
    }
  }

  async function handleFile(
    file: File,
    tipo: "receita" | "despesa" | "comercial",
  ) {
    if (!academiaId) {
      alert("Selecione uma academia");
      return;
    }

    setLoading(true);

    const nome = file.name.toLowerCase();

    if (nome.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          await processarDados(results.data, tipo);
          setLoading(false);
        },
      });
    } else {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);

        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          range:
            erp === "tecnofit"
              ? 0
              : erp === "ultra" && tipo === "despesa"
                ? 1
                : 0,
        });

        console.log("TOTAL LINHAS EXCEL:", jsonData.length);
        console.log("PRIMEIRA LINHA EXCEL:", jsonData[0]);
        console.log("TODAS AS CHAVES:", Object.keys(jsonData[0] || {}));

        await processarDados(jsonData, tipo);

        setLoading(false);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl mb-6">Importar Dados</h1>

      <select
        value={erp}
        onChange={(e) => setErp(e.target.value)}
        className="bg-[#0f1c33] border border-gray-700 px-4 py-2 rounded mb-6 mr-4"
      >
        <option value="tecnofit">Tecnofit</option>
        <option value="evo">EVO</option>
        <option value="ultra">Rede Ultra</option>
        <option value="pacto">Pacto</option>
      </select>

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
          accept=".csv, .xlsx, .xls"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "receita");
            }
          }}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      <div>
        <p>Importar DESPESAS</p>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "despesa");
            }
          }}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      <div className="mt-6">
        <p>Importar COMERCIAL</p>

        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFile(e.target.files[0], "comercial");
            }
          }}
          className="bg-white text-black p-2 rounded"
        />
      </div>

      {loading && <p className="mt-4">Importando...</p>}
    </div>
  );
}
