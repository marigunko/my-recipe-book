"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabaseClient";
import { recipeSchema, type RecipeValues } from "@/lib/validations";

type NewRecipeFormProps = {
  userId: string;
  sectionId: string;
};

export default function NewRecipeForm({ userId, sectionId }: NewRecipeFormProps) {
  const router = useRouter();
  const form = useForm<RecipeValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      ingredients: "",
      instructions: "",
    },
  });

  const createRecipe = useMutation({
    mutationFn: async (values: RecipeValues) => {
      const supabase = createClient();
      const { error } = await supabase.from("recipes").insert({
        user_id: userId,
        section_id: sectionId,
        title: values.title,
        ingredients: values.ingredients,
        instructions: values.instructions,
      });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      router.push(`/section/${sectionId}`);
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => createRecipe.mutate(values))}
      className="mx-auto mt-10 w-full max-w-2xl space-y-4 rounded border border-gray-200 p-6"
    >
      <h1 className="text-2xl font-semibold">New Recipe</h1>

      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          {...form.register("title")}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.title ? (
          <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="ingredients" className="block text-sm font-medium">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          rows={6}
          {...form.register("ingredients")}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.ingredients ? (
          <p className="text-sm text-red-600">{form.formState.errors.ingredients.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="instructions" className="block text-sm font-medium">
          Instructions
        </label>
        <textarea
          id="instructions"
          rows={8}
          {...form.register("instructions")}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.instructions ? (
          <p className="text-sm text-red-600">{form.formState.errors.instructions.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={createRecipe.isPending}
        className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {createRecipe.isPending ? "Creating..." : "Create Recipe"}
      </button>
    </form>
  );
}
