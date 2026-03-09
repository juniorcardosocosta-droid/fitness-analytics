"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Erro no login")
    } else {
      alert("Login realizado!")
    }

  }

  return (

    <div className="flex min-h-screen">

      {/* LADO ESQUERDO */}

      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white flex-col justify-center items-center p-16">

        <h1 className="text-5xl font-bold mb-6">
          Fitness Intelligence
        </h1>

        <p className="text-lg text-center max-w-md opacity-90">
          Plataforma de inteligência financeira para academias.
          Analise desempenho, automatize relatórios e escale sua consultoria.
        </p>

      </div>


      {/* LADO DIREITO */}

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-100 relative">

        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md border border-gray-200">

          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
            Acessar Plataforma
          </h2>


          {/* EMAIL */}

          <div className="relative mb-4">

            <span className="absolute left-3 top-3 text-gray-400">

              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v.217L8 8.417.01 4.217V4z"/>
                <path d="M0 4.697v7.104l5.803-3.553L0 4.697zM6.761 8.83l-6.761 4.13A2 2 0 0 0 2 14h12a2 2 0 0 0 2-1.04l-6.761-4.13L8 9.583l-1.239-.753zM16 4.697l-5.803 3.551L16 11.801V4.697z"/>
              </svg>

            </span>

            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-3 pl-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>


          {/* SENHA */}

          <div className="relative mb-6">

            <span className="absolute left-3 top-3 text-gray-400">

              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a3 3 0 0 0-3 3v2H3a2 2 0 0 0-2 2v5a2 
                2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 
                0-2-2h-2V4a3 3 0 0 0-3-3zM6 
                4a2 2 0 1 1 4 0v2H6V4z"/>
              </svg>

            </span>

            <input
              type={showPassword ? "text" : "password"}
              className="w-full border border-gray-300 rounded-lg p-3 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Senha"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁"}
            </button>

          </div>


          {/* BOTÃO */}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
          >
            Entrar
          </button>


          <p className="text-center text-sm text-gray-500 mt-6">
            Plataforma exclusiva para consultores fitness
          </p>

        </div>

      </div>

    </div>

  )

}