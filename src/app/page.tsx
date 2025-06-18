'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, BarChart3, Download, AlertCircle } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'price_asc',
    maxResults: '20'
  })
  const [showAnalysis, setShowAnalysis] = useState(false)
    
  const handleAnalysis = () => {
    setShowAnalysis(true);
    setTimeout(() => setShowAnalysis(false), 5000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    
    try {
      // URLパラメータ構築
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        sort: filters.sortBy,
        maxResults: filters.maxResults
      })
      
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice)
      }
      
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice)
      }
      
      console.log('検索実行:', { searchQuery, filters, params: params.toString() })
      
      // 結果ページへリダイレクト
      router.push(`/results?${params.toString()}`)
      
    } catch (error) {
      console.error('検索エラー:', error)
      alert('検索中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickSearch = (keyword: string) => {
    setSearchQuery(keyword)
    // クイック検索は即座に実行
    const params = new URLSearchParams({
      q: keyword,
      sort: filters.sortBy,
      maxResults: filters.maxResults
    })
    
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice)
    }
    
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice)
    }
    
    router.push(`/results?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

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



      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              価格比較ツール
              <span className="block text-blue-600">Price Comparison</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              価格.comから商品情報を自動取得し、競合分析・価格調査を効率化。
              JavaScript + Python実装で高速かつ正確な価格比較を実現します。
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mt-10">
              <div className="mx-auto max-w-xl">
                <div className="flex gap-x-4">
                  <label htmlFor="search" className="sr-only">
                    商品を検索
                  </label>
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="search"
                      name="search"
                      type="text"
                      placeholder="商品名を入力（例: ノートパソコン、洗濯機、炊飯器）"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-md border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !searchQuery.trim()}
                    className="flex-none rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="loading-spinner h-4 w-4 mr-2"></div>
                        検索中...
                      </div>
                    ) : (
                      '検索'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Advanced Search Options */}
            <div className="mt-6 mx-auto max-w-2xl">
              <details className="group">
                <summary className="flex items-center justify-center cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  <Filter className="h-4 w-4 mr-2" />
                  詳細検索オプション
                  <svg className="ml-2 h-4 w-4 transform group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                
                <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        最低価格
                      </label>
                      <input
                        type="number"
                        placeholder="例: 10000"
                        value={filters.minPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        最高価格
                      </label>
                      <input
                        type="number"
                        placeholder="例: 100000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ソート順
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="price_asc">価格: 安い順</option>
                        <option value="price_desc">価格: 高い順</option>
                        <option value="rating_desc">評価: 高い順</option>
                        <option value="name_asc">名前: A-Z順</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        取得件数
                      </label>
                      <select
                        value={filters.maxResults}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxResults: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="20">20件</option>
                        <option value="40">40件</option>
                        <option value="60">60件 (2ページ)</option>
                        <option value="80">80件 (3ページ)</option>
                        <option value="100">100件 (複数ページ)</option>
                        <option value="200">200件 (多ページ)</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* 🔥 追加: 複数ページ取得の説明 */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          <strong>複数ページ対応:</strong> 40件以上を選択すると、複数ページから自動的にデータを取得します。
                          取得時間は件数に比例して長くなります（目安: 100件で約30秒）。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              主な機能
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              企業の競合分析から個人の買い物まで、あらゆる価格調査ニーズに対応
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Search className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  高速価格検索
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    価格.comから最新の商品情報を自動取得。JavaScript + Python両実装で安定した高速検索を実現。
                  </p>
                  <p className="mt-6">
                    <span className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                      使って見る <span aria-hidden="true">→</span>
                    </span>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <BarChart3 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  データ分析・可視化
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    価格分布、ショップ別比較、トレンド分析をグラフで可視化。競合調査レポートを自動生成。
                  </p>
                  <div className="mt-6">
                    <div onClick={handleAnalysis} className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500 hover:cursor-pointer">
                      分析機能を試す <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Download className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  多様なエクスポート
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    CSV/Excel/JSON形式でのダウンロード、Google Sheets自動連携で業務フローに統合。
                  </p>
                  <p className="mt-6">
                    <a href="/sheets" className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500">
                      連携設定 <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      {/* Popular Searches */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              人気の検索キーワード
            </h2>
            <p className="mt-4 text-gray-600">
              よく検索される商品カテゴリから選択
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              'ノートパソコン',
              '洗濯機',
              '炊飯器',
              'エアコン',
              'テレビ',
              'カメラ',
              'イヤホン',
              '冷蔵庫',
              'プリンター',
              'ゲーム機',
              'タブレット',
              '掃除機'
            ].map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleQuickSearch(keyword)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              技術スタック
            </h2>
            <p className="mt-4 text-gray-600">
              モダンな技術で構築された高性能価格比較ツール
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">JS</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">JavaScript</h3>
              <p className="mt-2 text-sm text-gray-600">
                Puppeteer + Cheerio<br />
                高速スクレイピング
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold">PY</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Python</h3>
              <p className="mt-2 text-sm text-gray-600">
                BeautifulSoup + Selenium<br />
                安定したデータ取得
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">⚡</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Next.js</h3>
              <p className="mt-2 text-sm text-gray-600">
                TypeScript + Tailwind<br />
                モダンUI/UX
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">分析</h3>
              <p className="mt-2 text-sm text-gray-600">
                Chart.js + Google Sheets<br />
                データ可視化・連携
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
              今すぐ試してみる
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <Search className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">価格検索</h3>
                <p className="text-gray-600 text-sm mb-4">
                  商品名を入力して最新価格を検索
                </p>
                <button
                  onClick={() => handleQuickSearch('エアコン')}
                  className="w-full btn-primary px-4 py-2 rounded text-sm font-medium"
                >
                  エアコンを検索
                </button>
              </div>
              
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">データ分析</h3>
                <p className="text-gray-600 text-sm mb-4">
                  価格分布とトレンドを分析
                </p>
                <div
                  onClick={handleAnalysis}
                  className="w-full btn-secondary px-4 py-2 rounded text-sm font-medium inline-block text-center hover:cursor-pointer"
                >
                  分析画面へ
                </div>
              </div>
              
              <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                <Download className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">連携機能</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Google Sheets へ自動エクスポート
                </p>
                <a
                  href="/sheets"
                  className="w-full btn-secondary px-4 py-2 rounded text-sm font-medium inline-block text-center"
                >
                  連携設定
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Notice */}
      <section className="py-12 bg-blue-50">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-6">
              法的配慮・倫理的使用について
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold text-sm">✓</span>
                </div>
                <p className="text-sm text-blue-800">
                  <strong>robots.txt遵守</strong><br />
                  適切なリクエスト間隔<br />
                  (3秒以上の間隔)
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold text-sm">📚</span>
                </div>
                <p className="text-sm text-blue-800">
                  <strong>教育・ポートフォリオ目的</strong><br />
                  商用利用前要確認<br />
                  利用規約の遵守
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold text-sm">⚡</span>
                </div>
                <p className="text-sm text-blue-800">
                  <strong>レート制限実装</strong><br />
                  サーバー負荷軽減<br />
                  最大50件/回の制限
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>免責事項:</strong> 
                このツールは教育・ポートフォリオ目的で作成されています。
                商用利用の際は対象サイトの利用規約を必ず確認し、
                適切な許可を得てからご使用ください。
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}