// src/components/results/QuickExport.tsx
'use client'

import { useState } from 'react'
import { Download, Upload, FileText } from 'lucide-react'
import { Product } from '@/lib/types'

interface QuickExportProps {
  products: Product[]
}

export function QuickExport({ products }: QuickExportProps) {
  const [isExporting, setIsExporting] = useState(false)

  const quickExportCSV = async () => {
    if (products.length === 0) return

    setIsExporting(true)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          format: 'excel',
          options: {
            includeHeaders: true,
            includeImages: true,
            dateFormat: 'japanese',
            priceFormat: 'currency'
          }
        })
      })

      if (!response.ok) throw new Error('エクスポートに失敗しました')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `price_comparison_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Quick export error:', error)
      alert('エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const quickExportSheets = async () => {
    if (products.length === 0) return

    setIsExporting(true)
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          products,
          worksheetTitle: 'クイックエクスポート',
          mode: 'create'
        })
      })

      const result = await response.json()

      if (result.success) {
        window.open(result.data.url, '_blank')
      } else {
        throw new Error(result.error?.message || 'エクスポートに失敗しました')
      }
    } catch (error) {
      console.error('Quick sheets export error:', error)
      alert('Google Sheetsエクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={quickExportCSV}
        disabled={isExporting}
        className="flex items-center px-3 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
        title="Excel CSV形式でダウンロード"
      >
        <FileText className="h-4 w-4 mr-1" />
        CSV
      </button>

      <button
        onClick={quickExportSheets}
        disabled={isExporting}
        className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        title="Google Sheetsに新規作成"
      >
        <Upload className="h-4 w-4 mr-1" />
        Sheets
      </button>
    </div>
  )
}