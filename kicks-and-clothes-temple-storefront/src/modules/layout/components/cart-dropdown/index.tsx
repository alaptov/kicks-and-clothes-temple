"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { ShoppingBag } from "@medusajs/icons"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full focus:outline-none">
          <LocalizedClientLink
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            href="/cart"
            data-testid="nav-cart-link"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-medium w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border border-gray-200 w-[380px] shadow-lg"
            data-testid="nav-cart-dropdown"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium">Shopping Bag</h3>
            </div>

            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-scroll max-h-[350px] px-4 py-4 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="flex gap-4 py-4 border-b border-gray-100 last:border-0"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        {/* Thumbnail */}
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-20 h-20 flex-shrink-0 bg-gray-100"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>

                        {/* Details */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            className="text-sm font-medium text-gray-900 hover:underline truncate"
                            data-testid="product-link"
                          >
                            {item.title}
                          </LocalizedClientLink>
                          <LineItemOptions
                            variant={item.variant}
                            data-testid="cart-item-variant"
                            data-value={item.variant}
                          />
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-sm text-gray-500">
                              Qty: {item.quantity}
                            </span>
                            <LineItemPrice
                              item={item}
                              style="tight"
                              currencyCode={cartState.currency_code}
                            />
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="text-xs text-gray-500 hover:text-black mt-2 self-start"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Subtotal</span>
                    <span
                      className="text-base font-semibold"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref className="block">
                    <button
                      className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                      data-testid="go-to-cart-button"
                    >
                      Go To Checkout
                    </button>
                  </LocalizedClientLink>
                  <LocalizedClientLink
                    href="/store"
                    className="block text-center text-sm text-gray-600 hover:text-black mt-3"
                    onClick={close}
                  >
                    Continue Shopping
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="py-12 px-4 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-6">Your shopping bag is empty</p>
                <LocalizedClientLink href="/store" onClick={close}>
                  <button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors">
                    Start Shopping
                  </button>
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
