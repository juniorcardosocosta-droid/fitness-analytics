"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Relatorios() {
  const [academias, setAcademias] = useState<any[]>([]);
  const [academiaId, setAcademiaId] = useState<string>("todas");

  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  const [receitaBruta, setReceitaBruta] = useState(0);
  const [despesas, setDespesas] = useState(0);

  // CARREGAR ACADEMIAS
  useEffect(() => {
    carregarAcademias();
  }, []);

  async function carregarAcademias() {
    const { data } = await supabase.from("academias").select("*");

    if (data) {
      setAcademias(data);
    }
  }

  // BUSCAR DADOS
  useEffect(() => {
    buscarDados();
  }, [academiaId, mes, ano]);

  async function buscarDados() {
    let query = supabase.from("lancamentos").select("*");

    // FILTRO ACADEMIA
    if (academiaId !== "todas") {
      query = query.eq("academia_id", academiaId);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      return;
    }

    let receita = 0;
    let despesa = 0;

    data.forEach((item: any) => {
      const dataLancamento = new Date(item.data);

      const mesLanc = dataLancamento.getMonth() + 1;
      const anoLanc = dataLancamento.getFullYear();

      // FILTRO MÊS/ANO
      if (mesLanc !== mes || anoLanc !== ano) return;

      const valor = Number(item.valor);

      if (item.tipo === "receita") {
        receita += valor;
      }

      if (item.tipo === "despesa") {
        despesa += valor;
      }
    });

    setReceitaBruta(receita);
    setDespesas(despesa);
  }

  // CALCULOS DRE
  const deducoes = 0;

  const receitaLiquida = receitaBruta - deducoes;

  const custos = despesas;

  const lucroBruto = receitaLiquida - custos;

  const ebitda = lucroBruto;

  const impostos = 0;

  const despesasFinanceiras = 0;

  const lucroLiquido = ebitda - impostos - despesasFinanceiras;

  const margemEbitda =
    receitaLiquida > 0 ? ((ebitda / receitaLiquida) * 100).toFixed(1) : 0;

  const margemLiquida =
    receitaLiquida > 0 ? ((lucroLiquido / receitaLiquida) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">
      <h1 className="text-4xl font-bold mb-8">Relatórios Financeiros</h1>

      {/* FILTROS */}
      <div className="flex gap-4 mb-10 flex-wrap">
        <select
          value={academiaId}
          onChange={(e) => setAcademiaId(e.target.value)}
          className="bg-[#0f1c33] px-4 py-2 rounded-lg"
        >
          <option value="todas">Todas as academias</option>

          {academias.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>

        <select
          value={mes}
          onChange={(e) => setMes(Number(e.target.value))}
          className="bg-[#0f1c33] px-4 py-2 rounded-lg"
        >
          {[
            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro",
          ].map((nomeMes, index) => (
            <option key={index + 1} value={index + 1}>
              {nomeMes}
            </option>
          ))}
        </select>

        <select
          value={ano}
          onChange={(e) => setAno(Number(e.target.value))}
          className="bg-[#0f1c33] px-4 py-2 rounded-lg"
        >
          {[2024, 2025, 2026].map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card
          title="Receita Líquida"
          value={receitaLiquida}
          color="text-green-400"
        />

        <Card title="Custos" value={custos} color="text-yellow-400" />

        <Card title="EBITDA" value={ebitda} color="text-purple-400" />

        <Card
          title="Lucro Líquido"
          value={lucroLiquido}
          color="text-cyan-400"
        />
      </div>

      {/* DRE */}
      <div className="bg-[#0f1c33] rounded-xl p-8 mb-10">
        <h2 className="text-2xl font-semibold mb-6">
          DRE - Demonstrativo de Resultado
        </h2>

        <div className="space-y-3 text-gray-300">
          <p>Receita Bruta: R$ {receitaBruta.toLocaleString("pt-BR")}</p>

          <p>Deduções: R$ {deducoes.toLocaleString("pt-BR")}</p>

          <p className="text-green-400">
            Receita Líquida: R$ {receitaLiquida.toLocaleString("pt-BR")}
          </p>

          <p>Custos: R$ {custos.toLocaleString("pt-BR")}</p>

          <p className="text-green-400">
            Lucro Bruto: R$ {lucroBruto.toLocaleString("pt-BR")}
          </p>

          <p className="text-purple-400">
            EBITDA: R$ {ebitda.toLocaleString("pt-BR")}
          </p>

          <p>Impostos: R$ {impostos.toLocaleString("pt-BR")}</p>

          <p>
            Despesas Financeiras: R${" "}
            {despesasFinanceiras.toLocaleString("pt-BR")}
          </p>

          <p className="text-cyan-400 text-xl font-bold">
            Lucro Líquido: R$ {lucroLiquido.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="bg-[#0f1c33] rounded-xl p-8">
        <h2 className="text-2xl font-semibold mb-6">Insights Inteligentes</h2>

        <div className="bg-[#162544] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>

            <h3 className="text-xl font-semibold">Operação Financeira</h3>
          </div>

          <p className="text-gray-300 leading-7 mb-6">
            {lucroLiquido > 0
              ? "Sua operação fechou o período com resultado positivo e margem saudável."
              : "Sua operação fechou o período com prejuízo e precisa de atenção nos custos operacionais."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0f1c33] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Margem EBITDA</p>

              <p className="text-2xl font-bold text-green-400">
                {margemEbitda}%
              </p>
            </div>

            <div className="bg-[#0f1c33] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Margem Líquida</p>

              <p className="text-2xl font-bold text-cyan-400">
                {margemLiquida}%
              </p>
            </div>

            <div className="bg-[#0f1c33] rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Resultado</p>

              <p
                className={`text-2xl font-bold ${
                  lucroLiquido > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                R$ {lucroLiquido.toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-green-400">✓</span>

              <p>
                Receita líquida de R$ {receitaLiquida.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-cyan-400">✓</span>

              <p>
                Custos operacionais totalizaram R${" "}
                {custos.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex items-center gap-3 text-gray-300">
              <span className="text-yellow-400">⚠</span>

              <p>
                {Number(margemLiquida) > 15
                  ? "Margem operacional considerada saudável."
                  : "Margem operacional abaixo do ideal."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }: any) {
  return (
    <div className="bg-[#0f1c33] p-6 rounded-xl">
      <p className="text-gray-400 text-sm mb-2">{title}</p>

      <h2 className={`text-3xl font-bold ${color}`}>
        R$ {Number(value).toLocaleString("pt-BR")}
      </h2>
    </div>
  );
}
