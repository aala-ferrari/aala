import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = { title: 'Accedi' };

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-start justify-center px-4 pt-28 pb-28 sm:items-center sm:pt-24 sm:pb-16">
      <div className="w-full max-w-md">
        <AuthForm mode="login" />
      </div>
    </section>
  );
}
