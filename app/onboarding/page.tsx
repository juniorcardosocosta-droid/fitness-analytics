"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Academia = {
  id: string;
  nome: string;
  onboarding_status: string;
};

const statusOptions = [
  "nao_iniciado",
  "configurando",
  "importando",
  "validando",
  "ativo",
  "erro",
];

export default function OnboardingPage() {
  const [academias, setAcademias] = useState<Academia[]>([]);

  useEffect(() => {
    fetchAcademias();
  }, []);

  async function fetchAcademias() {
  const { data, error } = await supabase
    .from("academias")
    .select("id, nome, onboarding_status");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (!error && data) {
    setAcademias(data);
  }
}

  async function updateStatus(id: string, status: string) {
    await supabase
      .from("academias")
      .update({ onboarding_status: status })
      .eq("id", id);

    fetchAcademias();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Onboarding de Academias
      </h1>

      <div className="space-y-3">
        {academias.map((acad) => (
          <div
            key={acad.id}
            className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg"
          >
            <div>
              <p className="font-medium">{acad.nome}</p>
              <p className="text-sm text-gray-400">
                Status: {acad.onboarding_status}
              </p>
            </div>

            <select
              value={acad.onboarding_status}
              onChange={(e) =>
                updateStatus(acad.id, e.target.value)
              }
              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}