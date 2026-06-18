export type ContentType = 'text' | 'richtext' | 'image' | 'json';

export type Content = {
  id: string;
  key: string;
  title: string;
  type: ContentType;
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContentListResponse = {
  items: Content[];
};
