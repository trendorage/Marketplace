import { Award, Briefcase, ChevronRight, Lightbulb, Tag, Truck } from 'lucide-react';
import Link from 'next/link';

import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import {
  POPULAR_PRODUCTS,
  QUICK_SEARCH_TAGS,
  SALE_PRODUCTS,
  SERVICE_PROPS,
} from '@/shared/const/home.const';
import { cn } from '@/shared/lib/utils';

import { ProductCard } from './product-card';

import type { LucideIcon } from 'lucide-react';

const SERVICE_ICONS: Record<string, LucideIcon> = {
  delivery: Truck,
  guarantee: Award,
  innovation: Lightbulb,
  service: Briefcase,
};

type SectionHeaderProps = {
  title: string;
  href: string;
};

const SectionHeader = ({ title, href }: SectionHeaderProps) => (
  <div className="mb-4 flex items-center justify-between sm:mb-6">
    <h2 className="text-base font-bold tracking-tight text-foreground sm:text-xl">{title}</h2>
    <Link
      href={href}
      className="flex items-center gap-1 text-xs font-medium text-secondary transition-colors hover:text-secondary/70 sm:text-sm"
    >
      ყველა <ChevronRight className="size-3.5 sm:size-4" />
    </Link>
  </div>
);

export const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Quick search tags */}
        <section className="border-b border-border bg-card py-2.5 sm:py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-10">
            <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto sm:flex-wrap">
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Tag className="size-3" />
                სწრაფი ძიება:
              </span>
              {QUICK_SEARCH_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}`}
                  className={cn(
                    'shrink-0 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs',
                    'text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hero banners */}
        <section className="border-b border-border bg-secondary py-4 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-10">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                {
                  title: 'ახალი კოლექცია',
                  subtitle: 'მობილური ტელეფონები',
                  href: '/category/mobile',
                  accent: 'border-primary/40',
                },
                {
                  title: 'Express მიწოდება',
                  subtitle: '1,5 საათში თბილისში',
                  href: '/category/computers',
                  accent: 'border-white/20',
                },
                {
                  title: 'ფასდაკლებები',
                  subtitle: '50%-მდე ფასდაკლება',
                  href: '/sale',
                  accent: 'border-primary/40',
                  mobileHide: true,
                },
              ].map((banner) => (
                <Link
                  key={banner.href}
                  href={banner.href}
                  className={cn(
                    'flex flex-col justify-center rounded-xl border bg-white/5 px-5 py-6 sm:px-6 sm:py-8',
                    'transition-all duration-300 hover:bg-white/10',
                    banner.accent,
                    banner.mobileHide && 'hidden sm:flex'
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {banner.subtitle}
                  </p>
                  <p className="mt-1 text-lg font-black text-white sm:text-xl">{banner.title}</p>
                  <span className="mt-2 flex items-center gap-1 text-sm text-white/60 sm:mt-3">
                    ნახვა <ChevronRight className="size-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular products */}
        <section className="border-b border-border py-6 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-10">
            <SectionHeader title="პოპულარული პროდუქტები" href="/products" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {POPULAR_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Discounts */}
        <section className="border-b border-border bg-muted/20 py-6 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-10">
            <SectionHeader title="ფასდაკლებები" href="/sale" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {SALE_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Service value props */}
        <section className="border-b border-border bg-card py-6 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-10">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {SERVICE_PROPS.map((prop) => {
                const Icon = SERVICE_ICONS[prop.key] ?? Truck;
                return (
                  <div
                    key={prop.key}
                    className={[
                      'flex flex-col items-center gap-2 rounded-xl border border-border p-4',
                      'text-center transition-all duration-300 hover:border-primary/30 hover:shadow-sm sm:gap-3 sm:p-6',
                    ].join(' ')}
                  >
                    <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-14">
                      <Icon className="size-5 sm:size-6" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground sm:text-base">{prop.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                        {prop.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
};
