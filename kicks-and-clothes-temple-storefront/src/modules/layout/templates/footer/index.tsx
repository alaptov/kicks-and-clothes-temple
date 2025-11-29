import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="content-container py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Sign up for KC Temple updates</h3>
              <p className="text-gray-400 text-sm">
                Be the first to know about new arrivals, sales & promos!
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email"
                className="bg-transparent border border-gray-700 px-4 py-3 text-sm flex-1 md:w-64 focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-white text-black px-6 py-3 text-sm font-medium hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="content-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Shop Column */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3">
              <li>
                <LocalizedClientLink href="/store" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Womenswear
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Menswear
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Kidswear
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="text-red-500 text-sm hover:text-red-400 transition-colors">
                  Sale
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Categories Column */}
          {productCategories && productCategories?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Categories</h4>
              <ul className="space-y-3">
                {productCategories?.slice(0, 6).map((c) => {
                  if (c.parent_category) return null
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        href={`/categories/${c.handle}`}
                        className="text-gray-400 text-sm hover:text-white transition-colors"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Customer Service Column */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <LocalizedClientLink href="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Contact Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/faq" className="text-gray-400 text-sm hover:text-white transition-colors">
                  FAQs
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/shipping" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Shipping
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/returns" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Returns & Exchanges
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/size-guide" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Size Guide
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">About</h4>
            <ul className="space-y-3">
              <li>
                <LocalizedClientLink href="/about" className="text-gray-400 text-sm hover:text-white transition-colors">
                  About Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/careers" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Careers
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/stores" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Store Locations
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/sustainability" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Sustainability
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="content-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <LocalizedClientLink href="/" className="text-xl font-bold tracking-tight">
              KC TEMPLE
            </LocalizedClientLink>

            {/* Copyright & Links */}
            <div className="flex flex-col md:flex-row items-center gap-4 text-gray-400 text-xs">
              <span>© {new Date().getFullYear()} Kicks & Clothes Temple. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <LocalizedClientLink href="/content/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </LocalizedClientLink>
                <LocalizedClientLink href="/content/terms-of-use" className="hover:text-white transition-colors">
                  Terms & Conditions
                </LocalizedClientLink>
              </div>
            </div>

            {/* Country Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🇬🇭</span>
              <span className="text-sm text-gray-400">Ghana (GHS)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="content-container py-4">
          <div className="flex items-center justify-center gap-4 text-gray-500 text-xs">
            <span>We accept:</span>
            <span className="font-medium">Visa</span>
            <span className="font-medium">Mastercard</span>
            <span className="font-medium">Paystack</span>
            <span className="font-medium">Mobile Money</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
