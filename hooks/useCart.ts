// hooks/useCart.ts
// Custom hook for cart operations

import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/utils";

export function useCart() {
  // Select primitives/slices individually to avoid re-renders when unrelated
  // parts of the store change
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const totalPrice = getTotalPrice();
  const itemCount = getItemCount();

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    getItemCount,
    totalPrice,
    itemCount,
    totalPriceFormatted: formatNaira(totalPrice),
  };
}
