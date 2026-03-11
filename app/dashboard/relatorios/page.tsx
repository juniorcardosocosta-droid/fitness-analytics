"use client"

import { useState } from "react"

export default function Relatorios() {

const [academia,setAcademia] = useState("Todas")
const [unidade,setUnidade] = useState("Todas")
const [mes,setMes] = useState("Março")
const [ano,setAno] = useState("2025")

// DADOS EXEMPLO

const receitaBruta = 130000
const deducoes = 10000
const receitaLiquida = receitaBruta - deducoes

const custos = 40000
const lucroBruto = receitaLiquida - custos

const infra = 15000
const admin = 12000
const pessoal = 18000
const terceiros = 5000

const despesas = infra + admin + pessoal + terceiros

const ebitda = lucroBruto - despesas

const impostos = 8000
const resultadoOperacional = ebitda - impostos

const despesasFinanceiras = 2000

const lucroLiquido = resultadoOperacional - despesasFinanceiras

const margemEbitda = ((ebitda / receitaLiquida) * 100).toFixed(1)
const margemLiquida = ((lucroLiquido / receitaLiquida) * 100).toFixed(1)

return (

<div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

<h1 className="text-4xl font-bold mb-8">
Relatórios Financeiros
</h1>

{/* FILTROS */}

<div className="flex gap-4 mb-10 flex-wrap">

<select
value={academia}
onChange={(e)=>setAcademia(e.target.value)}
className="bg-[#0f1c33] px-4 py-2 rounded-lg"
>
<option>Todas</option>
<option>FitLife</option>
<option>Power Gym</option>
</select>

<select
value={unidade}
onChange={(e)=>setUnidade(e.target.value)}
className="bg-[#0f1c33] px-4 py-2 rounded-lg"
>
<option>Todas</option>
<option>Unidade Centro</option>
<option>Unidade Sul</option>
</select>

<select
value={mes}
onChange={(e)=>setMes(e.target.value)}
className="bg-[#0f1c33] px-4 py-2 rounded-lg"
>
<option>Janeiro</option>
<option>Fevereiro</option>
<option>Março</option>
<option>Abril</option>
<option>Maio</option>
</select>

<select
value={ano}
onChange={(e)=>setAno(e.target.value)}
className="bg-[#0f1c33] px-4 py-2 rounded-lg"
>
<option>2024</option>
<option>2025</option>
<option>2026</option>
</select>

<button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg">
Filtrar
</button>

</div>


{/* RESUMO */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Receita Líquida</p>
<h2 className="text-3xl text-green-400 font-bold">
R$ {receitaLiquida.toLocaleString()}
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Custos</p>
<h2 className="text-3xl text-yellow-400 font-bold">
R$ {custos.toLocaleString()}
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">EBITDA</p>
<h2 className="text-3xl text-purple-400 font-bold">
R$ {ebitda.toLocaleString()}
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Lucro Líquido</p>
<h2 className="text-3xl text-cyan-400 font-bold">
R$ {lucroLiquido.toLocaleString()}
</h2>
</div>

</div>


{/* GRID PRINCIPAL */}

<div className="grid md:grid-cols-3 gap-8 mb-12">

{/* DRE */}

<div className="md:col-span-2 bg-[#0f1c33] rounded-xl p-8">

<h2 className="text-2xl font-semibold mb-6">
DRE - Demonstrativo de Resultado
</h2>

<div className="space-y-3 text-sm">

<p>Receita Operacional Bruta ............. R$ {receitaBruta.toLocaleString()}</p>

<p>(-) Deduções .......................... R$ {deducoes.toLocaleString()}</p>

<p className="text-green-400 font-semibold">
Receita Líquida ......................... R$ {receitaLiquida.toLocaleString()}
</p>

<p>(-) Custos Variáveis ................... R$ {custos.toLocaleString()}</p>

<p className="text-green-400 font-semibold">
Lucro Bruto ............................. R$ {lucroBruto.toLocaleString()}
</p>

<br/>

<p className="text-gray-400">Despesas Operacionais</p>

<p>Infraestrutura ........................ R$ {infra.toLocaleString()}</p>
<p>Administrativas ....................... R$ {admin.toLocaleString()}</p>
<p>Pessoal ............................... R$ {pessoal.toLocaleString()}</p>
<p>Serviços de Terceiros ................. R$ {terceiros.toLocaleString()}</p>

<br/>

<p className="text-purple-400 font-semibold">
EBITDA .................................. R$ {ebitda.toLocaleString()}
</p>

<p>Impostos .............................. R$ {impostos.toLocaleString()}</p>

<p>Despesas Financeiras .................. R$ {despesasFinanceiras.toLocaleString()}</p>

<p className="text-cyan-400 font-bold text-lg">
Lucro Líquido ........................... R$ {lucroLiquido.toLocaleString()}
</p>

</div>

</div>


{/* INSIGHTS */}

<div className="bg-[#0f1c33] rounded-xl p-6">

<h2 className="text-xl font-semibold mb-6">
Insights Financeiros
</h2>

<div className="space-y-4 text-sm">

<div>
<p className="text-gray-400">Margem EBITDA</p>
<p className="text-purple-400 text-xl font-bold">
{margemEbitda}%
</p>
</div>

<div>
<p className="text-gray-400">Margem Líquida</p>
<p className="text-cyan-400 text-xl font-bold">
{margemLiquida}%
</p>
</div>

<div>
<p className="text-gray-400">Peso da Folha</p>
<p className="text-yellow-400 text-lg font-bold">
{((pessoal / receitaLiquida) * 100).toFixed(1)}%
</p>
</div>

<hr className="border-gray-700"/>

<p>📈 Receita está saudável</p>
<p>⚠ Despesas com pessoal elevadas</p>
<p>✅ EBITDA positivo</p>

</div>

</div>

</div>


{/* FLUXO DE CAIXA */}

<div className="bg-[#0f1c33] rounded-xl p-8 mb-10">

<h2 className="text-2xl font-semibold mb-6">
Fluxo de Caixa
</h2>

<div className="space-y-3 text-sm">

<p>Fluxo de Caixa de Investimento ........ R$ 10.000</p>

<p>Fluxo de Caixa de Financiamento ....... R$ 0</p>

<p className="text-green-400 font-semibold">
Geração de Caixa ....................... R$ 19.123
</p>

<p>Dividendos / Aportes .................. R$ 5.000</p>

<p className="text-cyan-400 font-semibold">
Geração de Caixa Final ................. R$ 14.123
</p>

</div>

</div>


{/* PDF */}

<button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">
Exportar Relatório PDF
</button>

</div>

)

}