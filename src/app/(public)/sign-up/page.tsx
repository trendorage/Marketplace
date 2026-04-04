import { SignUpForm } from '@/features/auth/components/signup-form';
import { Header } from '@/shared/components/layout/header';

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <SignUpForm />
      </main>
    </div>
  );
}
