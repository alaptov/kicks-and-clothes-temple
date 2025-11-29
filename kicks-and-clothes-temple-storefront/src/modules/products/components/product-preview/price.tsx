import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  // Calculate discount percentage for sale items
  const getDiscountPercentage = () => {
    if (price.price_type !== "sale" || !price.original_price || !price.calculated_price) {
      return null
    }
    // Extract numeric values
    const original = parseFloat(price.original_price.replace(/[^0-9.]/g, ''))
    const calculated = parseFloat(price.calculated_price.replace(/[^0-9.]/g, ''))
    if (original && calculated) {
      const discount = Math.round(((original - calculated) / original) * 100)
      return discount
    }
    return null
  }

  const discount = getDiscountPercentage()

  return (
    <div className="flex flex-col gap-0.5">
      {price.price_type === "sale" ? (
        <>
          {/* Original Price - crossed out */}
          <Text
            className="text-sm text-gray-500 line-through"
            data-testid="original-price"
          >
            {price.original_price}
          </Text>
          {/* Sale Price and Discount */}
          <div className="flex items-center gap-x-2">
            <Text
              className="text-sm font-medium text-red-600"
              data-testid="price"
            >
              {price.calculated_price}
            </Text>
            {discount && (
              <Text className="text-xs text-gray-500">
                ({discount}% off)
              </Text>
            )}
          </div>
        </>
      ) : (
        /* Regular Price */
        <Text
          className="text-sm font-medium text-gray-900"
          data-testid="price"
        >
          {price.calculated_price}
        </Text>
      )}
    </div>
  )
}
