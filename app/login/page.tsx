import Link from "next/link";

import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="px-4">
      <AuthForm mode="login" />
      <p className="mt-4 text-center text-sm">
        No account? <Link href="/register" className="underline">Register</Link>
      </p>
    </main>
  );
}
