// lib/types.ts - 型定義ファイル

/**
 * 商品情報の型定義
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  shop: string;
  rating?: number;
  imageUrl?: string;
  productUrl: string;
  category?: string;
  scrapedAt: string;
  source?: 'kakaku' | 'test';
}

/**
 * 検索フィルターの型定義（ページネーション対応）
 */
export interface SearchFilters {
  keyword: string;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';
  page?: number; // 🔥 ページ番号追加
}

/**
 * API レスポンスの型定義
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    processingTime: number;
    version: string;
  };
}

/**
 * スクレイピングエラーの型定義
 */
export interface ScrapingError {
  code: string;
  message: string;
  timestamp: string;
  retryable: boolean;
}

/**
 * robots.txt情報の型定義
 */
export interface RobotsInfo {
  allowed: boolean;
  disallowedPaths: string[];
  crawlDelay?: number;
  sitemapUrls: string[];
}

/**
 * レート制限設定の型定義
 */
export interface RateLimitConfig {
  requests: number;      // 時間窓内の最大リクエスト数
  windowMs: number;      // 時間窓（ミリ秒）
  maxConcurrent: number; // 同時実行可能な最大リクエスト数
  minDelay: number;      // 最小遅延時間（ミリ秒）
}

/**
 * 検索結果情報の型定義（ページネーション情報追加）
 */
export interface SearchResultInfo {
  keyword: string;
  totalFound: number;
  searchTime: number;
  source: string;
  scraperVersion: string;
  currentPage?: number;    // 🔥 現在ページ追加
  totalPages?: number;     // 🔥 総ページ数追加
  itemsPerPage?: number;   // 🔥 1ページあたりの件数追加
}

/**
 * 拡張検索結果の型定義
 */
export interface ExtendedSearchResult {
  products: Product[];
  searchInfo: SearchResultInfo;
  errors?: string[];
  warnings?: string[];
  pagination?: {           // 🔥 ページネーション情報
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    itemsPerPage: number;
  };
}

/**
 * Google Sheets連携用の型定義
 */
export interface SheetsConfig {
  spreadsheetId: string;
  worksheetTitle: string;
  serviceAccountEmail?: string;
  privateKey?: string;
}

/**
 * データ分析用の型定義
 */
export interface PriceAnalysis {
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  priceDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  shopAnalysis: Array<{
    shop: string;
    productCount: number;
    averagePrice: number;
    averageRating?: number;
  }>;
}

/**
 * エクスポート設定の型定義
 */
export interface ExportConfig {
  format: 'csv' | 'excel' | 'json';
  includeImages: boolean;
  includeRatings: boolean;
  customFields?: string[];
  filename?: string;
}

/**
 * 統計情報の型定義
 */
export interface ScrapingStats {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  successRate: number;
  averageResponseTime: number;
  topKeywords: Array<{
    keyword: string;
    count: number;
  }>;
  recentErrors: string[];
}

/**
 * ページネーション用のヘルパー型
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  totalItems: number;
  totalPages: number;
}

/**
 * 検索履歴の型定義
 */
export interface SearchHistory {
  id: string;
  keyword: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: string;
  executionTime: number;
}

/**
 * ユーザー設定の型定義
 */
export interface UserPreferences {
  defaultSortBy: SearchFilters['sortBy'];
  defaultMaxResults: number;
  preferredViewMode: 'grid' | 'list';
  autoRefreshInterval?: number;
  notificationSettings: {
    priceAlerts: boolean;
    newProductAlerts: boolean;
    emailNotifications: boolean;
  };
}

// 🔥 型ガード関数
export function isValidProduct(obj: unknown): obj is Product {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Product).id === 'string' &&
    typeof (obj as Product).name === 'string' &&
    typeof (obj as Product).price === 'number' &&
    typeof (obj as Product).shop === 'string' &&
    typeof (obj as Product).productUrl === 'string'
  );
}

export function isValidSearchFilters(obj: unknown): obj is SearchFilters {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as SearchFilters).keyword === 'string' &&
    (obj as SearchFilters).keyword.length > 0
  );
}

// 🔥 デフォルト値定数
export const DEFAULT_SEARCH_FILTERS: Required<SearchFilters> = {
  keyword: '',
  maxResults: 40,
  minPrice: 0,
  maxPrice: 999999999,
  sortBy: 'price_asc',
  page: 1
};

export const DEFAULT_PAGINATION: PaginationParams = {
  page: 1,
  limit: 40,
  offset: 0,
  totalItems: 0,
  totalPages: 1
};

// 🔥 エラーコード定数
export const ERROR_CODES = {
  INVALID_KEYWORD: 'INVALID_KEYWORD',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  ROBOTS_RESTRICTION: 'ROBOTS_RESTRICTION',
  RATE_LIMITED: 'RATE_LIMITED',
  INVALID_PAGE: 'INVALID_PAGE',
  PARSING_ERROR: 'PARSING_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// lib/types.ts に追加する型定義

// 既存のProduct型を拡張
export interface ProductDetail extends Product {
  // 基本情報
  maker?: string;
  makerProductUrl?: string;
  specifications?: Record<string, string>;
  description?: string;
  
  // 価格関連
  priceRange: {
    min: number;
    max: number;
    storeCount: number;
  };
  
  // 店舗別価格情報
  stores: Store[];
  
  // 評価・レビュー
  review?: {
    averageRating: number;
    reviewCount: number;
    satisfactionRating?: number;
  };
  
  // ランキング情報
  rankings?: Ranking[];
}

export interface Store {
  id: string;
  name: string;
  price: number;
  rank?: number; // 価格順位
  shipping: {
    cost: number;
    isFree: boolean;
    description?: string;
  };
  stock: {
    available: boolean;
    description: string;
    hasStorePickup?: boolean;
  };
  paymentMethods: {
    creditCard: boolean;
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    convenience: boolean;
    kakakuPay?: boolean;
  };
  storeInfo: {
    location?: string;
    yearsInBusiness?: number;
    rating?: number; // 店舗評価(%)
    reviewCount?: number;
    comment?: string;
  };
  productUrl: string;
  hasWarrantyExtension?: boolean;
}

export interface Ranking {
  categoryName: string;
  categoryUrl: string;
  rank: number;
}

// API レスポンス型
export interface ProductDetailResponse {
  success: boolean;
  data?: {
    product: ProductDetail;
    searchInfo: {
      scrapedAt: string;
      source: string;
      processingTime: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

