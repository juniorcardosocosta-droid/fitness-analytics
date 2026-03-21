"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"

export default function Integracoes() {

  const [academias,setAcademias] = useState<any[]>([])
  const [integracoes,setIntegracoes] = useState<any[]>([])

  const [academiaId,setAcademiaId] = useState("")
  const [sistema,setSistema] = useState("")
  const [apiKey,setApiKey] = useState("")
  const [apiSecret,setApiSecret] = useState("")

  useEffect(()=>{
    carregarAcademias()
    carregarIntegracoes()
  },[])

  async function carregarAcademias(){

    const {data} = await supabase
      .from("academias")
      .select("*")

    setAcademias(data || [])

  }

  async function carregarIntegracoes(){

    const {data} = await supabase
      .from("integracoes")
      .select(`
        *,
        academias(nome)
      `)

    setIntegracoes(data || [])

  }

  async function salvarIntegracao(){

    if(!academiaId || !sistema || !apiKey){
      alert("Preencha todos os campos")
      return
    }

    await supabase
      .from("integracoes")
      .insert([
        {
          academia_id: academiaId,
          sistema,
          api_key: apiKey,
          api_secret: apiSecret
        }
      ])

    setAcademiaId("")
    setSistema("")
    setApiKey("")

    carregarIntegracoes()

  }

  return(

    <div>

      <h1 className="text-3xl font-bold mb-8">
        Integrações
      </h1>


      {/* FORMULÁRIO */}

      <div className="bg-[#0f1c33] p-6 rounded-xl mb-10 max-w-xl">

        <select
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={academiaId}
          onChange={(e)=>setAcademiaId(e.target.value)}
        >

          <option value="">Selecionar Academia</option>

          {academias.map((a)=>(
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}

        </select>


        <select
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={sistema}
          onChange={(e)=>setSistema(e.target.value)}
        >

          <option value="">Sistema</option>
          <option value="Tecnofit">Tecnofit</option>
          <option value="Pacto">Pacto</option>
          <option value="EVO">EVO</option>
          <option value="Nextfit">Nextfit</option>

        </select>


        <input
          type="text"
          placeholder="API Key"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={apiKey}
          onChange={(e)=>setApiKey(e.target.value)}
        />

        <input
          type="text"
          placeholder="API Secret"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={apiSecret}
          onChange={(e)=>setApiSecret(e.target.value)}
        />


        <button
          onClick={salvarIntegracao}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg"
        >
          Salvar Integração
        </button>

      </div>


      {/* LISTA */}

      <div className="bg-[#0f1c33] p-6 rounded-xl">

        <h2 className="text-xl mb-6">
          Integrações cadastradas
        </h2>

        <table className="w-full">

          <thead className="text-gray-400">

            <tr>
              <th className="text-left">Academia</th>
              <th className="text-left">Sistema</th>
            </tr>

          </thead>

          <tbody>

            {integracoes.map((i)=>(
              <tr key={i.id} className="border-t border-white/5">

                <td className="py-3">
                  {i.academias?.nome}
                </td>

                <td>
                  {i.sistema}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}