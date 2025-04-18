// components/RegisterForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const payload = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(payload.error ?? "An unexpected error occurred");
      return;
    }

    // If needsConfirmation, go to the verify‑email page
    if (payload.needsConfirmation) {
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } else if (payload.redirect) {
      router.push(payload.redirect);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 text-red-300 rounded">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm text-[#b3b3b3] mb-1">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#262626] border border-[#373737] rounded text-white"
          placeholder="Your name (optional)"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-[#b3b3b3] mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#262626] border border-[#373737] rounded text-white"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-[#b3b3b3] mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#262626] border border-[#373737] rounded text-white"
          placeholder="••••••••"
          required
        />
        <p className="text-xs text-[#666] mt-1">
          Must be at least 6 characters
        </p>
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm text-[#b3b3b3] mb-1"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2 bg-[#262626] border border-[#373737] rounded text-white"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 rounded-lg text-black font-semibold transition ${
          loading
            ? "bg-[#facc15]/70 cursor-not-allowed"
            : "bg-[#facc15] hover:bg-[#fde047]"
        }`}
      >
        {loading ? "Processing…" : "Create Account"}
      </button>
    </form>
  );
}
