// src/app/product/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  ExternalLink, 
  Star, 
  ShoppingCart, 
  CreditCard,
  Shield,
  Store,
  Award,
  AlertCircle,
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
      const response = await fetch(`/api/product/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch product details')
      }

      if (data.success) {
        setProduct(data.data.product)
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
              <button
                onClick={() => router.back()}
                className="btn-primary px-6 py-2 rounded-md text-sm font-medium"
              >
                戻る
              </button>
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
            className="flex items-center text-blue-600 hover:text-blue-500 mb-2"
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
                  <div>価格帯: {formatPrice(product.priceRange.min)} ～ {formatPrice(product.priceRange.max)}</div>
                  <div>{product.priceRange.storeCount}店舗での価格比較</div>
                </div>
              </div>

              {/* 評価情報 */}
              {product.review && (
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium ml-2">
                      {product.review.averageRating}
                    </span>
                    <span className="text-gray-600 ml-1">
                      ({product.review.reviewCount}件)
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
                      <div key={index} className="flex items-center">
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
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
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">メーカー情報</h3>
                  <p className="text-gray-700 mb-2">{product.maker}</p>
                  {product.makerProductUrl && (
                    <a
                      href={product.makerProductUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      メーカー製品ページ
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 価格比較テーブル */}
      <div className="container-custom py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">価格比較</h2>
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
                {sortedStores.map((store, index) => (
                  <StoreRow key={store.id} store={store} rank={index + 1} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// 店舗行コンポーネント
function StoreRow({ store, rank }: { store: StoreType; rank: number }) {
  return (
    <tr className="hover:bg-gray-50">
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
          {store.shipping.isFree ? '無料' : formatPrice(store.shipping.cost)}
        </div>
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
            <span className="ml-2 text-xs text-blue-600">店頭可</span>
          )}
        </div>
      </td>

      {/* 店舗情報 */}
      <td className="px-6 py-4">
        <div>
          <div className="font-medium text-gray-900">{store.name}</div>
          <div className="text-sm text-gray-500 space-y-1">
            {store.storeInfo.location && (
              <div>({store.storeInfo.location})</div>
            )}
            {store.storeInfo.yearsInBusiness && (
              <div>営業{store.storeInfo.yearsInBusiness}年</div>
            )}
            {store.storeInfo.rating && (
              <div className="flex items-center">
                <span className="text-green-600 font-medium">
                  {store.storeInfo.rating}%
                </span>
                <span className="ml-1">({store.storeInfo.reviewCount}件)</span>
              </div>
            )}
          </div>
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

function formatPrice(price: number) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(price)
}