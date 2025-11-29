import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const Hero = () => {
  return (
    <div className="w-full">
      {/* Main Hero Banner */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-gray-100">
        {/* Background Image */}
        <Image
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920"
          alt="KC Temple - Premium Fashion"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <span className="text-white text-sm font-medium tracking-widest uppercase mb-4">
            New Season
          </span>
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
            Black Friday Sale
          </h1>
          <p className="text-white text-lg md:text-xl mb-8 max-w-xl">
            Extra 20% off on selected items. Limited time only.
          </p>
          <div className="flex gap-4">
            <LocalizedClientLink
              href="/store"
              className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="bg-transparent text-white border border-white px-8 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              View Collection
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Category Tiles */}
      <div className="content-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sneakers */}
          <LocalizedClientLink href="/categories/sneakers" className="group relative aspect-[4/5] overflow-hidden bg-gray-100">
            <Image
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
              alt="Sneakers"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-white text-2xl font-bold mb-2">Sneakers</h3>
              <span className="text-white text-sm underline">Shop Now</span>
            </div>
          </LocalizedClientLink>

          {/* T-Shirts */}
          <LocalizedClientLink href="/categories/t-shirts" className="group relative aspect-[4/5] overflow-hidden bg-gray-100">
            <Image
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
              alt="T-Shirts"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-white text-2xl font-bold mb-2">T-Shirts</h3>
              <span className="text-white text-sm underline">Shop Now</span>
            </div>
          </LocalizedClientLink>

          {/* Hoodies */}
          <LocalizedClientLink href="/categories/hoodies" className="group relative aspect-[4/5] overflow-hidden bg-gray-100">
            <Image
              src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"
              alt="Hoodies"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-white text-2xl font-bold mb-2">Hoodies</h3>
              <span className="text-white text-sm underline">Shop Now</span>
            </div>
          </LocalizedClientLink>
        </div>
      </div>

      {/* Feature Banner */}
      <div className="bg-gray-100 py-12">
        <div className="content-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">🚚</div>
              <h4 className="font-semibold mb-1">Free Delivery</h4>
              <p className="text-gray-600 text-sm">On orders over GHS 500</p>
            </div>
            <div>
              <div className="text-3xl mb-3">↩️</div>
              <h4 className="font-semibold mb-1">Easy Returns</h4>
              <p className="text-gray-600 text-sm">30-day return policy</p>
            </div>
            <div>
              <div className="text-3xl mb-3">🔒</div>
              <h4 className="font-semibold mb-1">Secure Payment</h4>
              <p className="text-gray-600 text-sm">100% secure checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
