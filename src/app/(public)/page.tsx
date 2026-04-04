import Link from 'next/link';

import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { HOME_FEATURES } from '@/shared/const/home.const';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-24 pt-20 text-center sm:px-10">

        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
            Production-ready starter
          </span>
        </div>

        <h1 className={`mx-auto max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl 
        bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent`}>
          Ship faster.<br />Worry less.
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A full-stack Next.js 16 starter with authentication, database, state
          management, and UI configured and ready to go on day one.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild className="font-semibold px-8">
            <Link href="/sign-up">Get started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild className="px-8">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>

        <div className="mt-24 h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden="true" />

        <section className="mt-20 w-full max-w-5xl" aria-label="Features">
          <div className="mb-12 text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              What&apos;s included
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3 rounded-xl overflow-hidden border border-border">
            {HOME_FEATURES.map((feature) => (
              <Card
                key={feature.index}
                className="group relative rounded-none border-0 shadow-none gap-0 transition-colors duration-300 hover:bg-accent"
              >
                <div
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent 
                    via-border to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <CardHeader className="flex flex-row items-start justify-between px-8 pt-8 pb-5">
                  <span className={`inline-flex items-center rounded-md border border-border 
                  bg-muted/40 px-2 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground`}>
                    {feature.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {feature.index}
                  </span>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
