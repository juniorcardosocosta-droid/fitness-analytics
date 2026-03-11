"use client"

import { useRouter } from "next/navigation"

export default function Home() {

const router = useRouter()

return (

<div className="min-h-screen bg-[#050b18] text-white">

{/* NAVBAR */}

<nav className="flex justify-between items-center px-10 py-6 border-b border-gray-800">

<h1 className="text-xl font-bold">
Gym Analytics
</h1>

<div className="flex gap-8 text-gray-300">

<a href="#sobre" className="hover:text-white">Sobre</a>

<a href="#funcionalidades" className="hover:text-white">Funcionalidades</a>

<a href="#cursos" className="hover:text-white">Cursos</a>

<button
onClick={()=>router.push("/login")}
className="bg-cyan-500 px-5 py-2 rounded-lg"
>
Entrar
</button>

</div>

</nav>


{/* HERO */}

<section className="text-center py-32 px-6">

<h1 className="text-6xl font-bold mb-6">
Inteligência financeira para academias
</h1>

<p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
Transforme dados da sua academia em decisões estratégicas com dashboards,
relatórios financeiros e insights inteligentes.
</p>

<button
onClick={()=>router.push("/login")}
className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg font-semibold"
>
Entrar na Plataforma
</button>

</section>


{/* SOBRE */}

<section id="sobre" className="max-w-6xl mx-auto py-24 text-center">

<h2 className="text-4xl font-bold mb-6">
Sobre Nós
</h2>

<p className="text-gray-400 max-w-3xl mx-auto text-lg">

Criamos o Gym Analytics para ajudar gestores e consultores
de academias a tomarem decisões baseadas em dados.

Nossa plataforma transforma indicadores financeiros e operacionais
em insights estratégicos para melhorar os resultados do negócio.

</p>

</section>


{/* FUNCIONALIDADES */}

<section id="funcionalidades" className="max-w-6xl mx-auto py-24">

<h2 className="text-4xl font-bold text-center mb-16">
Funcionalidades
</h2>

<div className="grid md:grid-cols-3 gap-8">

<div className="bg-[#0f1c33] p-8 rounded-xl">
<h3 className="text-xl font-bold mb-3">
Dashboard Estratégico
</h3>
<p className="text-gray-400">
Acompanhe indicadores da academia em tempo real.
</p>
</div>

<div className="bg-[#0f1c33] p-8 rounded-xl">
<h3 className="text-xl font-bold mb-3">
Relatórios Financeiros
</h3>
<p className="text-gray-400">
DRE completa com análise automática de resultados.
</p>
</div>

<div className="bg-[#0f1c33] p-8 rounded-xl">
<h3 className="text-xl font-bold mb-3">
Gestão Multi-Unidades
</h3>
<p className="text-gray-400">
Compare academias e unidades em um único painel.
</p>
</div>

</div>

</section>


{/* CURSOS */}

<section id="cursos" className="max-w-6xl mx-auto py-24 text-center">

<h2 className="text-4xl font-bold mb-12">
Cursos
</h2>

<p className="text-gray-400 max-w-3xl mx-auto">

Oferecemos conteúdos e treinamentos para gestores e consultores
que desejam dominar a gestão financeira de academias.

</p>

</section>

</div>

)

}