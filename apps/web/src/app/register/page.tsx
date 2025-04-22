// app/register/page.tsx
import ClientRegister from "@/components/ClientRegister";

export const metadata = {
  title: "Create an Account – T2A",
  description: "Sign up for Thoughts2Action and never lose an idea again.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#010101] p-4">
      <div className="bg-[#1a1a1a] w-full max-w-md p-8 rounded-xl shadow-xl">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Create an Account
        </h1>
        <ClientRegister />
      </div>
    </div>
  );
}
