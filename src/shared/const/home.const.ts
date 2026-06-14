export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  badge?: 'new' | 'express';
  reviews: number;
  category: string;
};

export type ServiceProp = {
  key: string;
  title: string;
  subtitle: string;
};

export const QUICK_SEARCH_TAGS = [
  'მობილური',
  'ნოუთბუქი',
  'ყურსასმენი',
  'ვებ-კამერა',
  'პრინტერი',
  'ტაბლეტი',
  'სმარტ საათი',
];

export const POPULAR_PRODUCTS: Product[] = [
  { id: '1', name: 'სელფის ტრიპოდი', price: 80, reviews: 2, category: 'photo', badge: 'express' },
  { id: '2', name: 'უკაბელო მაუსი', price: 35, reviews: 5, category: 'computers' },
  { id: '3', name: 'ნოუთბუქის სადგამი', price: 100, reviews: 8, category: 'computers', badge: 'express' },
  { id: '4', name: 'USB ჰაბი', price: 40, reviews: 3, category: 'computers' },
  { id: '5', name: 'ყურსასმენი', price: 150, reviews: 12, category: 'photo', badge: 'new' },
  { id: '6', name: 'USB-C ადაპტერი', price: 18, reviews: 6, category: 'computers' },
];

export const SALE_PRODUCTS: Product[] = [
  {
    id: '7',
    name: 'გეიმინგ კლავიატურა',
    price: 365,
    originalPrice: 629,
    discountPercent: 42,
    reviews: 4,
    category: 'computers',
  },
  {
    id: '8',
    name: 'სამაყურებელი სავარძელი',
    price: 400,
    originalPrice: 800,
    discountPercent: 50,
    reviews: 7,
    category: 'furniture',
  },
  {
    id: '9',
    name: 'ხელის ბლენდერი',
    price: 199.99,
    originalPrice: 399.99,
    discountPercent: 50,
    reviews: 15,
    category: 'kitchen',
  },
  {
    id: '10',
    name: 'სარეცხი მანქანა',
    price: 1299,
    originalPrice: 1449,
    discountPercent: 10,
    reviews: 22,
    category: 'home-appliances',
  },
  {
    id: '11',
    name: 'გეიმინგ ყურსასმენი',
    price: 329,
    originalPrice: 449,
    discountPercent: 27,
    reviews: 9,
    category: 'photo',
  },
  {
    id: '12',
    name: 'ტელევიზორი 98"',
    price: 6199,
    originalPrice: 6994.68,
    discountPercent: 11,
    reviews: 3,
    category: 'recreation',
  },
];

export const SERVICE_PROPS: ServiceProp[] = [
  { key: 'delivery', title: 'Express მიწოდება', subtitle: '1,5 საათში' },
  { key: 'guarantee', title: 'გარანტია', subtitle: 'უკან დაბრუნების პოლიტიკა' },
  { key: 'innovation', title: 'ინოვაცია', subtitle: 'შემოგვთავაზე ფასი' },
  { key: 'service', title: 'მომსახურება', subtitle: 'კორპორატიული გაყიდვები' },
];
