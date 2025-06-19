// app/sheets/page.tsx - Google Sheets連携管理画面（修正版 Part 1）
'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  Upload, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileText,
  BarChart3,
  Clock,
  Users
} from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  lastChecked: string
  error?: string
  accountEmail?: string
}

interface SpreadsheetInfo {
  id: string
  title: string
  url: string
  sheetCount: number
  lastUpdated: string
  accessible: boolean
}

interface ExportHistory {
  id: string
  spreadsheetTitle: string
  exportTime: string
  productCount: number
  success: boolean
  format: string
}

export default function SheetsPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetInfo[]>([])
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [newSpreadsheetId, setNewSpreadsheetId] = useState('')
  const [createTemplateLoading, setCreateTemplateLoading] = useState(false)
  const [showExportRestriction, setShowExportRestriction] = useState(false) // 新規追加
  const [exportSettings, setExportSettings] = useState({
    includeHeaders: true,
    includeImages: true,
    dateFormat: 'japanese',
    priceFormat: 'currency'
  })

  // 開発環境判定
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    checkConnection()
    loadExportHistory()
  }, [])

  // 接続状況確認
  const checkConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sheets?action=verify&test=true')
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus({
          connected: true,
          lastChecked: new Date().toISOString(),
          accountEmail: data.data?.accountEmail || 'Service Account'
        })
      } else {
        setConnectionStatus({
          connected: false,
          lastChecked: new Date().toISOString(),
          error: data.error?.message || '接続に失敗しました'
        })
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        lastChecked: new Date().toISOString(),
        error: '接続テストに失敗しました'
      })
    } finally {
      setLoading(false)
    }
  }

  // 制限通知表示（新規追加）
  const showRestrictionNotification = () => {
    setShowExportRestriction(true)
    setTimeout(() => setShowExportRestriction(false), 5000)
  }

  // テンプレート作成（修正版）
  const createTemplate = async () => {
    showRestrictionNotification()
    return // 実際の処理は実行しない
    
    /*
    // 以下は実際の処理ロジック（保持）
    setCreateTemplateLoading(true)
    try {
      const response = await fetch('/api/sheets?action=template', {
        method: 'GET'
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newSpreadsheet: SpreadsheetInfo = {
          id: data.data.spreadsheetId,
          title: '価格比較テンプレート',
          url: data.data.url,
          sheetCount: 2,
          lastUpdated: new Date().toISOString(),
          accessible: true
        }
        
        setSpreadsheets(prev => [newSpreadsheet, ...prev])
        
        // 新しいタブで開く
        window.open(data.data.url, '_blank')
        
        alert('テンプレートスプレッドシートを作成しました！')
      } else {
        alert(`テンプレート作成に失敗しました: ${data.error?.message}`)
      }
    } catch (error) {
      console.error('Template creation error:', error)
      alert('テンプレート作成中にエラーが発生しました')
    } finally {
      setCreateTemplateLoading(false)
    }
    */
  }

  // スプレッドシート追加（修正版）
  const addSpreadsheet = async () => {
    if (!newSpreadsheetId.trim()) {
      alert('スプレッドシートIDを入力してください')
      return
    }

    showRestrictionNotification()
    return // 実際の処理は実行しない

    /*
    // 以下は実際の処理ロジック（保持）
    setLoading(true)
    try {
      const response = await fetch(`/api/sheets?action=verify&spreadsheetId=${newSpreadsheetId}`)
      const data = await response.json()
      
      if (data.success) {
        const newSpreadsheet: SpreadsheetInfo = {
          id: newSpreadsheetId,
          title: data.data.title,
          url: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`,
          sheetCount: data.data.sheetCount,
          lastUpdated: new Date().toISOString(),
          accessible: true
        }
        
        setSpreadsheets(prev => [newSpreadsheet, ...prev])
        setNewSpreadsheetId('')
        alert('スプレッドシートを追加しました！')
      } else {
        alert(`スプレッドシートアクセスに失敗: ${data.error?.message}`)
      }
    } catch (error) {
      console.error('Add spreadsheet error:', error)
      alert('スプレッドシート追加中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
    */
  }

  // エクスポート履歴読み込み
  const loadExportHistory = () => {
    // ローカルストレージから履歴を読み込み（実際の実装）
    const saved = localStorage.getItem('exportHistory')
    if (saved) {
      try {
        setExportHistory(JSON.parse(saved))
      } catch (error) {
        console.error('Export history load error:', error)
      }
    }
  }

  // スプレッドシートIDをURLから抽出
  const extractSpreadsheetId = (input: string): string => {
    // URL形式の場合
    const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }
    
    // ID形式の場合はそのまま返す
    return input.trim()
  }

  const handleSpreadsheetIdChange = (value: string) => {
    const extractedId = extractSpreadsheetId(value)
    setNewSpreadsheetId(extractedId)
  }
  // Part 2: JSX Return開始 - ヘッダーから設定まで
  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* ヘッダー */}
      <div className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Google Sheets 連携
              </h1>
              <p className="text-gray-600">
                価格比較データをGoogle Sheetsに自動エクスポートして共同編集・分析を行えます
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={checkConnection}
                disabled={loading}
                className="btn-secondary px-4 py-2 rounded-md text-sm font-medium inline-flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                接続確認
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 space-y-8">
        
        {/* 接続状況（修正版） */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            接続状況
          </h2>
          
          {connectionStatus ? (
            <div className={`p-4 rounded-lg ${
              connectionStatus.connected 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {connectionStatus.connected ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-3" />
                )}
                <div>
                  <p className={`font-medium ${
                    connectionStatus.connected ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {connectionStatus.connected ? 'Google Sheets API 接続成功' : 'Google Sheets API 接続失敗'}
                  </p>
                  <p className={`text-sm ${
                    connectionStatus.connected ? 'text-green-600' : 'text-red-600'
                  }`}>
                    最終確認: {new Date(connectionStatus.lastChecked).toLocaleString('ja-JP')}
                  </p>
                  {connectionStatus.accountEmail && (
                    <p className="text-sm text-green-600">
                      アカウント: {connectionStatus.accountEmail}
                    </p>
                  )}
                  {connectionStatus.error && (
                    <p className="text-sm text-red-600 mt-1">
                      エラー: デプロイ環境のシステムライブラリ更新またはお使いの実行環境により、正常に動作していない可能性があります。(環境設定の微修正が必要)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">接続状況を確認中...</p>
            </div>
          )}

          {/* 設定ガイドリンク（修正版 - 簡略化） */}
          {!connectionStatus?.connected && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-blue-800 font-medium">Google Sheets API の設定が必要です</p>
                  <p className="text-blue-600 text-sm mt-1">
                    Google Sheets APIの設定をご確認ください。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* テンプレート作成（修正版） */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            クイックスタート
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">新規テンプレート作成</h3>
              <p className="text-sm text-gray-600 mb-4">
                分析用のテンプレートを含む新しいスプレッドシートを自動作成します
              </p>
              <button
                onClick={createTemplate}
                disabled={createTemplateLoading}
                className="w-full btn-primary px-4 py-2 rounded-md text-sm font-medium inline-flex items-center justify-center"
              >
                <Table className="h-4 w-4 mr-2" />
                {createTemplateLoading ? '作成中...' : 'テンプレート作成'}
              </button>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">既存スプレッドシート連携</h3>
              <p className="text-sm text-gray-600 mb-4">
                既存のGoogle Sheetsと連携してデータをエクスポートできます
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="スプレッドシートのURLまたはIDを入力"
                  value={newSpreadsheetId}
                  onChange={(e) => handleSpreadsheetIdChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSpreadsheet}
                  disabled={loading || !newSpreadsheetId.trim()}
                  className="w-full btn-secondary px-4 py-2 rounded-md text-sm font-medium"
                >
                  {loading ? '確認中...' : '追加'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* エクスポート設定 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            エクスポート設定
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeHeaders"
                  checked={exportSettings.includeHeaders}
                  onChange={(e) => setExportSettings(prev => ({
                    ...prev,
                    includeHeaders: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeHeaders" className="ml-3 text-sm text-gray-700">
                  ヘッダー行を含める
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeImages"
                  checked={exportSettings.includeImages}
                  onChange={(e) => setExportSettings(prev => ({
                    ...prev,
                    includeImages: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeImages" className="ml-3 text-sm text-gray-700">
                  画像URLを含める
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日付形式
                </label>
                <select
                  value={exportSettings.dateFormat}
                  onChange={(e) => setExportSettings(prev => ({
                    ...prev,
                    dateFormat: e.target.value
                  }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="japanese">日本語 (2024/1/15 10:30)</option>
                  <option value="iso">ISO形式 (2024-01-15T10:30:00Z)</option>
                  <option value="us">米国形式 (1/15/2024 10:30 AM)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格形式
                </label>
                <select
                  value={exportSettings.priceFormat}
                  onChange={(e) => setExportSettings(prev => ({
                    ...prev,
                    priceFormat: e.target.value
                  }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="currency">通貨形式 (¥10,000)</option>
                  <option value="number">数値のみ (10000)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* 管理中のスプレッドシート */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Table className="h-5 w-5 mr-2" />
            管理中のスプレッドシート
          </h2>
          
          {spreadsheets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">名前</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">シート数</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">最終更新</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {spreadsheets.map((sheet) => (
                    <tr key={sheet.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{sheet.title}</p>
                          <p className="text-xs text-gray-500">ID: {sheet.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {sheet.sheetCount}シート
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(sheet.lastUpdated).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <a
                            href={sheet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                            title="開く"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => navigator.clipboard.writeText(sheet.id)}
                            className="text-gray-600 hover:text-gray-700"
                            title="IDをコピー"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSpreadsheets(prev => prev.filter(s => s.id !== sheet.id))}
                            className="text-red-600 hover:text-red-700"
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">管理中のスプレッドシートはありません</p>
              <p className="text-sm text-gray-500 mt-1">
                テンプレートを作成するか、既存のスプレッドシートを追加してください
              </p>
            </div>
          )}
        </div>

        {/* エクスポート履歴 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            エクスポート履歴
          </h2>
          
          {exportHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">スプレッドシート</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">件数</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">形式</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">実行日時</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">状態</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exportHistory.map((history) => (
                    <tr key={history.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{history.spreadsheetTitle}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {history.productCount}件
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {history.format}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(history.exportTime).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-3">
                        {history.success ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            成功
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            失敗
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">エクスポート履歴はありません</p>
              <p className="text-sm text-gray-500 mt-1">
                検索結果画面からGoogle Sheetsにエクスポートすると履歴が表示されます
              </p>
            </div>
          )}
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Table className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">管理中のシート</p>
                <p className="text-2xl font-bold text-gray-900">{spreadsheets.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総エクスポート回数</p>
                <p className="text-2xl font-bold text-gray-900">{exportHistory.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総データ件数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exportHistory.reduce((sum, h) => sum + h.productCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 使い方ガイド */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            使い方ガイド
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Google Sheets API の設定</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Google Cloud Consoleでサービスアカウントを作成し、環境変数を設定してください
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">スプレッドシートの準備</h3>
                <p className="text-sm text-gray-600 mt-1">
                  テンプレートを作成するか、既存のスプレッドシートにサービスアカウントの編集権限を付与してください
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">データのエクスポート</h3>
                <p className="text-sm text-gray-600 mt-1">
                  検索結果画面から「Google Sheets」ボタンをクリックして、データを自動エクスポートできます
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">共同編集と分析</h3>
                <p className="text-sm text-gray-600 mt-1">
                  チームメンバーとスプレッドシートを共有して、リアルタイムで価格データを分析・編集できます
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 設定ガイド（折りたたみ）- 開発環境でのみ表示 */}
        {isDevelopment && (
          <div id="setup-guide" className="bg-white rounded-lg shadow-sm">
            <details className="group">
              <summary className="p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    詳細設定ガイド（開発環境）
                  </h2>
                  <div className="transform group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </summary>
              
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">環境変数の設定</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-3">
                        .env.local ファイルに以下の環境変数を設定してください：
                      </p>
                      <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">スプレッドシートの権限設定</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <ol className="text-sm text-blue-800 space-y-2">
                        <li>1. Google Sheetsでスプレッドシートを開く</li>
                        <li>2. 右上の「共有」ボタンをクリック</li>
                        <li>3. サービスアカウントのメールアドレスを追加</li>
                        <li>4. 権限を「編集者」に設定</li>
                        <li>5. 「送信」をクリック</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">トラブルシューティング</h3>
                    <div className="space-y-3">
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">
                          「The caller does not have permission」エラー
                        </h4>
                        <p className="text-sm text-yellow-700">
                          サービスアカウントがスプレッドシートに共有されていない可能性があります。
                          権限設定を再確認してください。
                        </p>
                      </div>
                      
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">
                          「Invalid credentials」エラー
                        </h4>
                        <p className="text-sm text-red-700">
                          環境変数が正しく設定されていない可能性があります。
                          GOOGLE_PRIVATE_KEY の改行文字（\n）が正しく設定されているか確認してください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* フッター */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            Google Sheets連携により、チーム全体での価格データ分析・共有が可能になります
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-400">
            <span className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              リアルタイム共同編集
            </span>
            <span className="flex items-center">
              <BarChart3 className="h-3 w-3 mr-1" />
              自動分析式
            </span>
            <span className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-1" />
              データ同期
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}