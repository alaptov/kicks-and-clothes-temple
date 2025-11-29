import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Extract brand from product metadata or use store name
  const brand = product.metadata?.brand as string || "KC Temple"

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group block">
      <div data-testid="product-wrapper" className="product-card">
        {/* Product Image Container */}
        <div className="product-card-image relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />

          {/* Sale Badge */}
          {cheapestPrice?.price_type === "sale" && (
            <div className="sale-badge">
              Sale
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-card-info">
          {/* Brand */}
          <Text className="product-card-brand" data-testid="product-brand">
            {brand}
          </Text>

          {/* Product Title */}
          <Text className="product-card-title" data-testid="product-title">
            {product.title}
          </Text>

          {/* Price */}
          <div className="flex items-center gap-x-2 mt-1">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
