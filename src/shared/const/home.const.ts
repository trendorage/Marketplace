export type FeatureCard = {
  label: string;
  title: string;
  description: string;
  index: string;
};

export const HOME_FEATURES: FeatureCard[] = [
  {
    label: 'Framework',
    title: 'Next.js 16',
    description:
      'App Router, React Server Components, and streaming built in. Ship fast with the architecture that scales.',
    index: '01',
  },
  {
    label: 'Auth & Data',
    title: 'NextAuth + MongoDB',
    description:
      'Credentials-based auth with JWT sessions, wired to MongoDB via Mongoose. Secure by default, extensible by design.',
    index: '02',
  },
  {
    label: 'State & UI',
    title: 'Zustand + shadcn/ui',
    description:
      'Vanilla Zustand stores via context for predictable state. shadcn/ui components for a polished, accessible interface.',
    index: '03',
  },
];
