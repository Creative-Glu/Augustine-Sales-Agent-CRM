"use client";

import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return alert(error.message);
    // redirect
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-amber-800 flex items-center justify-center bg-gradient-to-b from-purplecrm-50 to-white">
      <div className="bg-purplecrm-600 text-white p-6 rounded-xl2 shadow-card">
        <h2 className="text-lg font-semibold">Total Leads</h2>
        <p className="text-3xl font-bold mt-2">1,250</p>
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-card"
      >
        <h2 className="text-2xl font-semibold mb-4 text-purplecrm-700">
          Sign in to Augustine
        </h2>

        <label className="block mb-2 text-sm">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
          type="email"
          required
        />

        <label className="block mb-2 text-sm">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-md mb-4"
          type="password"
          required
        />

        <button
          className="w-full py-3 rounded-xl btn-gradient text-white font-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

// do not wrap with layout for auth pages
(LoginPage as any).noLayout = true;
export default LoginPage;
