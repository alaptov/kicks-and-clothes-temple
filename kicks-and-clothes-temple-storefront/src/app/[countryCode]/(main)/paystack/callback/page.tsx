"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { placeOrder } from "@lib/data/cart"

export default function PaystackCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const countryCode = params.countryCode as string

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const reference = searchParams.get("reference")
      const trxref = searchParams.get("trxref")

      // Paystack returns either reference or trxref
      const paymentReference = reference || trxref

      if (!paymentReference) {
        setStatus("error")
        setErrorMessage("No payment reference found")
        return
      }

      try {
        // Complete the order - Medusa will verify the payment with Paystack
        await placeOrder()
        setStatus("success")
        // The placeOrder function will redirect to the order confirmation page
      } catch (err: any) {
        console.error("Error completing order:", err)
        setStatus("error")
        setErrorMessage(err.message || "Failed to complete your order")
      }
    }

    handleCallback()
  }, [searchParams, countryCode, router])

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
        <p className="text-lg">Processing your payment...</p>
        <p className="text-sm text-gray-500">Please wait while we confirm your payment</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 text-5xl">!</div>
        <h1 className="text-2xl font-semibold">Payment Failed</h1>
        <p className="text-gray-600">{errorMessage}</p>
        <button
          onClick={() => router.push(`/${countryCode}/checkout?step=payment`)}
          className="mt-4 px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Success state - this shouldn't show as placeOrder redirects
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-green-500 text-5xl">&#10003;</div>
      <h1 className="text-2xl font-semibold">Payment Successful!</h1>
      <p className="text-gray-600">Redirecting to your order...</p>
    </div>
  )
}
