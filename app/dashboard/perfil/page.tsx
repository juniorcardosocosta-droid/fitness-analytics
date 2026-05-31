"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function PerfilPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarUsuario();
  }, []);

  async function carregarUsuario() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setEmail(user.email || "");
    }
  }

  async function alterarSenha() {
    if (!senha) {
      alert("Digite uma senha.");
      return;
    }

    if (senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Senha alterada com sucesso!");

    setSenha("");
    setConfirmarSenha("");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">
        Meu Perfil
      </h1>

      <div className="bg-[#0f1c33] p-6 rounded-xl">
        <div className="mb-6">
          <label className="block mb-2 text-gray-400">
            E-mail
          </label>

          <input
            value={email}
            disabled
            className="w-full bg-[#091221] border border-white/10 rounded-lg px-4 py-3"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-gray-400">
            Nova Senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-[#091221] border border-white/10 rounded-lg px-4 py-3"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-gray-400">
            Confirmar Senha
          </label>

          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="w-full bg-[#091221] border border-white/10 rounded-lg px-4 py-3"
          />
        </div>

        <button
          onClick={alterarSenha}
          disabled={loading}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg font-semibold"
        >
          {loading ? "Salvando..." : "Alterar Senha"}
        </button>
      </div>
    </div>
  );
}