import { Product } from "@/lib/types"

// src/lib/sheets/export-helpers.ts
export interface ExportOptions {
  includeHeaders?: boolean
  includeImages?: boolean
  dateFormat?: 'iso' | 'japanese' | 'us'
  priceFormat?: 'number' | 'currency'
  filename?: string
}

export interface SheetsOptions {
  spreadsheetId?: string
  worksheetTitle?: string
  mode?: 'create' | 'append' | 'overwrite'
}

// 検索結果をローカルストレージに保存
export function saveSearchResults(products: Product[]): void {
  try {
    localStorage.setItem('searchResults', JSON.stringify(products))
    localStorage.setItem('searchResultsTimestamp', new Date().toISOString())
  } catch (error) {
    console.error('検索結果の保存エラー:', error)
  }
}

// ローカルストレージから検索結果を取得
export function loadSearchResults(): Product[] {
  try {
    const savedResults = localStorage.getItem('searchResults')
    const timestamp = localStorage.getItem('searchResultsTimestamp')
    
    if (!savedResults || !timestamp) return []
    
    // 24時間以上古いデータは削除
    const saveTime = new Date(timestamp).getTime()
    const now = new Date().getTime()
    const hoursDiff = (now - saveTime) / (1000 * 60 * 60)
    
    if (hoursDiff > 24) {
      localStorage.removeItem('searchResults')
      localStorage.removeItem('searchResultsTimestamp')
      return []
    }
    
    return JSON.parse(savedResults)
  } catch (error) {
    console.error('検索結果の読み込みエラー:', error)
    return []
  }
}

// エクスポート形式の情報
export const EXPORT_FORMATS = {
  csv: {
    name: 'CSV',
    description: 'Comma-Separated Values（汎用形式）',
    extension: '.csv',
    mimeType: 'text/csv',
    features: ['軽量', 'Excel対応', '汎用性高'],
    icon: 'FileText'
  },
  excel: {
    name: 'Excel CSV',
    description: 'Excel最適化CSV（BOM付き）',
    extension: '.csv',
    mimeType: 'application/vnd.ms-excel',
    features: ['Excel直接対応', '日本語対応', '文字化け防止'],
    icon: 'FileText'
  },
  json: {
    name: 'JSON',
    description: 'JavaScript Object Notation',
    extension: '.json',
    mimeType: 'application/json',
    features: ['構造化データ', 'API連携', 'プログラム処理向け'],
    icon: 'Settings'
  },
  sheets: {
    name: 'Google Sheets',
    description: 'リアルタイム共同編集対応',
    extension: '.gsheet',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    features: ['リアルタイム同期', '共同編集', '自動分析'],
    icon: 'Table'
  }
} as const

// エクスポート統計
export class ExportStats {
  private static readonly STORAGE_KEY = 'exportStats'

  static record(type: string, productCount: number, success: boolean): void {
    try {
      const stats = this.load()
      const today = new Date().toISOString().slice(0, 10)
      
      if (!stats[today]) {
        stats[today] = {}
      }
      
      if (!stats[today][type]) {
        stats[today][type] = { count: 0, products: 0, success: 0, errors: 0 }
      }
      
      stats[today][type].count++
      stats[today][type].products += productCount
      
      if (success) {
        stats[today][type].success++
      } else {
        stats[today][type].errors++
      }
      
      // 30日分のデータのみ保持
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 30)
      const cutoffStr = cutoffDate.toISOString().slice(0, 10)
      
      Object.keys(stats).forEach(date => {
        if (date < cutoffStr) {
          delete stats[date]
        }
      })
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats))
    } catch (error) {
      console.error('統計記録エラー:', error)
    }
  }

  static load(): Record<string, Record<string, { count: number; products: number; success: number; errors: number }>> {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('統計読み込みエラー:', error)
      return {}
    }
  }

  static getSummary(): {
    totalExports: number
    totalProducts: number
    successRate: number
    popularFormat: string
  } {
    const stats = this.load()
    let totalExports = 0
    let totalProducts = 0
    let totalSuccess = 0
    const formatCounts: Record<string, number> = {}

    Object.values(stats).forEach(dayStats => {
      Object.entries(dayStats).forEach(([format, data]) => {
        totalExports += data.count
        totalProducts += data.products
        totalSuccess += data.success
        formatCounts[format] = (formatCounts[format] || 0) + data.count
      })
    })

    const popularFormat = Object.entries(formatCounts).reduce(
      (max, [format, count]) => count > max.count ? { format, count } : max,
      { format: 'csv', count: 0 }
    ).format

    return {
      totalExports,
      totalProducts,
      successRate: totalExports > 0 ? (totalSuccess / totalExports) * 100 : 0,
      popularFormat
    }
  }
}