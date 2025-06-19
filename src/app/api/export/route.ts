// src/app/api/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Product } from '@/lib/types'
export const runtime = 'nodejs';

interface ExportRequest {
  products: Product[]
  format: 'csv' | 'excel' | 'json'
  options?: {
    filename?: string
    includeHeaders?: boolean
    includeImages?: boolean
    dateFormat?: 'iso' | 'japanese' | 'us'
    priceFormat?: 'number' | 'currency'
  }
}

// CSVエクスポート
function generateCSV(
  products: Product[], 
  options: ExportRequest['options'] = {}
): string {
  const {
    includeHeaders = true,
    includeImages = true,
    dateFormat = 'japanese',
    priceFormat = 'currency'
  } = options

  // ヘッダー行
  const headers = [
    '商品名',
    '価格',
    'ショップ',
    '評価',
    'カテゴリ',
    '商品URL',
    ...(includeImages ? ['画像URL'] : []),
    '取得日時'
  ]

  const rows: string[] = []
  
  if (includeHeaders) {
    rows.push(headers.map(h => `"${h}"`).join(','))
  }

  products.forEach(product => {
    const formatPrice = (price: number): string => {
      return priceFormat === 'currency' 
        ? `¥${price.toLocaleString('ja-JP')}`
        : price.toString()
    }

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr)
      switch (dateFormat) {
        case 'japanese':
          return date.toLocaleString('ja-JP')
        case 'us':
          return date.toLocaleString('en-US')
        default:
          return date.toISOString()
      }
    }

    const escapeCSV = (value: string | number | undefined): string => {
      if (value === undefined || value === null) return '""'
      const str = String(value)
      return `"${str.replace(/"/g, '""')}"`
    }

    const rowData = [
      escapeCSV(product.name),
      escapeCSV(formatPrice(product.price)),
      escapeCSV(product.shop),
      escapeCSV(product.rating || ''),
      escapeCSV(product.category || ''),
      escapeCSV(product.productUrl),
      ...(includeImages ? [escapeCSV(product.imageUrl || '')] : []),
      escapeCSV(formatDate(product.scrapedAt))
    ]

    rows.push(rowData.join(','))
  })

  return rows.join('\n')
}

// Excel形式（CSV with BOM）
function generateExcelCSV(products: Product[], options: ExportRequest['options'] = {}): Buffer {
  const csv = generateCSV(products, options)
  const bom = '\uFEFF' // UTF-8 BOM for Excel
  return Buffer.from(bom + csv, 'utf8')
}

// JSON エクスポート
function generateJSON(
  products: Product[], 
  options: ExportRequest['options'] = {}
): string {
  const {
    includeImages = true,
    dateFormat = 'iso',
    priceFormat = 'number'
  } = options

  const processedProducts = products.map(product => {
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr)
      switch (dateFormat) {
        case 'japanese':
          return date.toLocaleString('ja-JP')
        case 'us':
          return date.toLocaleString('en-US')
        default:
          return date.toISOString()
      }
    }

    const processed: any = {
      id: product.id,
      name: product.name,
      price: priceFormat === 'currency' 
        ? `¥${product.price.toLocaleString('ja-JP')}`
        : product.price,
      shop: product.shop,
      rating: product.rating,
      category: product.category,
      productUrl: product.productUrl,
      scrapedAt: formatDate(product.scrapedAt),
      source: product.source
    }

    if (includeImages) {
      processed.imageUrl = product.imageUrl
    }

    return processed
  })

  return JSON.stringify({
    exportInfo: {
      timestamp: new Date().toISOString(),
      totalProducts: products.length,
      format: 'json',
      options
    },
    products: processedProducts
  }, null, 2)
}

// ファイル名生成
function generateFilename(format: string, customName?: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
  const baseName = customName || `price_comparison_${timestamp}`
  
  const extensions = {
    csv: 'csv',
    excel: 'csv',
    json: 'json'
  }
  
  return `${baseName}.${extensions[format as keyof typeof extensions]}`
}

// Content-Type設定
function getContentType(format: string): string {
  const types = {
    csv: 'text/csv; charset=utf-8',
    excel: 'text/csv; charset=utf-8',
    json: 'application/json; charset=utf-8'
  }
  
  return types[format as keyof typeof types] || 'text/plain'
}

// POST /api/export - ファイルエクスポート
export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { products, format, options = {} } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: { message: 'エクスポートするデータがありません' }
      }, { status: 400 })
    }

    if (!['csv', 'excel', 'json'].includes(format)) {
      return NextResponse.json({
        success: false,
        error: { message: 'サポートされていない形式です' }
      }, { status: 400 })
    }

    const filename = generateFilename(format, options.filename)
    let content: string | Buffer
    let contentType = getContentType(format)

    switch (format) {
      case 'csv':
        content = generateCSV(products, options)
        break
      
      case 'excel':
        content = generateExcelCSV(products, options)
        contentType = 'application/vnd.ms-excel'
        break
      
      case 'json':
        content = generateJSON(products, options)
        break
      
      default:
        throw new Error(`未対応の形式: ${format}`)
    }

    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': Buffer.isBuffer(content) ? content.length.toString() : Buffer.byteLength(content, 'utf8').toString(),
      'Cache-Control': 'no-cache'
    })

    return new NextResponse(content, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Export error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'エクスポートに失敗しました',
        code: 'EXPORT_ERROR'
      }
    }, { status: 500 })
  }
}

// GET /api/export - エクスポート情報取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'formats':
        return NextResponse.json({
          success: true,
          data: {
            formats: [
              {
                id: 'csv',
                name: 'CSV',
                description: 'Comma-Separated Values（汎用形式）',
                extension: '.csv',
                mimeType: 'text/csv',
                features: ['軽量', 'Excel対応', '汎用性高']
              },
              {
                id: 'excel',
                name: 'Excel CSV',
                description: 'Excel最適化CSV（BOM付き）',
                extension: '.csv',
                mimeType: 'application/vnd.ms-excel',
                features: ['Excel直接対応', '日本語対応', '文字化け防止']
              },
              {
                id: 'json',
                name: 'JSON',
                description: 'JavaScript Object Notation',
                extension: '.json',
                mimeType: 'application/json',
                features: ['構造化データ', 'API連携', 'プログラム処理向け']
              }
            ],
            options: {
              filename: '任意のファイル名（拡張子なし）',
              includeHeaders: 'ヘッダー行を含める（CSV/Excel）',
              includeImages: '画像URLを含める',
              dateFormat: 'iso | japanese | us（日付形式）',
              priceFormat: 'number | currency（価格形式）'
            }
          }
        })

      case 'sample':
        const sampleProducts: Product[] = [
          {
            id: 'sample_1',
            name: 'サンプル商品1',
            price: 29800,
            shop: 'サンプルショップ',
            rating: 4.5,
            category: 'テスト',
            imageUrl: 'https://example.com/image1.jpg',
            productUrl: 'https://example.com/product1',
            scrapedAt: new Date().toISOString(),
            source: 'kakaku' as const
          }
        ]

        const sampleFormat = searchParams.get('format') || 'csv'
        let sampleContent: string

        switch (sampleFormat) {
          case 'csv':
            sampleContent = generateCSV(sampleProducts)
            break
          case 'json':
            sampleContent = generateJSON(sampleProducts)
            break
          default:
            sampleContent = generateCSV(sampleProducts)
        }

        return NextResponse.json({
          success: true,
          data: {
            format: sampleFormat,
            content: sampleContent,
            description: `${sampleFormat.toUpperCase()}形式のサンプル出力`
          }
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            service: 'Export API',
            version: '1.0.0',
            endpoints: {
              'POST /api/export': 'ファイルダウンロード',
              'GET /api/export?action=formats': '対応形式一覧',
              'GET /api/export?action=sample&format=csv': 'サンプル出力'
            },
            supportedFormats: ['csv', 'excel', 'json'],
            maxProducts: 1000,
            features: [
              'UTF-8対応',
              'Excel最適化',
              'カスタマイズ可能',
              '即座ダウンロード'
            ]
          }
        })
    }

  } catch (error) {
    console.error('Export API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'API実行エラー',
        code: 'EXPORT_API_ERROR'
      }
    }, { status: 500 })
  }
}