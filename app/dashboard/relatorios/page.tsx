"use client"

import { useState } from "react"

export default function Relatorios() {

const [academia,setAcademia] = useState("Todas")
const [unidade,setUnidade] = useState("Todas")
const [mes,setMes] = useState("Março")
const [ano,setAno] = useState("2025")

return (

<div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a162b] text-white p-10">

<h1 className="text-4xl font-bold mb-8">
Relatórios Financeiros
</h1>

{/* FILTROS */}

<div className="flex flex-wrap items-center gap-4 mb-10">

<select
value={academia}
onChange={(e)=>setAcademia(e.target.value)}
className="bg-[#0f1c33] border border-gray-700 px-4 py-2 rounded-lg"
>

<option>Todas</option>
<option>Academia Alpha</option>
<option>Academia FitLife</option>

</select>


<select
value={unidade}
onChange={(e)=>setUnidade(e.target.value)}
className="bg-[#0f1c33] border border-gray-700 px-4 py-2 rounded-lg"
>

<option>Todas</option>
<option>Unidade Centro</option>
<option>Unidade Sul</option>

</select>


<select
value={mes}
onChange={(e)=>setMes(e.target.value)}
className="bg-[#0f1c33] border border-gray-700 px-4 py-2 rounded-lg"
>

<option>Janeiro</option>
<option>Fevereiro</option>
<option>Março</option>
<option>Abril</option>
<option>Maio</option>
<option>Junho</option>

</select>


<select
value={ano}
onChange={(e)=>setAno(e.target.value)}
className="bg-[#0f1c33] border border-gray-700 px-4 py-2 rounded-lg"
>

<option>2024</option>
<option>2025</option>
<option>2026</option>

</select>


<button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-2 rounded-lg font-semibold">

Filtrar

</button>

</div>


{/* RESUMO FINANCEIRO */}

<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Receita Líquida</p>
<h2 className="text-3xl font-bold text-green-400">
R$ 120.000
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Custos</p>
<h2 className="text-3xl font-bold text-yellow-400">
R$ 40.000
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Despesas</p>
<h2 className="text-3xl font-bold text-red-400">
R$ 50.000
</h2>
</div>

<div className="bg-[#0f1c33] p-6 rounded-xl">
<p className="text-gray-400 text-sm">Lucro Líquido</p>
<h2 className="text-3xl font-bold text-cyan-400">
R$ 30.000
</h2>
</div>

</div>


{/* DRE */}

<div className="bg-[#0f1c33] p-8 rounded-xl">

<h2 className="text-2xl font-semibold mb-6">
DRE - Demonstrativo de Resultado
</h2>

<div className="space-y-3">

<p>Receita Bruta ..................................... R$ 130.000</p>

<p>(-) Deduções ....................................... R$ 10.000</p>

<p className="font-semibold text-green-400">
Receita Líquida .................................... R$ 120.000
</p>

<p>(-) Custos Variáveis .............................. R$ 40.000</p>

<p className="font-semibold text-green-400">
Lucro Bruto ........................................ R$ 80.000
</p>

<p>(-) Despesas Operacionais ..................... R$ 50.000</p>

<p className="font-semibold text-cyan-400 text-lg">
Lucro Líquido ..................................... R$ 30.000
</p>

</div>

</div>


{/* BOTÃO PDF */}

<div className="mt-10">

<button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold">

Exportar Relatório PDF

</button>

</div>

</div>

)

}