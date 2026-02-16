import LogoutButton from "@/components/logout-button";
import SectionsClient from "@/components/sections-client";
import { requireUser } from "@/lib/auth";

export default async function BookPage() {
  const user = await requireUser();

  return (
    <main>
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 pt-8">
        <h1 className="text-2xl font-bold">My Recipe Book</h1>
        <LogoutButton />
      </header>
      <SectionsClient userId={user.id} />
    </main>
  );
}
