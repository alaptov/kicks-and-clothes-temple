import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "gh" // Default to Ghana

// Country to region mapping for IP detection
const COUNTRY_REGION_MAP: Record<string, string> = {
  // Ghana - Primary market
  gh: "gh",
  // Nigeria
  ng: "ng",
  // South Africa
  za: "za",
  // United States
  us: "us",
  // Canada
  ca: "ca",
  // United Kingdom
  gb: "gb",
  // European countries
  de: "de",
  fr: "fr",
  es: "es",
  it: "it",
  nl: "nl",
  be: "be",
  at: "at",
  pt: "pt",
  ie: "ie",
}

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Detects the user's country from various sources:
 * 1. Vercel's x-vercel-ip-country header (automatic on Vercel)
 * 2. Cloudflare's CF-IPCountry header
 * 3. x-country header (can be set by CDN or reverse proxy)
 * 4. Falls back to DEFAULT_REGION
 */
function detectCountryFromHeaders(request: NextRequest): string | undefined {
  // Vercel automatic geo-detection
  const vercelCountry = request.headers.get("x-vercel-ip-country")?.toLowerCase()
  if (vercelCountry) return vercelCountry

  // Cloudflare geo-detection
  const cfCountry = request.headers.get("cf-ipcountry")?.toLowerCase()
  if (cfCountry && cfCountry !== "xx") return cfCountry

  // Custom header (for local development or custom CDN setup)
  const customCountry = request.headers.get("x-country")?.toLowerCase()
  if (customCountry) return customCountry

  // AWS CloudFront geo-detection
  const cloudfrontCountry = request.headers.get("cloudfront-viewer-country")?.toLowerCase()
  if (cloudfrontCountry) return cloudfrontCountry

  return undefined
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    // First, check if there's a country code in the URL
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else {
      // Try to detect country from headers
      const detectedCountry = detectCountryFromHeaders(request)

      if (detectedCountry && regionMap.has(detectedCountry)) {
        countryCode = detectedCountry
      } else if (regionMap.has(DEFAULT_REGION)) {
        countryCode = DEFAULT_REGION
      } else if (regionMap.keys().next().value) {
        countryCode = regionMap.keys().next().value
      }
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 * Supports IP-based region detection for:
 * - Ghana (GHS) - Paystack
 * - Nigeria (NGN) - Paystack
 * - South Africa (ZAR) - Stripe
 * - United States (USD) - Stripe
 * - Canada (CAD) - Stripe
 * - United Kingdom (GBP) - Stripe
 * - Europe (EUR) - Stripe
 */
export async function middleware(request: NextRequest) {
  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")

  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // if one of the country codes is in the url and the cache id is set, return next
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  // if one of the country codes is in the url and the cache id is not set, set the cache id and redirect
  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })

    return response
  }

  // check if the url is a static asset
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    // Handle case where no valid country code exists (empty regions)
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
