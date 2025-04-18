// app/register/page.tsx
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";

export const metadata = {
  title: "Create an Account – T2A",
  description: "Sign up for Thoughts2Action and never lose an idea again.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] w-full max-w-md p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create an Account
        </h1>
        <RegisterForm />
        <p className="mt-6 text-center text-[#b3b3b3] text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#facc15] hover:underline transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
