"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { normalizarCRM } from "@/lib/importadores/crmImportador";

export default function CRMPage() {
  const [loading, setLoading] = useState(false);

  const [academias, setAcademias] = useState<any[]>([]);

  const [academiaId, setAcademiaId] = useState("");

  // CARREGAR ACADEMIAS
  useEffect(() => {
    carregarAcademias();
  }, []);

  async function carregarAcademias() {
    const { data, error } = await supabase
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
  async function importarCRM(e: any) {
    try {
      const file = e.target.files[0];

      if (!file) return;

      // VALIDAR ACADEMIA
      if (!academiaId) {
        alert("Selecione uma academia");

        return;
      }

      setLoading(true);

      // NORMALIZAR EXCEL
      const registros: any = await normalizarCRM(file);

      console.log("CRM NORMALIZADO:", registros);

      // PAYLOAD
      const payload = registros.map((item: any) => ({
        academia_id: academiaId,

        sistema_origem: "CRM",

        data_cadastro: item.data_cadastro,

        nome: item.nome,

        telefone: item.telefone,

        email: item.email,

        lista: item.lista,

        status: item.etapa,

        vendedor: item.vendedor,
      }));

      console.log("PAYLOAD CRM:", payload);

      // INSERT
      const { error } = await supabase.from("fato_crm").insert(payload);

      if (error) {
        console.log(error);

        alert("Erro ao importar CRM");

        return;
      }

      alert("CRM importado com sucesso!");
    } catch (error) {
      console.log(error);

      alert("Erro no processamento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050b18] text-white p-10">
      {/* HEADER */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold">CRM Analytics</h1>

          <p className="text-gray-400 mt-2">
            Pipeline comercial e funil de conversão
          </p>
        </div>

        {/* FILTROS */}

        <div className="flex flex-col md:flex-row gap-4">
          {/* FILTRO MÊS */}

          <select className="bg-[#0f1c33] border border-white/10 px-5 py-3 rounded-xl min-w-[220px]">
            <option>Todos os meses</option>

            <option>Janeiro</option>

            <option>Fevereiro</option>

            <option>Março</option>

            <option>Abril</option>

            <option>Maio</option>

            <option>Junho</option>

            <option>Julho</option>

            <option>Agosto</option>

            <option>Setembro</option>

            <option>Outubro</option>

            <option>Novembro</option>

            <option>Dezembro</option>
          </select>

          {/* FILTRO ACADEMIA */}

          <select
            value={academiaId}
            onChange={(e) => setAcademiaId(e.target.value)}
            className="bg-[#0f1c33] border border-white/10 px-5 py-3 rounded-xl min-w-[280px]"
          >
            <option value="">Todas as academias</option>

            {academias.map((academia: any) => (
              <option key={academia.id} value={academia.id}>
                {academia.nome}
              </option>
            ))}
          </select>

          {/* IMPORTAR */}

          <label className="bg-cyan-500 hover:bg-cyan-400 transition-all text-black font-semibold px-6 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-3">
            <span>⬆</span>
            Importar CRM
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={importarCRM}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* FUNIL */}

      <div className="bg-[#0f1c33] rounded-2xl p-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold">Funil Comercial</h2>

          <p className="text-gray-400 mt-2">Conversão entre etapas do CRM</p>
        </div>

        <div className="flex flex-col items-center">
          {/* TOPO */}

          <div className="w-[90%] bg-cyan-500/30 border border-cyan-400 rounded-t-full py-8 text-center mb-2">
            <p className="text-gray-300 text-sm">Contato Inicial</p>

            <h3 className="text-5xl font-bold mt-2">2076</h3>
          </div>

          {/* AGENDADOS */}

          <div className="w-[70%] bg-cyan-500/20 border border-cyan-400 py-8 text-center mb-2">
            <p className="text-gray-300 text-sm">Agendados</p>

            <h3 className="text-4xl font-bold mt-2">567</h3>

            <p className="text-pink-400 mt-3 font-semibold">27%</p>
          </div>

          {/* AULA */}

          <div className="w-[50%] bg-cyan-500/10 border border-cyan-400 py-8 text-center mb-2">
            <p className="text-gray-300 text-sm">Aula Experimental</p>

            <h3 className="text-3xl font-bold mt-2">392</h3>

            <p className="text-pink-400 mt-3 font-semibold">69%</p>
          </div>

          {/* FECHADOS */}

          <div className="w-[30%] bg-cyan-500/5 border border-cyan-400 rounded-b-full py-8 text-center">
            <p className="text-gray-300 text-sm">Fechados</p>

            <h3 className="text-2xl font-bold mt-2">225</h3>

            <p className="text-pink-400 mt-3 font-semibold">57%</p>
          </div>
        </div>

        {/* LOADING */}

        {loading && (
          <div className="mt-6">
            <p className="text-cyan-400">Importando CRM...</p>
          </div>
        )}
      </div>
    </div>
  );
}
