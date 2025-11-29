import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { Text } from "@medusajs/ui"
import SearchResults from "@modules/search/components/search-results"

export const metadata: Metadata = {
  title: "Search Results | KC Temple",
  description: "Search for products",
}

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { countryCode } = await params
  const { q: query, page } = await searchParams
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products: any[] = []
  let count = 0

  if (query) {
    const result = await listProducts({
      pageParam: parseInt(page || "1"),
      queryParams: {
        q: query,
        limit: 24,
      },
      countryCode,
    })
    products = result.response.products
    count = result.response.count
  }

  return (
    <div className="content-container py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>
        {query && (
          <Text className="text-gray-500">
            {count} {count === 1 ? "product" : "products"} found
          </Text>
        )}
      </div>

      <SearchResults products={products} query={query} count={count} />
    </div>
  )
}
