"use client"
import Link from "next/link"
import Image from "next/image"
import { getProxyImageUrl } from "@/lib/images"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

export function CartDrawer() {
  const cartContext = useCart();
  const { items, total, isOpen } = cartContext.state;
  const { toggleCart, closeCart, updateQuantity, removeItem, getCartCount, openCart } = cartContext;
  const { user } = useAuth();
  const itemCount = getCartCount();

  const handleDecrease = (id: string, quantity: number, name?: string) => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1)
      toast("Quantity decreased")
    } else {
      // quantity is 1 -> confirm deletion
      toast.warning("Are you sure you want to delete the product?", {
        action: {
          label: "Delete",
          onClick: () => {
            removeItem(id)
            toast.success("Product removed")
          },
        },
      })
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openCart();
        } else {
          closeCart();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary">
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Shopping Cart ({itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        {!items || items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted" />
            <p className="text-lg font-medium text-foreground">
              Your cart is empty
            </p>
            <p className="text-sm text-center text-muted">
              Add some products to get started
            </p>
            {user ? (
              <Button asChild className="bg-primary" onClick={closeCart}>
                <Link href="/products">Shop Now</Link>
              </Button>
            ) : (
              <Button
                onClick={() => {
                  closeCart();
                  if (typeof window !== "undefined") {
                    const event = new CustomEvent("open-login-modal");
                    window.dispatchEvent(event);
                  }
                }}
                className="bg-primary"
              >
                Shop Now
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item, idx) => (
                <div
                  key={`${String(item.id ?? "item")}-${idx}`}
                  className="flex items-center space-x-4"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={getProxyImageUrl(item.image) || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm text-foreground">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted">{item.category}</p>
                    <p className="font-bold text-sm text-primary">
                      {Number(item.price ?? 0).toFixed(2)} EGP
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() =>
                        handleDecrease(item.id, item.quantity, item.name)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1);
                        toast("Quantity increased");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-foreground">
                  Total:
                </span>
                <span className="text-xl font-bold text-primary">
                  {total.toFixed(2)} EGP
                </span>
              </div>
              <div>
                <Button className="w-full bg-primary" onClick={closeCart}>
                  <Link href="/checkout">Produce CheckOut</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
