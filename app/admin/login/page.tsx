"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Invalid login details");
      }

      router.push("/admin/dashboard");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#060606] px-4 py-10 text-white">
      <section className="mx-auto flex min-h-[85vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[32px] border border-[#2a2419] bg-[#0a0a0a] p-8 shadow-[0_24px_80px_rgba(214,171,95,0.10)]">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">
              Admin Access
            </p>

            <h1 className="font-serif text-4xl text-white">
              SoHo Admin Login
            </h1>

            <p className="mt-3 text-sm leading-7 text-[#cfc7b7]">
              Login to manage bookings and professional joining requests.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#d8d0c1]">
                Email Address
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#d8d0c1]">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="rounded-2xl bg-[#d6ab5f] px-6 py-4 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Login to Dashboard"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputClass =
  "w-full rounded-2xl border border-[#2f291d] bg-[#111111] px-4 py-4 text-sm text-white placeholder:text-[#8f8778] outline-none transition focus:border-[#d6ab5f]";