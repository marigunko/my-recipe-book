import { notFound } from "next/navigation";

import LogoutButton from "@/components/logout-button";
import RecipesClient from "@/components/recipes-client";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabaseServer";

type SectionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SectionPage({ params }: SectionPageProps) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: section, error } = await supabase
    .from("sections")
    .select("id,title")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !section) {
    notFound();
  }

  return (
    <main>
      <header className="mx-auto mt-8 flex w-full max-w-2xl items-center justify-between px-4">
        <h1 className="text-2xl font-bold">{section.title}</h1>
        <LogoutButton />
      </header>
      <RecipesClient userId={user.id} sectionId={section.id} />
    </main>
  );
}
