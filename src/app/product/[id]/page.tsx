// src/app/product/[id]/page.tsx - 最終版
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  ShoppingCart, 
  CreditCard,
  Truck,
  Shield,
  Store,
  Award,
  AlertCircle,
  MapPin,
  Calendar,
  ThumbsUp
} from 'lucide-react'
import { ProductDetail, Store as StoreType } from '@/lib/types'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('price')

  const productId = params.id as string

  useEffect(() => {
    if (productId) {
      fetchProductDetail(productId)
    }
  }, [productId])

  const fetchProductDetail = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      console.log(`🔍 商品詳細取得開始: ${id}`)
      
      const response = await fetch(`/api/product/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch product details')
      }

      if (data.success) {
        setProduct(data.data.product)
        console.log(`✅ 商品詳細取得完了:`, data.data.product.name)
      } else {
        throw new Error(data.error?.message || 'Product not found')
      }
    } catch (err) {
      console.error('Product detail fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sortedStores = product?.stores ? [...product.stores].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'rating':
        return (b.storeInfo.rating || 0) - (a.storeInfo.rating || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  }) : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="loading-spinner h-12 w-12 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                商品詳細を読み込み中...
              </h2>
              <p className="text-gray-600">
                価格比較データを取得しています
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                商品詳細の取得に失敗しました
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => fetchProductDetail(productId)}
                  className="btn-primary px-6 py-2 rounded-md text-sm font-medium"
                >
                  再試行
                </button>
                <button
                  onClick={() => router.back()}
                  className="btn-secondary px-6 py-2 rounded-md text-sm font-medium"
                >
                  戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ブレッドクラム */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-500 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            検索結果に戻る
          </button>
          <nav className="text-sm text-gray-600">
            <a href="/" className="hover:text-gray-900">ホーム</a>
            <span className="mx-2">/</span>
            <a href="/results" className="hover:text-gray-900">検索結果</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 商品基本情報 */}
      <div className="bg-white border-b">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 商品画像 */}
            <div className="flex justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                />
              ) : (
                <div className="w-96 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-24 w-24 text-gray-400" />
                  <div className="ml-4 text-gray-500">
                    <p className="text-lg font-medium">画像なし</p>
                    <p className="text-sm">商品画像を読み込めませんでした</p>
                  </div>
                </div>
              )}
            </div>

            {/* 商品詳細情報 */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* 価格情報 */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium text-gray-700">最安価格</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(product.priceRange.min)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>価格帯:</span>
                    <span>{formatPrice(product.priceRange.min)} ～ {formatPrice(product.priceRange.max)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>比較店舗数:</span>
                    <span className="font-medium text-blue-600">{product.priceRange.storeCount}店舗</span>
                  </div>
                </div>
              </div>

              {/* 評価情報 */}
              {product.review && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium ml-2">
                      {product.review.averageRating}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({product.review.reviewCount}件のレビュー)
                    </span>
                  </div>
                </div>
              )}

              {/* ランキング情報 */}
              {product.rankings && product.rankings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    売れ筋ランキング
                  </h3>
                  <div className="space-y-2">
                    {product.rankings.map((ranking, index) => (
                      <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded min-w-[50px] text-center">
                          {ranking.rank}位
                        </span>
                        <span className="ml-3 text-gray-700">{ranking.categoryName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* メーカー情報 */}
              {product.maker && (
                <div className="border rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">メーカー情報</h3>
                  <p className="text-gray-700 mb-2 text-lg">{product.maker}</p>
                  {product.makerProductUrl && (
                    <a
                      href={product.makerProductUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      メーカー製品ページ
                    </a>
                  )}
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex items-center space-x-4">
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-6 py-3 rounded-md font-medium inline-flex items-center"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  価格.comで見る
                </a>
                {/* <button
                  className="btn-secondary px-6 py-3 rounded-md font-medium inline-flex items-center"
                > */}
                  {/* <Star className="h-5 w-5 mr-2" /> */}
                  {/* お気に入り */}
                {/* </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 価格比較テーブル */}
      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">店舗別価格比較</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">並び替え:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'price' | 'rating' | 'name')}
                  className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price">価格の安い順</option>
                  <option value="rating">評価の高い順</option>
                  <option value="name">店舗名順</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {sortedStores.length}店舗の価格を比較しています
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">順位</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">価格</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">送料</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">在庫</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">店舗情報</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">支払方法</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedStores.length > 0 ? (
                  sortedStores.map((store, index) => (
                    <StoreRow key={store.id} store={store} rank={index + 1} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      店舗情報が見つかりませんでした
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 商品情報フッター */}
      <div className="bg-white border-t">
        <div className="container-custom py-6">
          <div className="text-center text-sm text-gray-600">
            <p>データ取得日時: {formatDate(product.scrapedAt)}</p>
            <p className="mt-1">価格は変動する可能性があります。最新の価格は各店舗でご確認ください。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 店舗行コンポーネント
function StoreRow({ store, rank }: { store: StoreType; rank: number }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* 順位 */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
          rank === 1 ? 'bg-red-100 text-red-800' :
          rank === 2 ? 'bg-orange-100 text-orange-800' :
          rank === 3 ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {rank}位
        </span>
      </td>

      {/* 価格 */}
      <td className="px-6 py-4">
        <div className="text-lg font-bold text-gray-900">
          {formatPrice(store.price)}
        </div>
        {rank === 1 && (
          <span className="text-xs text-red-600 font-medium">最安</span>
        )}
      </td>

      {/* 送料 */}
      <td className="px-6 py-4">
        <div className={`text-sm font-medium ${
          store.shipping.isFree ? 'text-green-600' : 'text-gray-900'
        }`}>
          {store.shipping.isFree ? (
            <span className="inline-flex items-center">
              <Truck className="h-4 w-4 mr-1" />
              無料
            </span>
          ) : (
            formatPrice(store.shipping.cost)
          )}
        </div>
        {store.shipping.description && (
          <div className="text-xs text-gray-500 mt-1">
            {store.shipping.description}
          </div>
        )}
      </td>

      {/* 在庫 */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <span className={`text-sm font-medium ${
            store.stock.available ? 'text-green-600' : 'text-red-600'
          }`}>
            {store.stock.available ? '○' : '×'}
          </span>
          {store.stock.hasStorePickup && (
            <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
              店頭可
            </span>
          )}
        </div>
        {store.stock.description && (
          <div className="text-xs text-gray-500 mt-1">
            {store.stock.description}
          </div>
        )}
      </td>

      {/* 店舗情報 */}
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900 mb-1">{store.name}</div>
          <div className="text-sm text-gray-500 space-y-1">
            {store.storeInfo.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {store.storeInfo.location}
              </div>
            )}
            {store.storeInfo.yearsInBusiness && (
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                営業{store.storeInfo.yearsInBusiness}年
              </div>
            )}
            {store.storeInfo.rating && (
              <div className="flex items-center">
                <ThumbsUp className="h-3 w-3 mr-1" />
                <span className="text-green-600 font-medium">
                  {store.storeInfo.rating}%
                </span>
                {store.storeInfo.reviewCount && (
                  <span className="ml-1">({store.storeInfo.reviewCount}件)</span>
                )}
              </div>
            )}
          </div>
          {store.storeInfo.comment && (
            <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
              {store.storeInfo.comment}
            </div>
          )}
        </div>
      </td>

      {/* 支払方法 */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {store.paymentMethods.creditCard && (
            <PaymentBadge icon={<CreditCard className="h-3 w-3" />} text="カード" />
          )}
          {store.paymentMethods.cashOnDelivery && (
            <PaymentBadge text="代引" />
          )}
          {store.paymentMethods.bankTransfer && (
            <PaymentBadge text="振込" />
          )}
          {store.paymentMethods.convenience && (
            <PaymentBadge text="コンビニ" />
          )}
        </div>
      </td>

      {/* アクション */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <a
            href={store.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-3 py-1 rounded text-sm inline-flex items-center"
          >
            <Store className="h-4 w-4 mr-1" />
            購入
          </a>
          {store.hasWarrantyExtension && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <Shield className="h-3 w-3 inline mr-1" />
              延長保証
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

// 支払方法バッジコンポーネント
function PaymentBadge({ icon, text }: { icon?: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
      {icon && <span className="mr-1">{icon}</span>}
      {text}
    </span>
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