import LogoutButton from "@/components/logout-button";
import NewRecipeForm from "@/components/new-recipe-form";
import { requireUser } from "@/lib/auth";

type NewRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewRecipePage({ params }: NewRecipePageProps) {
  const { id } = await params;
  const user = await requireUser();

  return (
    <main>
      <header className="mx-auto mt-8 flex w-full max-w-2xl items-center justify-between px-4">
        <h1 className="text-2xl font-bold">Create Recipe</h1>
        <LogoutButton />
      </header>
      <NewRecipeForm userId={user.id} sectionId={id} />
    </main>
  );
}
