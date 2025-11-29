"use client"

import { Text } from "@medusajs/ui"
import { Heart } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { getProductPrice } from "@lib/util/get-product-price"

const SearchProductCard = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const { cheapestPrice } = getProductPrice({ product })
  const brand = (product.metadata?.brand as string) || "KC Temple"

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div data-testid="product-wrapper" className="product-card">
        <div className="product-card-image relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
          />

          <button
            className="wishlist-btn"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            <Heart className="w-4 h-4" />
          </button>

          {cheapestPrice?.price_type === "sale" && (
            <div className="sale-badge">Sale</div>
          )}
        </div>

        <div className="product-card-info">
          <Text className="product-card-brand" data-testid="product-brand">
            {brand}
          </Text>
          <Text className="product-card-title" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2 mt-1">
            {cheapestPrice && (
              <Text className="text-sm font-semibold">
                {cheapestPrice.calculated_price}
              </Text>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}

const SearchResults = ({
  products,
  query,
  count,
}: {
  products: HttpTypes.StoreProduct[]
  query?: string
  count: number
}) => {
  if (!query) {
    return (
      <div className="text-center py-16">
        <Text className="text-gray-500">
          Enter a search term to find products
        </Text>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Text className="text-gray-500">No products found for "{query}"</Text>
        <Text className="text-gray-400 mt-2">
          Try searching with different keywords
        </Text>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {products.map((product) => (
        <SearchProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default SearchResults
