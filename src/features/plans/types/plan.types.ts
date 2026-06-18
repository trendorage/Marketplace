export type PlanLimits = {
  products: number;
  orders: number;
  storage: number;
};

export type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  currency: string;
  description: string;
  features: string[];
  limits: PlanLimits;
  isActive: boolean;
  isPopular: boolean;
  order: number;
  createdAt: string;
};

export type PlanListResponse = {
  plans: Plan[];
};
