"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { cartService } from "@/services/cart.service";
import { ICartItem, SyncCartItemPayload } from "@/types/cart.types";
import { IProduct } from "@/types/product.types";

const LOCAL_STORAGE_KEY = "kache_cart";

export interface CartContextType {
  items: ICartItem[];
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoading: boolean;
  addToCart: (product: IProduct, quantity?: number) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const defaultContext: CartContextType = {
  items: [],
  cartCount: 0,
  subtotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  isLoading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
};

const CartContext = createContext<CartContextType>(defaultContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ICartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  // Helper to read items safely from localStorage
  const getLocalCart = useCallback((): ICartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  // Helper to save items safely to localStorage
  const saveLocalCart = useCallback((cartItems: ICartItem[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage:", err);
    }
  }, []);

  // Fetch or sync cart based on authentication state
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof hasHydrated !== "undefined" && !hasHydrated) return;

    let isMounted = true;

    const syncAndLoadCart = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          // Check for guest items to sync
          const localItems = getLocalCart();
          if (localItems.length > 0) {
            const syncPayload: SyncCartItemPayload[] = localItems.map((item) => ({
              productId: item.productId || item.product?.id || item.id,
              quantity: item.quantity || 1,
            }));

            try {
              await cartService.syncCart(syncPayload);
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } catch (syncErr) {
              console.error("Error syncing guest cart to backend:", syncErr);
            }
          }

          // Fetch fresh server cart
          const res = await cartService.getCart();
          if (isMounted && res?.success && res.data) {
            setItems(res.data.items || []);
          }
        } else {
          // Unauthenticated: load strictly from localStorage
          const localItems = getLocalCart();
          if (isMounted) {
            setItems(localItems);
          }
        }
      } catch (err) {
        console.error("Failed to load cart:", err);
        if (!isAuthenticated && isMounted) {
          setItems(getLocalCart());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    syncAndLoadCart();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, hasHydrated, getLocalCart]);

  // Derived: Total items count across quantities
  const cartCount = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [items]);

  // Derived: Subtotal calculation
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const price = item.unitPrice ?? item.product?.price ?? 0;
      const qty = item.quantity ?? 1;
      return acc + price * qty;
    }, 0);
  }, [items]);

  // Method: Remove from Cart (Declared before updateQuantity to avoid TDZ access)
  const removeFromCart = useCallback(
    async (id: string) => {
      try {
        if (isAuthenticated) {
          const res = await cartService.removeItem(id);
          if (res?.success && res.data) {
            setItems(res.data.items || []);
          } else {
            setItems((prev) => prev.filter((i) => i.id !== id && i.productId !== id));
          }
          toast.success("পণ্যটি কার্ট থেকে সরানো হয়েছে");
        } else {
          // Guest Cart: LocalStorage
          const currentItems = getLocalCart();
          const filtered = currentItems.filter((i) => i.id !== id && i.productId !== id);
          saveLocalCart(filtered);
          setItems(filtered);
          toast.success("পণ্যটি কার্ট থেকে সরানো হয়েছে");
        }
      } catch (err: unknown) {
        console.error("Remove from cart error:", err);
        toast.error("কার্ট থেকে সরানো যায়নি");
      }
    },
    [isAuthenticated, getLocalCart, saveLocalCart]
  );

  // Method: Update Quantity
  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(id);
        return;
      }

      try {
        if (isAuthenticated) {
          const res = await cartService.updateQuantity(id, quantity);
          if (res?.success && res.data) {
            setItems(res.data.items || []);
          } else {
            // Optimistic update fallback
            setItems((prev) =>
              prev.map((i) =>
                i.id === id || i.productId === id
                  ? {
                      ...i,
                      quantity,
                      itemSubtotal: (i.unitPrice || i.product?.price || 0) * quantity,
                    }
                  : i
              )
            );
          }
        } else {
          // Guest Cart: LocalStorage
          const currentItems = getLocalCart();
          const updatedItems = currentItems.map((item) => {
            if (item.id === id || item.productId === id) {
              const unitPrice = item.unitPrice || item.product?.price || 0;
              return {
                ...item,
                quantity,
                itemSubtotal: unitPrice * quantity,
              };
            }
            return item;
          });

          saveLocalCart(updatedItems);
          setItems(updatedItems);
        }
      } catch (err: unknown) {
        console.error("Update quantity error:", err);
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error?.response?.data?.message || "পরিমাণ পরিবর্তন করা যায়নি");
      }
    },
    [isAuthenticated, getLocalCart, saveLocalCart, removeFromCart]
  );

  // Method: Add to Cart
  const addToCart = useCallback(
    async (product: IProduct, quantity: number = 1) => {
      // 1. Self-Purchase Guard
      const sellerId = product.sellerId || product.seller?.id;
      if (user?.id && sellerId && user.id === sellerId) {
        toast.error("নিজের পণ্য কার্টে যোগ করা যাবে না");
        return;
      }

      setIsLoading(true);
      try {
        if (isAuthenticated) {
          const res = await cartService.addToCart(product.id, quantity);
          if (res?.success && res.data) {
            setItems(res.data.items || []);
            toast.success("পণ্যটি কার্টে যোগ করা হয়েছে");
            setIsCartOpen(true);
          } else {
            toast.error(res?.message || "কার্টে যোগ করা যায়নি");
          }
        } else {
          // Guest Cart: LocalStorage
          const currentItems = getLocalCart();
          const existingIndex = currentItems.findIndex(
            (i) => i.productId === product.id || i.product?.id === product.id
          );

          let updatedItems: ICartItem[];
          if (existingIndex > -1) {
            updatedItems = [...currentItems];
            const existingItem = updatedItems[existingIndex];
            const newQty = (existingItem.quantity || 1) + quantity;
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: newQty,
              itemSubtotal: (existingItem.unitPrice || product.price) * newQty,
            };
          } else {
            const newItem: ICartItem = {
              id: product.id,
              productId: product.id,
              quantity,
              unitPrice: product.price,
              itemSubtotal: product.price * quantity,
              product,
            };
            updatedItems = [...currentItems, newItem];
          }

          saveLocalCart(updatedItems);
          setItems(updatedItems);
          toast.success("পণ্যটি কার্টে যোগ করা হয়েছে");
          setIsCartOpen(true);
        }
      } catch (err: unknown) {
        console.error("Add to cart error:", err);
        const error = err as { response?: { data?: { message?: string } } };
        const msg = error?.response?.data?.message || "কার্টে যোগ করতে সমস্যা হয়েছে";
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, user, getLocalCart, saveLocalCart]
  );

  // Method: Clear Cart
  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await cartService.clearCart();
      } else {
        if (typeof window !== "undefined") {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      setItems([]);
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  }, [isAuthenticated]);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      cartCount,
      subtotal,
      isCartOpen,
      setIsCartOpen,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      items,
      cartCount,
      subtotal,
      isCartOpen,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    return defaultContext;
  }
  return context;
};

export default CartContext;
