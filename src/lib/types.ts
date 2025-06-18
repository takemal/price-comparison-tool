// lib/types.ts - 型定義修正版

// 基本商品型
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
  source: 'kakaku' | 'other';
}

// 🔧 修正: 商品詳細型（拡張プロパティ追加）
export interface ProductDetail extends Product {
  maker?: string;
  makerProductUrl?: string;
  priceRange: {
    min: number;
    max: number;
    storeCount: number;
  };
  stores: Store[];
  review?: {
    averageRating: number;
    reviewCount: number;
  };
  rankings?: Ranking[];
}

// 店舗情報型
export interface Store {
  id: string;
  name: string;
  price: number;
  rank?: number;
  shipping: {
    cost: number;
    isFree: boolean;
    description: string;
  };
  stock: {
    available: boolean;
    description: string;
    hasStorePickup: boolean;
  };
  paymentMethods: {
    creditCard: boolean;
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    convenience: boolean;
  };
  storeInfo: {
    location?: string;
    yearsInBusiness?: number;
    rating?: number;
    reviewCount?: number;
    comment?: string;
  };
  productUrl: string;
  hasWarrantyExtension: boolean;
}

// ランキング情報型
export interface Ranking {
  categoryName: string;
  categoryUrl: string;
  rank: number;
}

// 検索フィルター型
export interface SearchFilters {
  keyword: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';
  maxResults?: number;
  category?: string;
}

// スクレイピングエラー型
export interface ScrapingError {
  code: string;
  message: string;
  timestamp: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

// 🔧 修正: 拡張エラー型（details追加）
export interface ExtendedError {
  code: string;
  message: string;
  details?: {
    timestamp?: string;
    processingTime?: number;
    environment?: string;
    [key: string]: unknown;
  };
}

// robots.txt情報型
export interface RobotsInfo {
  allowed: boolean;
  disallowedPaths: string[];
  crawlDelay?: number;
  sitemapUrls: string[];
}

// レート制限設定型
export interface RateLimitConfig {
  requests: number;
  windowMs: number;
  maxConcurrent: number;
  minDelay: number;
}

// 🔧 修正: 拡張検索情報型（vercelOptimized等追加）
export interface ExtendedSearchInfo {
  scrapedAt: string;
  source: string;
  processingTime: number;
  vercelOptimized?: boolean;
  environment?: string;
  imageSuccessRate?: number;
  keyword?: string;
  totalFound?: number;
  searchTime?: number;
}

// 🔧 修正: 商品詳細レスポンス型（拡張対応）
export interface ProductDetailResponse {
  success: boolean;
  data?: {
    product: ProductDetail;
    searchInfo: ExtendedSearchInfo;
  };
  error?: ExtendedError;
  meta?: {
    timestamp: string;
    processingTime: number;
    version: string;
  };
}

// 基本APIレスポンス型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ExtendedError;
  meta?: {
    timestamp: string;
    processingTime: number;
    version: string;
  };
}

// 検索結果レスポンス型
export interface SearchResponse {
  success: boolean;
  data?: {
    products: Product[];
    searchInfo: {
      keyword: string;
      totalFound: number;
      searchTime: number;
      source: string;
      vercelOptimized?: boolean;
      imageSuccessRate?: number;
      currentPage?: number;
      totalPages?: number;
    };
    performance?: {
      processingTime: number;
      withinVercelLimits?: boolean;
      environment?: string;
      averagePerProduct?: number;
      cacheHit?: boolean;
    };
    errors?: string[];
    warnings?: string[];
  };
  error?: ExtendedError;
  meta?: {
    timestamp: string;
    processingTime: number;
    version: string;
  };
}

// Google Sheets関連型
export interface SheetsConfig {
  spreadsheetId: string;
  worksheetTitle: string;
  mode: 'create' | 'append' | 'overwrite';
}

export interface SheetsResponse {
  success: boolean;
  data?: {
    spreadsheetId: string;
    url: string;
    exportedCount: number;
    mode: string;
    timestamp: string;
    spreadsheetTitle?: string;
  };
  error?: ExtendedError;
}

// エクスポート関連型
export interface ExportOptions {
  includeHeaders?: boolean;
  includeImages?: boolean;
  dateFormat?: 'iso' | 'japanese' | 'us';
  priceFormat?: 'number' | 'currency';
  filename?: string;
}

export interface ExportRequest {
  products: Product[];
  format: 'csv' | 'excel' | 'json';
  options?: ExportOptions;
}

// パフォーマンス統計型
export interface PerformanceStats {
  totalSearches: number;
  successfulSearches: number;
  averageDuration: number;
  averageProductCount: number;
  successRate: number;
  performance: 'excellent' | 'good' | 'needs_improvement';
}

// システム情報型
export interface SystemInfo {
  environment: string;
  nodeVersion: string;
  platform: string;
  version: string;
  chromiumSupport?: string;
  uptime?: number;
  memory?: NodeJS.MemoryUsage;
  vercelRegion?: string;
  timeZone?: string;
}

// ヘルスチェック型
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment?: {
    isVercel?: boolean;
    nodeVersion?: string;
    platform?: string;
    region?: string;
  };
  services?: {
    scraper?: string;
    chromium?: string;
    memory?: string;
    importer?: string;
    fallback?: string;
  };
  performance?: {
    responseTime: number;
    rating: 'excellent' | 'good' | 'slow' | 'error';
  };
  testResult?: {
    productsFound?: number;
    errorsCount?: number;
    warningsCount?: number;
  };
  limits?: {
    maxDuration?: string;
    recommendedDuration?: string;
    memoryLimit?: string;
  };
  error?: string;
}

// スクレイパー統計型
export interface ScraperStats {
  scraperVersion: string;
  environment?: SystemInfo | Record<string, unknown>;
  features?: string[];
  targetPerformance?: {
    totalTime?: string;
    imageSuccessRate?: string;
    fallbackReliability?: string;
  };
  typeScriptCompliance?: {
    strictMode?: boolean;
    errorsFree?: boolean;
    cheerioVersion?: string;
    nodeVersion?: string;
    cheerioCompatible?: boolean;
    anyTypeUsage?: string;
  };
  optimizations?: string[];
  fixes?: string[];
  speedImprovements?: string[];
}

// API統計型
export interface ApiStats {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  successRate: number;
  averageProcessingTime: number;
  topKeywords: Array<{
    keyword: string;
    count: number;
  }>;
  vercelOptimized?: boolean;
}

// 統計レスポンス型
export interface StatsResponse {
  success: boolean;
  data?: {
    scraperStats?: ScraperStats;
    apiStats?: ApiStats;
    performance?: PerformanceStats;
    systemInfo?: SystemInfo;
  };
  error?: ExtendedError;
}

// ユーティリティ型
export type SortOrder = 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';
export type ExportFormat = 'csv' | 'excel' | 'json';
export type DateFormat = 'iso' | 'japanese' | 'us';
export type PriceFormat = 'number' | 'currency';
export type ScraperSource = 'kakaku' | 'other';
export type Environment = 'development' | 'production' | 'vercel' | 'local';