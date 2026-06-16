export type Category = {
  id: string;
  key: string;
  label: string;
  href: string;
  order: number;
};

export type CategoryListResponse = {
  categories: Category[];
};
