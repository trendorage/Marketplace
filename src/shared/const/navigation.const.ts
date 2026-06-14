export type SidebarNavItem = {
  href: string;
  label: string;
  icon: 'dashboard';
};

export type MarketCategory = {
  key: string;
  label: string;
  href: string;
};

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
];

export const MARKET_CATEGORIES: MarketCategory[] = [
  { key: 'mobile', label: 'მობილურები და პლანშეტები', href: '/category/mobile' },
  { key: 'photo', label: 'ფოტო ვიდეო აუდიო', href: '/category/photo' },
  { key: 'office-tech', label: 'საოფისე ტექნიკა', href: '/category/office-tech' },
  { key: 'computers', label: 'კომპიუტერული ტექნიკა', href: '/category/computers' },
  { key: 'stationery', label: 'საკანცელარიო ნივთები', href: '/category/stationery' },
  { key: 'network', label: 'ქსელის მოწყობილობები', href: '/category/network' },
  { key: 'home-appliances', label: 'საყოფაცხოვრებო ტექნიკა', href: '/category/home-appliances' },
  { key: 'beauty-home', label: 'სილამაზე და სახლი', href: '/category/beauty-home' },
  { key: 'climate', label: 'კლიმატური ტექნიკა', href: '/category/climate' },
  { key: 'kitchen', label: 'სამზარეულოს ტექნიკა', href: '/category/kitchen' },
  { key: 'auto', label: 'ავტოსამყარო', href: '/category/auto' },
  { key: 'recreation', label: 'დასვენება და გართობა', href: '/category/recreation' },
  { key: 'electrical', label: 'ელექტროობა და განათება', href: '/category/electrical' },
  { key: 'children', label: 'საბავშვო', href: '/category/children' },
  { key: 'furniture', label: 'ავეჯი', href: '/category/furniture' },
  { key: 'toys', label: 'სათამაშოები', href: '/category/toys' },
  { key: 'tools', label: 'სამშენებლო ხელსაწყოები', href: '/category/tools' },
  { key: 'garden', label: 'ეზო და ბაღი', href: '/category/garden' },
  { key: 'medical', label: 'სამედიცინო ინვენტარი', href: '/category/medical' },
];
