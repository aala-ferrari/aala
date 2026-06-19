import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AuthForm } from '@/components/auth/AuthForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return { title: t('metaSignup') };
}

export default function SignupPage() {
  return (
    <section className="flex min-h-screen items-start justify-center px-4 pt-28 pb-28 sm:items-center sm:pt-24 sm:pb-16">
      <div className="w-full max-w-md">
        <AuthForm mode="signup" />
      </div>
    </section>
  );
}
