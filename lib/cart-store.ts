// lib/cart-store.ts
// Cart state management using Zustand

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Game } from "@/lib/types";

export interface CartItem {
  gameId: string;
  game: Game;
  addedAt: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (game: Game) => void;
  removeItem: (gameId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (game: Game) => {
        set((state) => {
          // Prevent duplicates
          if (state.items.some((item) => item.gameId === game.id)) {
            return state;
          }

          return {
            items: [
              ...state.items,
              {
                gameId: game.id,
                game,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeItem: (gameId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.gameId !== gameId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.game.priceNaira;
          const sale = item.game.salePrice;
          const effective = (sale != null && sale > 0 && sale < price) ? sale : price;
          return total + effective;
        }, 0);
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "gamestacks-cart", // localStorage key
    },
  ),
);
