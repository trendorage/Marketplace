import { Instagram } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/shared/components/layout/logo';
import { APP_NAME } from '@/shared/const/app.const';

const PLATFORM_LINKS = [
  { href: '/products', label: 'ყველა პროდუქტი' },
  { href: '/sale', label: 'ფასდაკლებები' },
  { href: '/category/mobile', label: 'მობილურები' },
  { href: '/category/computers', label: 'კომპიუტერები' },
];

const COMPANY_LINKS = [
  { href: '/about', label: 'ჩვენს შესახებ' },
  { href: '/contact', label: 'კონტაქტი' },
  { href: '/privacy', label: 'კონფიდენციალობა' },
  { href: '/terms', label: 'მომსახურების პირობები' },
  { href: '/corporate', label: 'კორპორატიული გაყიდვები' },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-10 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand + contact */}
          <div className="col-span-2 lg:col-span-2">
            <Logo />


            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex size-9 items-center justify-center rounded-lg border border-border
                text-muted-foreground transition-all hover:border-primary/40 hover:text-primary"
            >
              <Instagram className="size-4" />
            </a>
          </div>

          {/* Platform links */}
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground">
              პლატფორმა
            </p>
            <ul className="flex flex-col gap-3">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground">
              კომპანია
            </p>
            <ul className="flex flex-col gap-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 {APP_NAME}. ყველა უფლება დაცულია.
          </p>
        </div>
      </div>
    </footer>
  );
};
