'use client';
import {
  BarChart2,
  Bell,
  DollarSign,
  FileText,
  LayoutDashboard,
  List,
  type LucideIcon,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DASHBOARD_NAV_SECTIONS } from '@/features/dashboard/const/dashboard.const';
import type { DashboardNavItem } from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/shared/lib/utils';

const ICON_MAP: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'bar-chart-2': BarChart2,
  'file-text': FileText,
  'shopping-cart': ShoppingCart,
  package: Package,
  store: Store,
  users: Users,
  'dollar-sign': DollarSign,
  bell: Bell,
  settings: Settings,
  list: List,
};

type DashboardSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavLinkProps = {
  item: DashboardNavItem;
  isActive: boolean;
  onClick: () => void;
};

const NavLink = ({ item, isActive, onClick }: NavLinkProps) => {
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-full text-xs font-bold',
            isActive ? 'bg-white/20 text-white' : 'bg-primary text-primary-foreground'
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
};

export const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-secondary transition-transform duration-200',
          'sm:static sm:z-auto sm:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2">
            <span className="text-lg font-black tracking-widest text-primary">TRENDORA</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white sm:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {DASHBOARD_NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-white/30">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={pathname === item.href}
                      onClick={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom admin info */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              A
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">Admin Panel</p>
              <p className="truncate text-xs text-white/40">Trendora Marketplace</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
