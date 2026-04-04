import { LoginForm } from '@/features/auth/components/login-form';
import { Header } from '@/shared/components/layout/header';

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <LoginForm />
      </main>
    </div>
  );
}
