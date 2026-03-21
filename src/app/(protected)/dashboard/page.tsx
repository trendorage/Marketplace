import { Users, Activity, TrendingUp, Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { auth } from '@/shared/lib/auth';

const statCards = [
  {
    title: 'Total Users',
    value: '1,234',
    description: '+12% from last month',
    icon: Users,
  },
  {
    title: 'Active Sessions',
    value: '56',
    description: 'Currently active',
    icon: Activity,
  },
  {
    title: 'Growth Rate',
    value: '8.2%',
    description: 'Month over month',
    icon: TrendingUp,
  },
  {
    title: 'Avg. Session Time',
    value: '24m',
    description: 'Per active session',
    icon: Clock,
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userName}</h1>
        <p className="text-muted-foreground mt-1">
          Here is an overview of your application metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
