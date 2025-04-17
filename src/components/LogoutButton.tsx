"use client";

import { signout } from "@/actions/login/actions";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signout()}
      className="text-sm text-[#b3b3b3] hover:text-white transition-colors px-4 py-2 rounded-md border border-[#373737] hover:border-[#facc15]"
    >
      Logout
    </button>
  );
}
