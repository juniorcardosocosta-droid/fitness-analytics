"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { normalizarCRM }
from "@/lib/importadores/crmImportador";

export default function CRMPage() {

  const [loading, setLoading] =
    useState(false);

  const [academias, setAcademias] =
    useState<any[]>([]);

  const [academiaId, setAcademiaId] =
    useState("");

  // CARREGAR ACADEMIAS
  useEffect(() => {

    carregarAcademias();

  }, []);

  async function carregarAcademias() {

    const { data, error } =
      await supabase
        .from("academias")
        .select("*")
        .order("nome");

    if (error) {

      console.log(error);
      return;

    }

    if (data) {

      setAcademias(data);

    }

  }

  // IMPORTAR CRM
  async function importarCRM(
    e: any
  ) {

    try {

      const file =
        e.target.files[0];

      if (!file) return;

      // VALIDAR ACADEMIA
      if (!academiaId) {

        alert(
          "Selecione uma academia"
        );

        return;

      }

      setLoading(true);

      // NORMALIZAR EXCEL
      const registros: any =
        await normalizarCRM(file);

      console.log(
        "CRM NORMALIZADO:",
        registros
      );

      // PAYLOAD
      const payload =
        registros.map((item: any) => ({

          academia_id:
            academiaId,

          sistema_origem:
            "CRM",

          data_cadastro:
            item.data_cadastro,

          nome:
            item.nome,

          telefone:
            item.telefone,

          email:
            item.email,

          lista:
            item.lista,

          status:
            item.etapa,

          vendedor:
            item.vendedor

        }));

      console.log(
        "PAYLOAD CRM:",
        payload
      );

      // INSERT
      const { error } =
        await supabase
          .from("fato_crm")
          .insert(payload);

      if (error) {

        console.log(error);

        alert(
          "Erro ao importar CRM"
        );

        return;

      }

      alert(
        "CRM importado com sucesso!"
      );

    } catch (error) {

      console.log(error);

      alert(
        "Erro no processamento"
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="min-h-screen bg-[#050b18] text-white p-10">

      <div className="mb-10">

        <h1 className="text-4xl font-bold">
          CRM Analytics
        </h1>

        <p className="text-gray-400 mt-2">
          Pipeline comercial e funil de conversão
        </p>

      </div>

      <div className="bg-[#0f1c33] rounded-xl p-8 max-w-2xl">

        <h2 className="text-2xl font-semibold mb-6">
          Importar CRM
        </h2>

        {/* SELECT ACADEMIA */}
        <select
          value={academiaId}
          onChange={(e) =>
            setAcademiaId(
              e.target.value
            )
          }
          className="bg-[#162544] px-4 py-3 rounded-lg w-full mb-6"
        >

          <option value="">
            Selecione a academia
          </option>

          {academias.map((academia: any) => (

            <option
              key={academia.id}
              value={academia.id}
            >
              {academia.nome}
            </option>

          ))}

        </select>

        {/* INPUT FILE */}
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={importarCRM}
          className="mb-6 block w-full"
        />

        {/* LOADING */}
        {loading && (

          <p className="text-cyan-400">
            Importando CRM...
          </p>

        )}

      </div>

    </div>

  );

}