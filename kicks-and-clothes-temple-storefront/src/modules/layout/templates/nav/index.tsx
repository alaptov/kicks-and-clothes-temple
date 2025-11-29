import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import SearchBar from "@modules/layout/components/search-bar"
import { User, Heart, ShoppingBag } from "@medusajs/icons"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const categories = await listCategories()

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      {/* Top Navigation - Gender Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="content-container">
          <div className="flex items-center justify-between h-12">
            {/* Gender tabs - Left */}
            <div className="flex items-center gap-x-6">
              <LocalizedClientLink
                href="/store"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Womenswear
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="text-sm font-semibold text-black"
              >
                Menswear
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                Kidswear
              </LocalizedClientLink>
            </div>

            {/* Logo - Center */}
            <LocalizedClientLink
              href="/"
              className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold tracking-tight text-black"
              data-testid="nav-store-link"
            >
              KC TEMPLE
            </LocalizedClientLink>

            {/* Right side icons */}
            <div className="flex items-center gap-x-4">
              {/* Country selector with flag */}
              <div className="hidden md:flex items-center">
                <span className="text-xl">🇬🇭</span>
              </div>

              {/* Account */}
              <LocalizedClientLink
                href="/account"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                data-testid="nav-account-link"
              >
                <User className="w-5 h-5" />
              </LocalizedClientLink>

              {/* Wishlist */}
              <LocalizedClientLink
                href="/account"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5" />
              </LocalizedClientLink>

              {/* Cart */}
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="content-container">
          <div className="flex items-center justify-between h-12">
            {/* Categories - Left */}
            <div className="flex items-center gap-x-1 overflow-x-auto no-scrollbar">
              <LocalizedClientLink
                href="/store"
                className="text-sm text-red-600 font-medium whitespace-nowrap px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                Sale
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/store"
                className="text-sm text-gray-700 whitespace-nowrap px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors"
              >
                New in
              </LocalizedClientLink>
              {categories?.slice(0, 6).map((category) => (
                <LocalizedClientLink
                  key={category.id}
                  href={`/categories/${category.handle}`}
                  className="text-sm text-gray-700 whitespace-nowrap px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  {category.name}
                </LocalizedClientLink>
              ))}
            </div>

            {/* Search - Right */}
            <div className="hidden md:flex">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="content-container">
          <div className="flex items-center justify-between">
            <p className="text-base text-gray-900">
              <span className="font-medium">Black Friday:</span> get an extra 20% off sale
            </p>
            <LocalizedClientLink
              href="/store"
              className="btn-secondary text-sm px-4 py-2"
            >
              Shop Black Friday
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <SideMenu regions={regions} />
      </div>
    </div>
  )
}
