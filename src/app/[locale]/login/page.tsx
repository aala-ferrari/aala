import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = { title: 'Accedi' };

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center pt-24 pb-16">
      <div className="container-aala max-w-md">
        <AuthForm mode="login" />
      </div>
    </section>
  );
}
