"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";

import { normalizarCRM } from "@/lib/importadores/crmImportador";

export default function CRMPage() {
  const [loading, setLoading] = useState(false);

  const [academias, setAcademias] = useState<any[]>([]);

  const [academiaId, setAcademiaId] = useState("");

  const [mesSelecionado, setMesSelecionado] = useState("");

  const [contatoInicial, setContatoInicial] = useState(0);

  const [agendados, setAgendados] = useState(0);

  const [aulaExperimental, setAulaExperimental] = useState(0);

  const [fechados, setFechados] = useState(0);

  const [pctAgendados, setPctAgendados] = useState(0);

  const [pctAula, setPctAula] = useState(0);

  const [pctFechados, setPctFechados] = useState(0);

  // CARREGAR ACADEMIAS
  useEffect(() => {
    carregarAcademias();
  }, []);

  useEffect(() => {
    carregarFunilCRM();
 }, [academiaId, mesSelecionado]);

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

  async function carregarFunilCRM() {
    let query = supabase.from("fato_crm").select("*");

    if (academiaId) {
      query = query.eq("academia_id", academiaId);
    }

    let { data, error } = await query;

    if (mesSelecionado && data) {
      data = data.filter((item: any) => {
        const dataCRM = new Date(item.data_cadastro);

        return dataCRM.getMonth() + 1 === Number(mesSelecionado);
      });
    }

    if (error) {
      console.log(error);
      return;
    }

    if (!data) return;

    const totalContato = data.length;

    const totalAgendado = data.filter(
      (item: any) => item.status === "AGENDADO",
    ).length;

    const totalAula = data.filter(
      (item: any) => item.status === "AULA_EXPERIMENTAL",
    ).length;

    const totalFechado = data.filter(
      (item: any) => item.status === "FECHADO",
    ).length;

    setContatoInicial(totalContato);

    setAgendados(totalAgendado);

    setAulaExperimental(totalAula);

    setFechados(totalFechado);

    const percentualAgendados =
      totalContato > 0 ? Math.round((totalAgendado / totalContato) * 100) : 0;

    const percentualAula =
      totalAgendado > 0 ? Math.round((totalAula / totalAgendado) * 100) : 0;

    const percentualFechados =
      totalAula > 0 ? Math.round((totalFechado / totalAula) * 100) : 0;

    setPctAgendados(percentualAgendados);

    setPctAula(percentualAula);

    setPctFechados(percentualFechados);
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

      carregarFunilCRM();
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

          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="bg-[#0f1c33] border border-white/10 px-5 py-3 rounded-xl min-w-[220px]"
          >
            <option value="">Todos os meses</option>

            <option value="1">Janeiro</option>

            <option value="2">Fevereiro</option>

            <option value="3">Março</option>

            <option value="4">Abril</option>

            <option value="5">Maio</option>

            <option value="6">Junho</option>

            <option value="7">Julho</option>

            <option value="8">Agosto</option>

            <option value="9">Setembro</option>

            <option value="10">Outubro</option>

            <option value="11">Novembro</option>

            <option value="12">Dezembro</option>
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

            <h3 className="text-5xl font-bold mt-2">{contatoInicial}</h3>
          </div>

          {/* AGENDADOS */}

          <div className="w-[70%] bg-cyan-500/20 border border-cyan-400 py-8 text-center mb-2">
            <p className="text-gray-300 text-sm">Agendados</p>

            <h3 className="text-4xl font-bold mt-2">{agendados}</h3>

            <p className="text-pink-400 mt-3 font-semibold">{pctAgendados}%</p>
          </div>

          {/* AULA */}

          <div className="w-[50%] bg-cyan-500/10 border border-cyan-400 py-8 text-center mb-2">
            <p className="text-gray-300 text-sm">Aula Experimental</p>

            <h3 className="text-3xl font-bold mt-2">{aulaExperimental}</h3>

            <p className="text-pink-400 mt-3 font-semibold">{pctAula}%</p>
          </div>

          {/* FECHADOS */}

          <div className="w-[30%] bg-cyan-500/5 border border-cyan-400 rounded-b-full py-8 text-center">
            <p className="text-gray-300 text-sm">Fechados</p>

            <h3 className="text-2xl font-bold mt-2">{fechados}</h3>

            <p className="text-pink-400 mt-3 font-semibold">{pctFechados}%</p>
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
