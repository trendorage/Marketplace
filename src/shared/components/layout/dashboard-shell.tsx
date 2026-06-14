'use client';
import { type ReactNode, useState } from 'react';

import { DashboardSidebar } from '@/shared/components/layout/dashboard-sidebar';
import { DashboardTopbar } from '@/shared/components/layout/dashboard-topbar';

type DashboardShellProps = {
  children: ReactNode;
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};
