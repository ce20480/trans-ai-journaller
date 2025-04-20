import Link from "next/link";
import CreateNoteForm from "@/components/CreateNoteForm";

export const metadata = {
  title: "Create New Note – T2A",
  description: "Create a new note in your T2A account",
};

export default function CreateNotePage() {
  return (
    <main className="min-h-screen bg-[#010101]">
      <header className="bg-[#1a1a1a] shadow-md sticky top-0 z-40 border-b border-[#262626]">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Create New Note</h1>
          <div className="flex space-x-4">
            <Link
              href="/dashboard/notes"
              className="text-sm bg-[#262626] text-white hover:text-[#facc15] px-4 py-1.5 rounded-full"
            >
              Back to Notes
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-lg border border-[#262626]">
            <CreateNoteForm />
          </div>
        </div>
      </section>
    </main>
  );
}
