"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabaseClient";
import { sectionSchema, type SectionValues } from "@/lib/validations";

type Section = {
  id: string;
  title: string;
  created_at: string;
};

type SectionsClientProps = {
  userId: string;
};

export default function SectionsClient({ userId }: SectionsClientProps) {
  const queryClient = useQueryClient();
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const form = useForm<SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { title: "" },
  });
  const editForm = useForm<SectionValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { title: "" },
  });

  const sectionsQuery = useQuery({
    queryKey: ["sections", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sections")
        .select("id,title,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return data as Section[];
    },
  });

  const createSection = useMutation({
    mutationFn: async (values: SectionValues) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("sections")
        .insert({
          title: values.title.trim(),
          user_id: userId,
        })
        .select("id,title,created_at")
        .single();

      if (error) {
        throw error;
      }

      return data as Section;
    },
    onMutate: () => {
      setCreateError(null);
    },
    onSuccess: (newSection) => {
      form.reset();
      queryClient.setQueryData<Section[]>(["sections", userId], (current = []) => [
        newSection,
        ...current,
      ]);
      queryClient.invalidateQueries({ queryKey: ["sections", userId] });
    },
    onError: (error: PostgrestError) => {
      setCreateError(error.message);
    },
  });

  const updateSection = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: SectionValues }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("sections")
        .update({ title: values.title.trim() })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }
    },
    onMutate: () => {
      setUpdateError(null);
    },
    onSuccess: () => {
      setEditingSectionId(null);
      queryClient.invalidateQueries({ queryKey: ["sections", userId] });
    },
    onError: (error: PostgrestError) => {
      setUpdateError(error.message);
    },
  });

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("sections").delete().eq("id", id).eq("user_id", userId);

      if (error) {
        throw error;
      }
    },
    onMutate: () => {
      setDeleteError(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections", userId] });
    },
    onError: (error: PostgrestError) => {
      setDeleteError(error.message);
    },
  });

  return (
    <div className="mx-auto mt-10 w-full max-w-2xl space-y-6 px-4 pb-10">
      <form
        onSubmit={form.handleSubmit((values) => createSection.mutate(values))}
        className="space-y-2 rounded border border-gray-200 p-4"
      >
        <h2 className="text-lg font-semibold">Create Section</h2>
        <input
          {...form.register("title")}
          placeholder="Section title"
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.title ? (
          <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
        ) : null}
        {createError ? <p className="text-sm text-red-600">{createError}</p> : null}
        <button
          type="submit"
          disabled={createSection.isPending}
          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {createSection.isPending ? "Creating..." : "Create"}
        </button>
      </form>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Your Sections</h2>
        {sectionsQuery.isLoading ? <p>Loading...</p> : null}
        {sectionsQuery.error ? (
          <p className="text-sm text-red-600">{(sectionsQuery.error as Error).message}</p>
        ) : null}
        {deleteError ? <p className="text-sm text-red-600">{deleteError}</p> : null}
        {sectionsQuery.data && sectionsQuery.data.length === 0 ? (
          <p className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
            No sections yet.
          </p>
        ) : null}
        <ul className="space-y-2">
          {sectionsQuery.data?.map((section) => (
            <li key={section.id} className="rounded border border-gray-200 p-3">
              {editingSectionId === section.id ? (
                <form
                  onSubmit={editForm.handleSubmit((values) =>
                    updateSection.mutate({ id: section.id, values }),
                  )}
                  className="space-y-2"
                >
                  <input
                    {...editForm.register("title")}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                  {editForm.formState.errors.title ? (
                    <p className="text-sm text-red-600">{editForm.formState.errors.title.message}</p>
                  ) : null}
                  {updateError ? <p className="text-sm text-red-600">{updateError}</p> : null}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updateSection.isPending}
                      className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                    >
                      {updateSection.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(null)}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/section/${section.id}`} className="font-medium underline">
                    {section.title}
                  </Link>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSectionId(section.id);
                        editForm.reset({ title: section.title });
                      }}
                      className="rounded border border-gray-300 px-3 py-1.5 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ok = window.confirm("Delete this section?");
                        if (ok) {
                          deleteSection.mutate(section.id);
                        }
                      }}
                      disabled={deleteSection.isPending}
                      className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
