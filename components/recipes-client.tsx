"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabaseClient";
import { recipeSchema, type RecipeValues } from "@/lib/validations";

type Recipe = {
  id: string;
  title: string;
  ingredients: string;
  instructions: string;
  created_at: string;
};

type RecipesClientProps = {
  userId: string;
  sectionId: string;
};

export default function RecipesClient({ userId, sectionId }: RecipesClientProps) {
  const queryClient = useQueryClient();
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const editForm = useForm<RecipeValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      ingredients: "",
      instructions: "",
    },
  });

  const recipesQuery = useQuery({
    queryKey: ["recipes", sectionId, userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("recipes")
        .select("id,title,ingredients,instructions,created_at")
        .eq("user_id", userId)
        .eq("section_id", sectionId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Recipe[];
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: RecipeValues }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("recipes")
        .update({
          title: values.title,
          ingredients: values.ingredients,
          instructions: values.instructions,
        })
        .eq("id", id)
        .eq("user_id", userId)
        .eq("section_id", sectionId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      setEditingRecipeId(null);
      queryClient.invalidateQueries({ queryKey: ["recipes", sectionId, userId] });
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .eq("section_id", sectionId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes", sectionId, userId] });
    },
  });

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl space-y-4 px-4 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recipes</h2>
        <Link
          href={`/section/${sectionId}/new-recipe`}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white"
        >
          New Recipe
        </Link>
      </div>

      {recipesQuery.isLoading ? <p>Loading...</p> : null}
      {recipesQuery.data && recipesQuery.data.length === 0 ? (
        <p className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
          No recipes yet.
        </p>
      ) : null}

      <ul className="space-y-3">
        {recipesQuery.data?.map((recipe) => (
          <li key={recipe.id} className="space-y-2 rounded border border-gray-200 p-4">
            {editingRecipeId === recipe.id ? (
              <form
                onSubmit={editForm.handleSubmit((values) =>
                  updateRecipe.mutate({ id: recipe.id, values }),
                )}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label htmlFor={`title-${recipe.id}`} className="block text-sm font-medium">
                    Title
                  </label>
                  <input
                    id={`title-${recipe.id}`}
                    {...editForm.register("title")}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                  {editForm.formState.errors.title ? (
                    <p className="text-sm text-red-600">{editForm.formState.errors.title.message}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`ingredients-${recipe.id}`} className="block text-sm font-medium">
                    Ingredients
                  </label>
                  <textarea
                    id={`ingredients-${recipe.id}`}
                    rows={5}
                    {...editForm.register("ingredients")}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                  {editForm.formState.errors.ingredients ? (
                    <p className="text-sm text-red-600">{editForm.formState.errors.ingredients.message}</p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <label htmlFor={`instructions-${recipe.id}`} className="block text-sm font-medium">
                    Instructions
                  </label>
                  <textarea
                    id={`instructions-${recipe.id}`}
                    rows={7}
                    {...editForm.register("instructions")}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                  {editForm.formState.errors.instructions ? (
                    <p className="text-sm text-red-600">
                      {editForm.formState.errors.instructions.message}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updateRecipe.isPending}
                    className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                  >
                    {updateRecipe.isPending ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRecipeId(null)}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{recipe.title}</h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRecipeId(recipe.id);
                        editForm.reset({
                          title: recipe.title,
                          ingredients: recipe.ingredients,
                          instructions: recipe.instructions,
                        });
                      }}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ok = window.confirm("Delete this recipe?");
                        if (ok) {
                          deleteRecipe.mutate(recipe.id);
                        }
                      }}
                      disabled={deleteRecipe.isPending}
                      className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Ingredients</p>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{recipe.ingredients}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Instructions</p>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{recipe.instructions}</p>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
