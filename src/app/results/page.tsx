// src/app/results/page.tsx - 修正版（スクレイピング状況とエクスポート制限対応）
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Star, 
  TrendingUp,
  Grid, 
  List,
  AlertCircle,
  Clock,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Table,
  Upload,
  Settings,
  Shield,
  Zap,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react'
import { Product } from '@/lib/types'
import { ExportButton } from '@/components/results/ExportButton'
import { QuickExport } from '@/components/results/QuickExport'
import { saveSearchResults } from '@/lib/lib/sheets/export-helpers'

interface SearchResult {
  products: Product[]
  searchInfo: {
    keyword: string
    totalFound: number
    searchTime: number
    source: string
    currentPage?: number
    totalPages?: number
  }
  errors?: string[]
  warnings?: string[]
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('price_asc')
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [showExportRestriction, setShowExportRestriction] = useState(false)
    const [showAnalysis, setShowAnalysis] = useState(false)
    
  const handleAnalysis = () => {
    setShowAnalysis(true);
    setTimeout(() => setShowAnalysis(false), 5000);
  };
  

  // URLパラメータから検索条件取得
  const keyword = searchParams.get('q') || ''
  const initialMinPrice = searchParams.get('minPrice') || ''
  const initialMaxPrice = searchParams.get('maxPrice') || ''
  const initialSortBy = searchParams.get('sort') || 'price_asc'
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)

  const performSearch = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 検索実行: キーワード="${keyword}", ページ=${page}`);
      
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          minPrice: initialMinPrice ? parseInt(initialMinPrice) : undefined,
          maxPrice: initialMaxPrice ? parseInt(initialMaxPrice) : undefined,
          sortBy: initialSortBy,
          maxResults: 40,
          page: page,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Search failed');
      }

      if (data.success) {
        console.log(`✅ 検索成功: ${data.data.products.length}件取得`);
        
        const searchInfo = {
          ...data.data.searchInfo,
          currentPage: page,
          totalPages: Math.ceil(data.data.searchInfo.totalFound / 40)
        };
        
        const newResults = {
          ...data.data,
          searchInfo
        };
        
        setResults(newResults);
        setCurrentPage(page);
        setSortBy(initialSortBy);
        setPriceFilter({ min: initialMinPrice, max: initialMaxPrice });
        
        // 検索結果をローカルストレージに保存（エクスポート用）
        saveSearchResults(data.data.products);
        
      } else {
        throw new Error(data.error?.message || 'Search was not successful');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [keyword, initialMinPrice, initialMaxPrice, initialSortBy]);

  useEffect(() => {
    if (keyword) {
      performSearch(pageFromUrl);
    }
  }, [keyword, pageFromUrl, performSearch]);

  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());
    router.push(url.pathname + url.search);
  };

  const handleSort = (newSortBy: string) => {
    if (!results) return

    setSortBy(newSortBy)
    const sortedProducts = [...results.products].sort((a, b) => {
      switch (newSortBy) {
        case 'price_asc':
          return a.price - b.price
        case 'price_desc':
          return b.price - a.price
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0)
        case 'name_asc':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    const updatedResults = {
      ...results,
      products: sortedProducts
    };
    
    setResults(updatedResults);
    
    // ソート後の結果も保存
    saveSearchResults(sortedProducts);
  }

  const filteredProducts = results?.products.filter(product => {
    const minPrice = priceFilter.min ? parseInt(priceFilter.min) : 0
    const maxPrice = priceFilter.max ? parseInt(priceFilter.max) : Infinity
    return product.price >= minPrice && product.price <= maxPrice
  }) || []

  // フィルター適用時も結果を更新
  useEffect(() => {
    if (filteredProducts.length > 0) {
      saveSearchResults(filteredProducts);
    }
  }, [filteredProducts]);

  // エクスポート成功通知
  const showExportNotification = (message: string) => {
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  // エクスポート制限通知（新規追加）
  const handleGoogleSheetsExport = () => {
    setShowExportRestriction(true);
    setTimeout(() => setShowExportRestriction(false), 5000);
  };

  // 商品IDを取得するヘルパー関数
  function getProductId(product: Product): string {
    if (product.id && product.id.startsWith('K')) {
      return product.id;
    }
    
    const match = product.productUrl.match(/\/item\/([^\/]+)\//);
    if (match && match[1]) {
      return match[1];
    }
    
    return product.id;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                価格情報を検索中...
              </h2>
              <p className="text-gray-600">
                「{keyword}」のページ{currentPage}を取得しています
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                検索エラーが発生しました
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => performSearch(currentPage)}
                  className="btn-primary px-6 py-2 rounded-md text-sm font-medium"
                >
                  再試行
                </button>
                <a
                  href="/"
                  className="btn-secondary px-6 py-2 rounded-md text-sm font-medium"
                >
                  新しい検索
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!results || filteredProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                検索結果が見つかりませんでした
              </h2>
              <p className="text-gray-600 mb-6">
                「{keyword}」のページ{currentPage}に一致する商品が見つかりませんでした。
              </p>
              <a
                href="/"
                className="btn-primary px-6 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                新しい検索
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エクスポート成功通知 */}
      {showExportSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            エクスポートが完了しました
          </div>
        </div>
      )}

      {/* エクスポート制限通知（新規追加） */}
      {showExportRestriction && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded shadow-lg max-w-sm">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Google Sheets連携制限</p>
              <p className="mt-1">現在、特定ユーザーのスプレッドシートのみに制限を設けています。</p>
            </div>
          </div>
        </div>
      )}

            {/* 分析画面停止中 */}
      {showAnalysis && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded shadow-lg max-w-sm">
          <div className="flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">分析画面 更新中</p>
              <p className="mt-1">現在、分析画面の更新中のため特定ユーザーのみアクセスできます。</p>
            </div>
          </div>
        </div>
      )}


      {/* 検索結果ヘッダー */}
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                「{results.searchInfo.keyword}」の検索結果
              </h1>
              <div className="flex items-center text-sm text-gray-600 space-x-4">
                <span className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {filteredProducts.length}件の商品
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {results.searchInfo.searchTime}ms
                </span>
                <span className="flex items-center font-medium">
                  ページ {results.searchInfo.currentPage} / {results.searchInfo.totalPages || 1}
                </span>
                <span className="flex items-center">
                  データソース: {results.searchInfo.source}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* クイックエクスポート */}
              <div className="flex items-center space-x-2">
                {/* <QuickExport products={filteredProducts} /> */}
                
                {/* Google Sheets ボタン（制限付き） */}
                <button
                  onClick={handleGoogleSheetsExport}
                  className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="現在制限中のため使用できません"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Sheets
                </button>
              </div>
              
              {/* フルエクスポートボタン（修正版） */}
              <ExportButton 
                products={filteredProducts} 
                onGoogleSheetsClick={handleGoogleSheetsExport}
              />
              
              <div
                onClick={handleAnalysis}
                className="btn-primary px-4 py-2 rounded-md text-sm font-medium inline-flex items-center hover:cursor-pointer"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                分析画面
              </div>
              
              <a
                href="/sheets"
                className="btn-secondary px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                連携設定
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* フィルター・ソートコントロール */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">フィルター:</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="最低価格"
                  value={priceFilter.min}
                  onChange={(e) => setPriceFilter(prev => ({ ...prev, min: e.target.value }))}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="最高価格"
                  value={priceFilter.max}
                  onChange={(e) => setPriceFilter(prev => ({ ...prev, max: e.target.value }))}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="price_asc">価格: 安い順</option>
                <option value="price_desc">価格: 高い順</option>
                <option value="rating_desc">評価: 高い順</option>
                <option value="name_asc">名前: A-Z順</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">表示:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* エクスポート案内バー（修正版） */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-blue-800">
              <Download className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {filteredProducts.length}件のデータをエクスポート可能
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-blue-700">
                <FileText className="h-3 w-3 mr-1" />
                CSV/Excel
              </span>
              <span className="flex items-center text-gray-500">
                <Table className="h-3 w-3 mr-1" />
                Google Sheets（制限中）
              </span>
              <span className="flex items-center text-purple-700">
                <Settings className="h-3 w-3 mr-1" />
                JSON
              </span>
            </div>
          </div>
        </div>
      </div>

  {/* 安全スクレイピング情報表示（環境制約説明付き修正版） */}
      {results.warnings && results.warnings.length > 0 && (
        <div className="space-y-3">
          {/* デプロイ環境制約の説明 */}
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="container-custom">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-orange-700 space-y-2">
                      <p>
                        もし現在、サンプルデータが表示されている場合、デプロイ環境のシステムライブラリ更新またはお使いの実行環境により、
                        スクレイピング処理が正常に動作していない可能性があります。(環境設定の微修正要)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* 通常の安全スクレイピング情報 */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="container-custom">
              <div className="flex">
                <Shield className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-green-800 flex items-center">
                    <Zap className="h-4 w-4 mr-1" />
                    安全スクレイピング実行状況：遅延ローディング実施のため処理設定/各サイトではより高速化が可能
                  </h3>
                  <ul className="mt-1 text-sm text-green-700 space-y-1">
                    {results.warnings.map((warning, index) => {
                      // フォールバック関連の警告は除外（上で説明済み）
                      if (warning.includes('フォールバック') || warning.includes('テストデータ') || warning.includes('Speed エラー')) {
                        return null;
                      }

                      // 警告メッセージを安全性とパフォーマンス情報に変換
                      if (warning.includes('目標達成') || warning.includes('秒')) {
                        return (
                          <li key={index} className="flex items-center">
                            <Zap className="h-3 w-3 mr-2 text-green-600" />
                            ⚡ 高速処理完了: {warning}
                          </li>
                        );
                      }
                      
                      return (
                        <li key={index} className="flex items-center">
                          <ImageIcon className="h-3 w-3 mr-2 text-green-600" />
                          📡 安全なページ情報・画像遅延ローディングを実施・取得中: {warning}
                        </li>
                      );
                    })}
                    <li className="flex items-center mt-2">
                      <Shield className="h-3 w-3 mr-2 text-green-600" />
                      🚀 より高速化が可能: キャッシュ・並列処理により更なる高速化に対応可能
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 商品一覧 */}
      <div className="container-custom py-8">
        {viewMode === 'grid' ? (
          <div className="grid-responsive">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} getProductId={getProductId} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductListItem key={product.id} product={product} getProductId={getProductId} />
            ))}
          </div>
        )}
      </div>

      {/* ページネーション */}
      {results.searchInfo.totalPages && results.searchInfo.totalPages > 1 && (
        <div className="bg-white border-t">
          <div className="container-custom py-6">
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                前へ
              </button>

              {Array.from({ length: Math.min(results.searchInfo.totalPages, 10) }, (_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              {results.searchInfo.totalPages > 10 && (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= (results.searchInfo.totalPages || 1)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600">
              {filteredProducts.length}件の商品を表示中 (ページ {currentPage} / {results.searchInfo.totalPages})
            </div>
          </div>
        </div>
      )}

      {/* エクスポート機能説明セクション（修正版） */}
      <div className="bg-gray-100 border-t">
        <div className="container-custom py-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">データエクスポート機能</h3>
            <p className="text-gray-600">検索結果を様々な形式でエクスポートして業務に活用できます</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center opacity-60">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Table className="h-6 w-6 text-gray-500" />
              </div>
              <h4 className="font-medium text-gray-700 mb-1">Google Sheets</h4>
              <p className="text-sm text-gray-500">現在制限中</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Excel CSV</h4>
              <p className="text-sm text-gray-600">Excel直接対応・文字化け防止</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-gray-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">標準CSV</h4>
              <p className="text-sm text-gray-600">汎用形式・軽量ファイル</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">JSON</h4>
              <p className="text-sm text-gray-600">API連携・プログラム処理用</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a
              href="/sheets"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              詳細設定・連携ページへ
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// 商品カードコンポーネント（エクスポート対応版）
function ProductCard({ product, getProductId }: { product: Product; getProductId: (product: Product) => string }) {
  const [imageError, setImageError] = useState(false);
  const productId = getProductId(product);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg overflow-hidden">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={() => {
              console.log(`❌ 画像読み込みエラー: ${product.imageUrl}`);
              setImageError(true);
            }}
            onLoad={() => {
              console.log(`✅ 画像読み込み成功: ${product.imageUrl}`);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">画像なし</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-2">
          <span className="price-highlight">
            {formatPrice(product.price)}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {product.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="shop-badge">
            {product.shop}
          </span>
          {product.category && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {product.category}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <Link
            href={`/product/${productId}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium inline-flex items-center justify-center transition-colors duration-200"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            価格比較を見る
          </Link>
          
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm font-medium inline-flex items-center justify-center transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            価格.comで見る
          </a>
        </div>
      </div>
    </div>
  )
}

// 商品リストアイテムコンポーネント（エクスポート対応版）
function ProductListItem({ product, getProductId }: { product: Product; getProductId: (product: Product) => string }) {
  const [imageError, setImageError] = useState(false);
  const productId = getProductId(product);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 object-cover rounded"
              onError={() => {
                console.log(`❌ 画像読み込みエラー: ${product.imageUrl}`);
                setImageError(true);
              }}
              onLoad={() => {
                console.log(`✅ 画像読み込み成功: ${product.imageUrl}`);
              }}
            />
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-4 mb-2">
            <span className="price-highlight">
              {formatPrice(product.price)}
            </span>
            {product.rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}
            <span className="shop-badge">
              {product.shop}
            </span>
            {product.category && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {product.category}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                取得日時: {formatDate(product.scrapedAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link
                href={`/product/${productId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium inline-flex items-center transition-colors duration-200"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                価格比較
              </Link>
              
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 px-4 py-2 rounded text-sm font-medium inline-flex items-center transition-colors duration-200"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                詳細
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ユーティリティ関数
function formatPrice(price: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(price)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}