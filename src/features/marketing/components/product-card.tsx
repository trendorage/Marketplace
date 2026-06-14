import { ShoppingBag, ShoppingCart, Star, Truck } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { type Product } from '@/shared/const/home.const';
import { cn } from '@/shared/lib/utils';

type ProductCardProps = {
  product: Product;
};

const StarRow = ({ reviews }: { reviews: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={cn('size-2.5 sm:size-3', i <= 4 ? 'fill-primary text-primary' : 'text-border')}
      />
    ))}
    <span className="ml-0.5 text-xs text-muted-foreground">({reviews})</span>
  </div>
);

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card
      transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Discount badge */}
      {product.discountPercent && (
        <span className="absolute left-2 top-2 z-10 rounded bg-destructive px-1.5 py-0.5 text-xs font-bold text-white">
          -{product.discountPercent}%
        </span>
      )}

      {/* New badge */}
      {product.badge === 'new' && !product.discountPercent && (
        <span className="absolute left-2 top-2 z-10 rounded bg-secondary px-1.5 py-0.5 text-xs font-bold text-secondary-foreground">
          სიახლე
        </span>
      )}

      {/* Image */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <ShoppingBag className="absolute inset-0 m-auto size-10 text-muted-foreground/20
            transition-transform duration-300 group-hover:scale-110 sm:size-14" />
          {product.badge === 'express' && (
            <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-primary
              px-1.5 py-0.5 text-xs font-semibold text-primary-foreground sm:bottom-2 sm:left-2">
              <Truck className="size-2.5 sm:size-3" />
              Express
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-2 sm:gap-2 sm:p-3">
        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-xs font-medium text-foreground transition-colors hover:text-primary sm:text-sm"
        >
          {product.name}
        </Link>

        <StarRow reviews={product.reviews} />

        {/* Price */}
        <div className="flex flex-col gap-0.5">
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {product.originalPrice.toFixed(2)} ₾
            </span>
          )}
          <span className="text-sm font-bold text-foreground sm:text-base">
            {product.price.toFixed(2)} ₾
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-1 pt-1">
          <Button
            size="sm"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingCart className="size-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">კალათაში დამატება</span>
          </Button>
          <button
            type="button"
            className="w-full text-xs text-muted-foreground transition-colors hover:text-secondary"
          >
            შედარება
          </button>
        </div>
      </div>
    </div>
  );
};
