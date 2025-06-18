// src/components/results/ExportButton.tsx
'use client'

import { useState } from 'react'
import { 
  Download, 
  FileText, 
  Table, 
  Settings,
  ChevronDown,
  Upload,
  ExternalLink 
} from 'lucide-react'
import { Product } from '@/lib/types'

interface ExportButtonProps {
  products: Product[]
  className?: string
  onGoogleSheetsClick: () => void
}

export function ExportButton({ products, className = '', onGoogleSheetsClick }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  

  // ファイルダウンロード
  const downloadFile = async (format: 'csv' | 'excel' | 'json') => {
    if (products.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          format,
          options: {
            includeHeaders: true,
            includeImages: true,
            dateFormat: 'japanese',
            priceFormat: 'currency'
          }
        })
      })

      if (!response.ok) throw new Error('ダウンロードに失敗しました')

      const contentDisposition = response.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      const filename = filenameMatch ? 
        decodeURIComponent(filenameMatch[1]!.replace(/['"]/g, '')) : 
        `export.${format}`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setIsOpen(false)
    } catch (error) {
      console.error('Download error:', error)
      alert('ダウンロードに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // Google Sheetsエクスポート
// Google Sheetsエクスポート
  const exportToSheets = async () => {
    if (products.length === 0) return

    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          worksheetTitle: 'データ',
          mode: 'create'
        })
      })

      const result = await response.json()

      if (result.success) {
        // エクスポート履歴を記録
        const historyEntry = {
          id: `export_${Date.now()}`,
          spreadsheetTitle: result.data.spreadsheetTitle || '新規スプレッドシート',
          exportTime: new Date().toISOString(),
          productCount: products.length,
          success: true,
          format: 'Google Sheets'
        }
        
        // ローカルストレージに履歴を保存
        const existingHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]')
        const updatedHistory = [historyEntry, ...existingHistory].slice(0, 50) // 最新50件まで保持
        localStorage.setItem('exportHistory', JSON.stringify(updatedHistory))
        
        window.open(result.data.url, '_blank')
        setIsOpen(false)
        
        // 成功通知
        showSuccessNotification('Google Sheetsへのエクスポートが完了しました')
      } else {
        throw new Error(result.error?.message || 'エクスポートに失敗しました')
      }
    } catch (error) {
      console.error('Sheets export error:', error)
      
      // エラー履歴も記録
      const errorHistoryEntry = {
        id: `export_error_${Date.now()}`,
        spreadsheetTitle: 'エクスポート失敗',
        exportTime: new Date().toISOString(),
        productCount: products.length,
        success: false,
        format: 'Google Sheets',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      const existingHistory = JSON.parse(localStorage.getItem('exportHistory') || '[]')
      const updatedHistory = [errorHistoryEntry, ...existingHistory].slice(0, 50)
      localStorage.setItem('exportHistory', JSON.stringify(updatedHistory))
      
      alert('Google Sheetsエクスポートに失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
    }
  }

  // 成功通知関数
  const showSuccessNotification = (message: string) => {
    // カスタムイベントで成功通知を発火
    const event = new CustomEvent('exportSuccess', { detail: { message } })
    window.dispatchEvent(event)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={products.length === 0 || isLoading}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        エクスポート
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-20">
            <div className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">
                エクスポート形式を選択
              </div>
              
              {/* Google Sheets */}
              <button
                onClick={onGoogleSheetsClick}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 flex items-center"
              >
                <div className="h-8 w-8 bg-green-100 rounded flex items-center justify-center mr-3">
                  <Table className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Google Sheets</div>
                  <div className="text-xs text-gray-500">リアルタイム共同編集</div>
                </div>
              </button>


              {/* Excel CSV */}
              <button
                onClick={() => downloadFile('excel')}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 flex items-center"
              >
                <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Excel CSV</div>
                  <div className="text-xs text-gray-500">Excel直接対応</div>
                </div>
              </button>

              {/* 標準CSV */}
              <button
                onClick={() => downloadFile('csv')}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 flex items-center"
              >
                <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                  <Table className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">標準CSV</div>
                  <div className="text-xs text-gray-500">汎用形式</div>
                </div>
              </button>

              {/* JSON */}
              <button
                onClick={() => downloadFile('json')}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 flex items-center"
              >
                <div className="h-8 w-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">JSON</div>
                  <div className="text-xs text-gray-500">API・プログラム処理用</div>
                </div>
              </button>

              <div className="border-t mt-2 pt-2">
                <a
                  href="/sheets"
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  詳細設定・連携ページ
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}