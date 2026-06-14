'use client';
import { Bell, LogOut, Menu, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useLogout } from '@/features/auth/hooks/use-logout';
import { DASHBOARD_PAGE_TITLES } from '@/features/dashboard/const/dashboard.const';
import { NOTIFICATIONS } from '@/features/dashboard/const/dashboard.const';
import { Button } from '@/shared/components/ui/button';

type DashboardTopbarProps = {
  onMenuClick: () => void;
};

export const DashboardTopbar = ({ onMenuClick }: DashboardTopbarProps) => {
  const pathname = usePathname();
  const { logout } = useLogout();
  const pageTitle = DASHBOARD_PAGE_TITLES[pathname] ?? 'Dashboard';
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground
            transition-colors hover:bg-accent hover:text-accent-foreground sm:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground sm:text-lg">{pageTitle}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Trendora Admin Dashboard
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground
            transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span
              className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center
                rounded-full bg-primary text-xs font-bold text-primary-foreground"
            >
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Profile link */}
        <Link
          href="/dashboard/settings"
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground
            transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Settings"
        >
          <User className="size-5" />
        </Link>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          className="size-9 text-muted-foreground hover:text-destructive"
          aria-label="Logout"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
};
