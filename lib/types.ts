// lib/types.ts
// Type definitions for Gamestacks

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  walletBalance: number; // In kobo
  totalSpent: number;
  gamesPurchased: number;
  rating: number;
  totalRatings: number;
  country: string;
  phoneNumber: string | null;
  whatsappNumber: string | null;
  preferredDeliveryMethod: "digital" | "home";
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  /** "game" | "console" | "gamepad" | "disc" | "game-key" | "accessory" */
  itemType: string;
  category: string;
  platform: string | null;
  deliveryType: string | null;
  region: string | null;
  genres: string[];
  developerName: string | null;
  publisherName: string | null;
  priceNaira: number;
  originalPriceNaira: number | null;
  /** Active sale price in naira — null means not on sale */
  salePrice: number | null;
  discountPercentage: number;
  /** Total units sold — used for Best Sellers collection */
  totalSales: number;
  coverImageUrl: string | null;
  screenshotsUrls: string[];
  rating: number;
  totalRatings: number;
  downloadsCount: number;
  fileSizeGb: number | null;
  downloadLink: string | null;
  installationGuideUrl: string | null;
  systemRequirementsCpu: string | null;
  systemRequirementsRam: string | null;
  systemRequirementsGpu: string | null;
  systemRequirementsStorage: string | null;
  systemRequirementsOs: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isOffline: boolean;
  isNew: boolean;
  editorsChoice: boolean;
  comingSoon: boolean;
  staffPick: boolean;
  weekendDeal: boolean;
  releaseDate: string | null;
  createdAt: string;
  updatedAt: string;
  // snake_case aliases returned by mapGameToResponse
  price_naira?: number;
  cover_image_url?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
}

export interface HomepageSection {
  id: string;
  key: string;
  label: string;
  /** "automatic" | "curated" */
  type: string;
  isVisible: boolean;
  order: number;
  updatedAt: string;
}

export interface UserGame {
  id: string;
  userId: string;
  gameId: string;
  purchasedAt: string;
  licenseKey: string | null;
  deliveryMethod: "digital" | "home";
  deliveryStatus: "pending" | "delivered" | "played";
  isFavourite: boolean;
  hoursPlayed: number;
  userRating: number | null;
  userReview: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  gameId: string | null;
  orderId: string;
  amountNaira: number;
  amountKobo: number;
  paymentMethod: string;
  paystackReference: string | null;
  paystackAccessCode: string | null;
  paystackAuthUrl: string | null;
  status: "pending" | "success" | "failed" | "cancelled";
  transactionType: "game_purchase" | "wallet_topup" | "refund";
  description: string | null;
  metadata: Record<string, any>;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  itemsCount: number;
  subtotalNaira: number;
  transactionFeeNaira: number;
  totalNaira: number;
  customerEmail: string;
  customerPhone: string | null;
  customerWhatsapp: string | null;
  deliveryMethod: "digital" | "home";
  deliveryAddress: string | null;
  status: "pending" | "completed" | "delivered" | "cancelled";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  gameId: string;
  gameTitle: string;
  priceAtPurchase: number;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  gameId: string;
  rating: number; // 1-5
  title: string | null;
  content: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth-related types
export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

export interface PasswordResetInput {
  email: string;
}

export interface PasswordResetConfirmInput {
  token: string;
  newPassword: string;
}

// CartItem is defined in lib/cart-store.ts (canonical definition)
export type { CartItem } from "@/lib/cart-store";

export interface CheckoutData {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  deliveryMethod: "digital" | "home";
  deliveryAddress?: string;
  paymentMethod: "paystack" | "bank_transfer" | "flutterwave";
}
