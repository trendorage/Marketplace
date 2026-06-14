'use client';
import { Bell, CreditCard, Package, Settings, ShoppingCart, Store, User } from 'lucide-react';
import { useState } from 'react';

import { NOTIFICATIONS } from '@/features/dashboard/const/dashboard.const';
import type { NotificationItem, NotificationType } from '@/features/dashboard/types/dashboard.types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  order: ShoppingCart,
  user: User,
  seller: Store,
  product: Package,
  system: Settings,
  payment: CreditCard,
};

const TYPE_COLOR: Record<NotificationType, string> = {
  order: 'bg-blue-100 text-blue-600',
  user: 'bg-purple-100 text-purple-600',
  seller: 'bg-orange-100 text-orange-600',
  product: 'bg-green-100 text-green-600',
  system: 'bg-gray-100 text-gray-600',
  payment: 'bg-emerald-100 text-emerald-600',
};

type NotificationCardProps = {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
};

const NotificationCard = ({ notification, onMarkRead }: NotificationCardProps) => {
  const Icon = TYPE_ICON[notification.type];
  const color = TYPE_COLOR[notification.type];

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors',
        !notification.read && 'border-primary/20 bg-primary/5'
      )}
    >
      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', color)}>
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">{notification.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
          </div>
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              წაკითხულად
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{notification.time}</p>
      </div>
      {!notification.read && (
        <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </div>
  );
};

export default function NotificationsPage() {
  const [items, setItems] = useState(NOTIFICATIONS);
  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">შეტყობინებები</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} წაუკითხავი` : 'ყველა წაკითხულია'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-primary hover:underline"
          >
            ყველა წაკითხულად
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'სულ', value: items.length, icon: Bell },
          { label: 'წაუკითხავი', value: unreadCount, icon: Bell },
          { label: 'შეკვეთები', value: items.filter((n) => n.type === 'order').length, icon: ShoppingCart },
          { label: 'სისტემა', value: items.filter((n) => n.type === 'system').length, icon: Settings },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Unread */}
      {unreadCount > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            წაუკითხავი
          </p>
          <div className="space-y-3">
            {items.filter((n) => !n.read).map((n) => (
              <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
            ))}
          </div>
        </div>
      )}

      {/* Read */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          ადრე წაკითხული
        </p>
        <div className="space-y-3">
          {items.filter((n) => n.read).map((n) => (
            <NotificationCard key={n.id} notification={n} onMarkRead={markRead} />
          ))}
        </div>
      </div>
    </div>
  );
}
