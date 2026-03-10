"use client"

import { useState } from "react"

export default function Relatorios() {

const [academia,setAcademia] = useState("Todas")
const [unidade,setUnidade] = useState("Todas")
const [mes,setMes] = useState("Março")
const [ano,setAno] = useState("2025")

// DADOS EXEMPLO (depois virão do Supabase/API)

const receitaBruta = 130000
const deducoes = 10000
const receitaLiquida = receitaBruta - deducoes

const custos = 40000
const lucroBruto = receitaLiquida - custos

const despesasInfra = 15000
const despesasAdmin = 12000
const despesasPessoal = 18000
const terceiros = 5000

const despesasOperacionais =
despesasInfra + despesasAdmin + despesasPessoal + terceiros

const ebitda = lucroBruto - despesasOperacionais

const impostos = 8000
const resultadoOperacional = ebitda - impostos

const despesasFinanceiras = 2000
const despesasNaoOperacionais = 0

const lucroLiquido =
resultadoOperacional - despesasFinanceiras - despesasNaoOperacionais

const percentual = (valor:number) =>
((valor / receitaLiquida) * 100).toFixed(1)

return (

<div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

<h1 className="text-4xl font-bold mb-8">
Relatórios Financeiros
</h1>

{/* FILTROS */}

<div className="flex flex-wrap gap-4 mb-10">

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

{/* RESUMO EXECUTIVO */}

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

{/* DRE */}

<div className="bg-[#0f1c33] rounded-xl p-8 mb-12">

<h2 className="text-2xl font-semibold mb-6">
DRE - Demonstrativo de Resultado
</h2>

<table className="w-full text-sm">

<thead className="text-gray-400 border-b border-gray-700">
<tr>
<th className="text-left py-2">Conta</th>
<th className="text-right">Valor</th>
<th className="text-right">%</th>
</tr>
</thead>

<tbody className="space-y-2">

<tr>
<td className="py-2">Receita Bruta</td>
<td className="text-right">R$ {receitaBruta.toLocaleString()}</td>
<td className="text-right">100%</td>
</tr>

<tr>
<td>(-) Deduções</td>
<td className="text-right">R$ {deducoes.toLocaleString()}</td>
<td className="text-right">-</td>
</tr>

<tr className="text-green-400 font-semibold">
<td>Receita Líquida</td>
<td className="text-right">R$ {receitaLiquida.toLocaleString()}</td>
<td className="text-right">100%</td>
</tr>

<tr>
<td>(-) Custos Variáveis</td>
<td className="text-right">R$ {custos.toLocaleString()}</td>
<td className="text-right">{percentual(custos)}%</td>
</tr>

<tr className="text-green-400 font-semibold">
<td>Lucro Bruto</td>
<td className="text-right">R$ {lucroBruto.toLocaleString()}</td>
<td className="text-right">{percentual(lucroBruto)}%</td>
</tr>

<tr>
<td>Infraestrutura</td>
<td className="text-right">R$ {despesasInfra.toLocaleString()}</td>
<td className="text-right">{percentual(despesasInfra)}%</td>
</tr>

<tr>
<td>Administrativas</td>
<td className="text-right">R$ {despesasAdmin.toLocaleString()}</td>
<td className="text-right">{percentual(despesasAdmin)}%</td>
</tr>

<tr>
<td>Pessoal</td>
<td className="text-right">R$ {despesasPessoal.toLocaleString()}</td>
<td className="text-right">{percentual(despesasPessoal)}%</td>
</tr>

<tr>
<td>Serviços de Terceiros</td>
<td className="text-right">R$ {terceiros.toLocaleString()}</td>
<td className="text-right">{percentual(terceiros)}%</td>
</tr>

<tr className="text-purple-400 font-semibold">
<td>EBITDA</td>
<td className="text-right">R$ {ebitda.toLocaleString()}</td>
<td className="text-right">{percentual(ebitda)}%</td>
</tr>

<tr>
<td>Impostos</td>
<td className="text-right">R$ {impostos.toLocaleString()}</td>
<td className="text-right">{percentual(impostos)}%</td>
</tr>

<tr>
<td>Despesas Financeiras</td>
<td className="text-right">R$ {despesasFinanceiras.toLocaleString()}</td>
<td className="text-right">{percentual(despesasFinanceiras)}%</td>
</tr>

<tr className="text-cyan-400 font-semibold text-lg">
<td>Lucro Líquido</td>
<td className="text-right">R$ {lucroLiquido.toLocaleString()}</td>
<td className="text-right">{percentual(lucroLiquido)}%</td>
</tr>

</tbody>

</table>

</div>

{/* BOTÃO PDF */}

<button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">
Exportar Relatório PDF
</button>

</div>

)

}