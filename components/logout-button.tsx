"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button onClick={onLogout} className="rounded border border-gray-300 px-3 py-2 text-sm">
      Logout
    </button>
  );
}
