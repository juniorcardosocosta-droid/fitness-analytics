"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../lib/supabaseClient"

export default function Clientes() {

  const [clientes, setClientes] = useState<any[]>([])
  const [nome, setNome] = useState("")
  const [responsavel, setResponsavel] = useState("")
  const [telefone, setTelefone] = useState("")

  useEffect(() => {
    carregarClientes()
  }, [])

  async function carregarClientes() {

    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("created_at", { ascending: false })

    setClientes(data || [])

  }

  async function salvarCliente() {

    if (!nome) {
      alert("Informe o nome do cliente")
      return
    }

    const { error } = await supabase
      .from("clientes")
      .insert([
        {
          nome,
          responsavel,
          telefone
        }
      ])

    if (error) {
      alert("Erro ao salvar cliente")
      return
    }

    setNome("")
    setResponsavel("")
    setTelefone("")

    carregarClientes()

  }

  return (

    <div>

      <h1 className="text-3xl font-bold mb-8">
        Clientes
      </h1>

      <div className="bg-[#0f1c33] p-6 rounded-xl mb-10 max-w-xl">

        <input
          placeholder="Nome do cliente"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={nome}
          onChange={(e)=>setNome(e.target.value)}
        />

        <input
          placeholder="Responsável"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={responsavel}
          onChange={(e)=>setResponsavel(e.target.value)}
        />

        <input
          placeholder="Telefone"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={telefone}
          onChange={(e)=>setTelefone(e.target.value)}
        />

        <button
          onClick={salvarCliente}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg"
        >
          Cadastrar Cliente
        </button>

      </div>


      <div className="bg-[#0f1c33] p-6 rounded-xl">

        <h2 className="text-xl mb-6">
          Clientes cadastrados
        </h2>

        <table className="w-full">

          <thead className="text-gray-400">

            <tr>
              <th className="text-left">Nome</th>
              <th className="text-left">Responsável</th>
              <th className="text-left">Telefone</th>
            </tr>

          </thead>

          <tbody>

            {clientes.map((cliente)=>(
              <tr key={cliente.id} className="border-t border-white/5">

                <td className="py-3">{cliente.nome}</td>
                <td>{cliente.responsavel}</td>
                <td>{cliente.telefone}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}