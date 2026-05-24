import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = { title: 'Registrati' };

export default function SignupPage() {
  return (
    <section className="flex min-h-screen items-center justify-center pt-24 pb-16">
      <div className="container-aala max-w-md">
        <AuthForm mode="signup" />
      </div>
    </section>
  );
}
