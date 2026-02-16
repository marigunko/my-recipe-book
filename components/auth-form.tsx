"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabaseClient";
import { authSchema, type AuthValues } from "@/lib/validations";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: AuthValues) => {
      const supabase = createClient();

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword(values);
        if (signInError) {
          throw signInError;
        }
      } else {
        const { error: signUpError } = await supabase.auth.signUp(values);
        if (signUpError) {
          throw signUpError;
        }
      }
    },
    onSuccess: () => {
      router.push("/book");
      router.refresh();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const onSubmit = (values: AuthValues) => {
    setError(null);
    mutation.mutate(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto mt-20 w-full max-w-md space-y-4 rounded border border-gray-200 p-6"
    >
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Login" : "Register"}</h1>
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...form.register("email")}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.email ? (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...form.register("password")}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.password ? (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {mutation.isPending ? "Please wait..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
}
