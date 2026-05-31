"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function Academias() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [academias, setAcademias] = useState<any[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
    carregarAcademias();
  }, []);

  async function carregarClientes() {
    const { data } = await supabase.from("clientes").select("*");

    setClientes(data || []);
  }

  async function carregarAcademias() {
    const { data } = await supabase
      .from("academias")
      .select(
        `
        *,
        clientes(nome)
      `,
      )
      .order("created_at", { ascending: false });

    setAcademias(data || []);
  }

  async function salvarAcademia() {
    if (!nome || !clienteId) {
      alert("Preencha os campos obrigatórios");
      return;
    }

    if (editId) {
      await supabase
        .from("academias")
        .update({
          cliente_id: clienteId,
          nome,
          endereco,
          bairro,
          cidade,
          estado,
          responsavel,
          telefone,
        })
        .eq("id", editId);

      setEditId(null);
    } else {
      await supabase.from("academias").insert([
        {
          cliente_id: clienteId,
          nome,
          endereco,
          bairro,
          cidade,
          estado,
          responsavel,
          telefone,
        },
      ]);
    }

    limparFormulario();
    carregarAcademias();
  }

  function limparFormulario() {
    setNome("");
    setEndereco("");
    setBairro("");
    setCidade("");
    setEstado("");
    setResponsavel("");
    setTelefone("");
  }

  function editarAcademia(a: any) {
    setEditId(a.id);
    setClienteId(a.cliente_id);
    setNome(a.nome);
    setEndereco(a.endereco);
    setBairro(a.bairro);
    setCidade(a.cidade);
    setEstado(a.estado);
    setResponsavel(a.responsavel);
    setTelefone(a.telefone);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Academias</h1>

      {/* FORMULÁRIO */}

      <div className="bg-[#0f1c33] p-6 rounded-xl mb-10 max-w-xl">
        <select
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        >
          <option value="">Selecionar cliente</option>

          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </option>
          ))}
        </select>

        <input
          placeholder="Nome da academia"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Endereço"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />

        <input
          placeholder="Bairro"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
        />

        <input
          placeholder="Cidade"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
        />

        <input
          placeholder="Estado"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        />

        <input
          placeholder="Responsável"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        />

        <input
          placeholder="Telefone"
          className="w-full p-3 mb-4 bg-[#0a162b] rounded-lg"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <button
          onClick={salvarAcademia}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg"
        >
          {editId ? "Atualizar Academia" : "Cadastrar Academia"}
        </button>
      </div>

      {/* LISTA */}

      <div className="bg-[#0f1c33] p-6 rounded-xl">
        <h2 className="text-xl mb-6">Academias cadastradas</h2>

        <table className="w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left">Academia</th>
              <th className="text-left">Cliente</th>
              <th className="text-left">Cidade</th>
              <th className="text-left">Bairro</th>
              <th className="text-left">Responsável</th>
              <th className="text-left">Telefone</th>
              <th className="text-left">Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {academias.map((a) => (
              <tr key={a.id} className="border-t border-white/5">
                <td className="py-3">{a.nome}</td>
                <td>{a.clientes?.nome}</td>
                <td>{a.cidade}</td>
                <td>{a.bairro}</td>
                <td>{a.responsavel}</td>
                <td>{a.telefone}</td>

                <td className="space-x-3">
                  <button
                    onClick={() => editarAcademia(a)}
                    className="text-cyan-400"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
