import Link from "next/link";

import AuthForm from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="px-4">
      <AuthForm mode="register" />
      <p className="mt-4 text-center text-sm">
        Have an account? <Link href="/login" className="underline">Login</Link>
      </p>
    </main>
  );
}
