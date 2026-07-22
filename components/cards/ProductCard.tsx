import { Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/data/catalog";

export function ProductCard({ product }: { product: Product }) {
  const hasPrice = product.price != null;
  const isAvailable = product.availabilityStatus === "available" && Boolean(product.externalUrl);

  return (
    <article className="card product-card">
      <div className={`card__media artwork ${product.imageClass}`}>
        <button type="button" className="favorite" aria-label={`Save ${product.name}`}>
          <Heart size={21} />
        </button>
      </div>
      <div className="card__body product-card__body">
        <p className="product-category">{product.category}</p>
        <h3 className="card__title">{product.name}</h3>
        <p className="card__description">{product.description}</p>
        {hasPrice ? (
          <p className="product-card__price">${product.price!.toFixed(2)}</p>
        ) : (
          <p className="product-card__note">Pricing coming soon</p>
        )}
        {isAvailable ? (
          <Button href={product.externalUrl} variant="primary" fullWidth aria-label={`View ${product.name}`}>
            View Product
          </Button>
        ) : (
          <Button href="/contact" variant="outline" fullWidth>
            Contact for Details
          </Button>
        )}
      </div>
    </article>
  );
}
