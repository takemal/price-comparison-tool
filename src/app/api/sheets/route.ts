// app/api/sheets/route.ts - 修正版（重複削除）
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { Product } from '@/lib/types'

interface ExportRequest {
  products: Product[]
  spreadsheetId?: string
  worksheetTitle?: string
  mode: 'create' | 'append' | 'overwrite'
}

// Google Sheets認証設定（Google Drive API も含む）
function createAuth(): JWT {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !privateKey) {
    throw new Error('Google Sheets認証情報が設定されていません')
  }

  return new JWT({
    email,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file' // Google Drive API も含める
    ]
  })
}
// Google Drive API用のクライアント設定
function createAuthWithDrive(): JWT {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !privateKey) {
    throw new Error('Google Sheets認証情報が設定されていません')
  }

  return new JWT({
    email,
    key: privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file' // Google Drive API も含める
    ]
  })
}


// 新しいスプレッドシートを作成（シンプル版）
async function createNewSpreadsheet(
  auth: JWT,
  title: string = '価格比較データ',
  userEmail: string = 'take0piece.0715@gmail.com' // 個人のGoogleアカウント
): Promise<string> {
  try {
    console.log('📝 スプレッドシート作成開始...');
    
    // 1. スプレッドシート作成
    const doc = await GoogleSpreadsheet.createNewSpreadsheetDocument(auth, {
      title: `${title} - ${new Date().toLocaleDateString('ja-JP')}`
    })
    
    console.log(`✅ スプレッドシート作成完了: ${doc.spreadsheetId}`)
    
    // 2. Google Drive API を使って権限を付与
    await shareSpreadsheetWithUser(auth, doc.spreadsheetId, userEmail)
    
    return doc.spreadsheetId
  } catch (error) {
    console.error('❌ スプレッドシート作成エラー:', error)
    throw new Error(`スプレッドシート作成に失敗しました: ${error}`)
  }
}



// データをGoogle Sheetsにエクスポート
async function exportToSheets(
  products: Product[],
  config: {
    auth: JWT
    spreadsheetId?: string
    worksheetTitle: string
    mode: 'create' | 'append' | 'overwrite'
  }
): Promise<{ success: boolean; spreadsheetId: string; url: string }> {
  try {
    // スプレッドシートID決定
    let spreadsheetId = config.spreadsheetId
    if (!spreadsheetId || config.mode === 'create') {
      spreadsheetId = await createNewSpreadsheet(config.auth)
    }

    const doc = new GoogleSpreadsheet(spreadsheetId, config.auth)
    await doc.loadInfo()

    // ワークシート取得または作成
    let sheet = doc.sheetsByTitle[config.worksheetTitle]
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: config.worksheetTitle,
        headerValues: [
          '商品名',
          '価格',
          'ショップ',
          '評価',
          'カテゴリ',
          '商品URL',
          '画像URL',
          '取得日時',
          'メモ'
        ]
      })
    }

    // データ処理モード
    if (config.mode === 'overwrite') {
      await sheet.clear()
      await sheet.setHeaderRow([
        '商品名', '価格', 'ショップ', '評価', 'カテゴリ', 
        '商品URL', '画像URL', '取得日時', 'メモ'
      ])
    }

    // データ行を準備
    const rows = products.map(product => ({
      '商品名': product.name,
      '価格': product.price,
      'ショップ': product.shop,
      '評価': product.rating || '',
      'カテゴリ': product.category || '',
      '商品URL': product.productUrl,
      '画像URL': product.imageUrl || '',
      '取得日時': new Date(product.scrapedAt).toLocaleString('ja-JP'),
      'メモ': ''
    }))

    // データを追加
    await sheet.addRows(rows)

    // スタイリング適用
    await sheet.loadCells('A1:I1')
    for (let i = 0; i < 9; i++) {
      const cell = sheet.getCell(0, i)
      cell.backgroundColor = { red: 0.2, green: 0.6, blue: 0.9 }
      cell.textFormat = { bold: true }
    }
    await sheet.saveUpdatedCells()

    // 列幅自動調整
    await sheet.resize({ 
      rowCount: products.length + 10,
      columnCount: 9
    })

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`

    return {
      success: true,
      spreadsheetId,
      url: spreadsheetUrl
    }

  } catch (error) {
    console.error('Google Sheets export error:', error)
    throw error
  }
}

// テンプレートスプレッドシート作成（修正版）
async function createTemplate(auth: JWT): Promise<{
  spreadsheetId: string
  url: string
}> {
  const spreadsheetId = await createNewSpreadsheet(auth, '価格比較テンプレート')
  const doc = new GoogleSpreadsheet(spreadsheetId, auth)
  await doc.loadInfo()

  // 🔧 修正: まず新しいシートを作成してからデフォルトシートを削除
  
  // データシートを作成
  const dataSheet = await doc.addSheet({
    title: 'データ',
    headerValues: [
      '商品名', '価格', 'ショップ', '評価', 'カテゴリ', 
      '商品URL', '画像URL', '取得日時', 'メモ'
    ]
  })

  // 分析シートを作成
  const analysisSheet = await doc.addSheet({
    title: '分析',
    headerValues: ['項目', '値', '備考']
  })

  // 分析データ追加
  await analysisSheet.addRows([
    { '項目': '最低価格', '値': '=IF(COUNTA(データ!B:B)>1,MIN(データ!B2:B1000),"")', '備考': '最安値' },
    { '項目': '最高価格', '値': '=IF(COUNTA(データ!B:B)>1,MAX(データ!B2:B1000),"")', '備考': '最高値' },
    { '項目': '平均価格', '値': '=IF(COUNTA(データ!B:B)>1,AVERAGE(データ!B2:B1000),"")', '備考': '平均値' },
    { '項目': '商品数', '値': '=COUNTA(データ!A2:A1000)', '備考': 'ヘッダー除く' },
    { '項目': '取得日時', '値': '=NOW()', '備考': 'テンプレート作成日時' }
  ])

  // 🔧 修正: 新しいシートを作成した後にデフォルトシートを削除
  try {
    const defaultSheet = doc.sheetsByIndex[0]
    if (defaultSheet && defaultSheet.title === 'シート1') {
      await defaultSheet.delete()
    }
  } catch (error) {
    console.warn('デフォルトシート削除をスキップ:', error)
    // デフォルトシートの削除に失敗してもテンプレート作成は続行
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
  }
}

// POST /api/sheets - データエクスポート
export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json()
    const { products, spreadsheetId, worksheetTitle = 'データ', mode = 'create' } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: { message: 'エクスポートするデータがありません' }
      }, { status: 400 })
    }

    const auth = createAuth()
    
    const result = await exportToSheets(products, {
      auth,
      spreadsheetId,
      worksheetTitle,
      mode
    })

    return NextResponse.json({
      success: true,
      data: {
        spreadsheetId: result.spreadsheetId,
        url: result.url,
        exportedCount: products.length,
        mode,
        timestamp: new Date().toISOString(),
        spreadsheetTitle: worksheetTitle // 履歴記録用
      }
    })

  } catch (error) {
    console.error('Sheets export error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'エクスポートに失敗しました',
        code: 'SHEETS_EXPORT_ERROR'
      }
    }, { status: 500 })
  }
}

// GET /api/sheets - テンプレート作成・情報取得（統合版）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // 🔧 接続テスト用
    if (action === 'verify' && searchParams.get('test') === 'true') {
      try {
        const auth = createAuth()
        // 簡単な認証テスト - 空のスプレッドシートを作成
        const testDoc = await GoogleSpreadsheet.createNewSpreadsheetDocument(auth, {
          title: 'Connection Test - Safe to Delete'
        })
        
        return NextResponse.json({
          success: true,
          data: {
            connected: true,
            accountEmail: auth.email,
            testSpreadsheetId: testDoc.spreadsheetId,
            message: '接続テスト成功（テストスプレッドシートが作成されました）'
          }
        })
      } catch (error) {
        console.error('Connection test error:', error)
        return NextResponse.json({
          success: false,
          error: {
            message: error instanceof Error ? error.message : '接続テストに失敗しました',
            code: 'CONNECTION_TEST_FAILED'
          }
        }, { status: 500 })
      }
    }

    const auth = createAuth()

    switch (action) {
    case 'template':
      const template = await createTemplateWithPermissions(auth)
      return NextResponse.json({
        success: true,
        data: {
          type: 'template',
          spreadsheetId: template.spreadsheetId,
          url: template.url,
          message: 'テンプレートスプレッドシートを作成し、権限を設定しました',
          accessInfo: {
            automaticPermission: true,
            userEmail: process.env.USER_EMAIL || 'take0piece.0715@gmail.com',
            permission: 'editor'
          }
        }
  })
      case 'verify':
        const testSpreadsheetId = searchParams.get('spreadsheetId')
        if (!testSpreadsheetId) {
          return NextResponse.json({
            success: false,
            error: { message: 'スプレッドシートIDが必要です' }
          }, { status: 400 })
        }

        try {
          const doc = new GoogleSpreadsheet(testSpreadsheetId, auth)
          await doc.loadInfo()
          
          return NextResponse.json({
            success: true,
            data: {
              title: doc.title,
              sheetCount: doc.sheetCount,
              accessible: true,
              lastUpdated: new Date().toISOString()
            }
          })
        } catch (error) {
          console.error('Spreadsheet verification error:', error)
          return NextResponse.json({
            success: false,
            error: { 
              message: `スプレッドシートにアクセスできません: ${error instanceof Error ? error.message : 'Unknown error'}`,
              code: 'SPREADSHEET_ACCESS_DENIED'
            }
          }, { status: 404 })
        }

      case 'health':
        // ヘルスチェック
        try {
          const auth = createAuth()
          return NextResponse.json({
            success: true,
            data: {
              status: 'healthy',
              timestamp: new Date().toISOString(),
              auth: {
                email: auth.email,
                configured: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
              },
              capabilities: [
                'create_spreadsheet',
                'read_spreadsheet',
                'write_spreadsheet',
                'verify_access'
              ]
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            error: {
              message: 'Google Sheets API設定エラー',
              details: error instanceof Error ? error.message : 'Unknown error',
              suggestions: [
                'GOOGLE_SERVICE_ACCOUNT_EMAIL環境変数を確認',
                'GOOGLE_PRIVATE_KEY環境変数を確認',
                'Google Sheets APIが有効化されているか確認'
              ]
            }
          }, { status: 500 })
        }

      case 'list':
        // 将来的にサービスアカウントがアクセス可能なスプレッドシート一覧を取得
        return NextResponse.json({
          success: true,
          data: {
            spreadsheets: [],
            message: 'この機能は今後実装予定です'
          }
        })

      default:
        return NextResponse.json({
          success: true,
          data: {
            service: 'Google Sheets API',
            version: 'v1.3 (重複削除・修正版)',
            endpoints: {
              'POST /api/sheets': 'データエクスポート',
              'GET /api/sheets?action=template': 'テンプレート作成',
              'GET /api/sheets?action=verify&spreadsheetId=ID': 'アクセス確認',
              'GET /api/sheets?action=verify&test=true': '接続テスト',
              'GET /api/sheets?action=health': 'ヘルスチェック',
              'GET /api/sheets?action=list': 'スプレッドシート一覧'
            },
            exportModes: {
              'create': '新しいスプレッドシート作成',
              'append': '既存シートに追加',
              'overwrite': '既存シートを上書き'
            },
            configuration: {
              environmentVariables: [
                'GOOGLE_SERVICE_ACCOUNT_EMAIL',
                'GOOGLE_PRIVATE_KEY'
              ],
              requiredScopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file'
              ]
            }
          }
        })
    }

  } catch (error) {
    console.error('Sheets API error:', error)
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'API実行エラー',
        code: 'SHEETS_API_ERROR',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

// Google Drive API を使ってスプレッドシートに権限を付与
async function shareSpreadsheetWithUser(
  auth: JWT, 
  spreadsheetId: string, 
  userEmail: string
): Promise<void> {
  try {
    console.log(`🔐 権限付与開始: ${userEmail} に編集権限を付与...`)
    
    // JWTトークンを正しく取得
    await auth.authorize()
    const tokenInfo = await auth.getAccessToken()
    
    // tokenInfo の形式を確認してトークンを抽出
    let accessToken: string
    if (typeof tokenInfo === 'string') {
      accessToken = tokenInfo
    } else if (tokenInfo && typeof tokenInfo === 'object' && 'token' in tokenInfo) {
      accessToken = (tokenInfo as any).token
    } else {
      throw new Error('アクセストークンの取得に失敗しました')
    }
    
    console.log('🔑 アクセストークン取得成功')
    
    // Google Drive API v3 を直接呼び出し
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${spreadsheetId}/permissions`
    
    const response = await fetch(driveUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'writer',  // 編集権限
        type: 'user',
        emailAddress: userEmail,
        sendNotificationEmail: false // 通知メールを送信しない
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`権限付与失敗: ${response.status} - ${JSON.stringify(errorData)}`)
    }
    
    const result = await response.json()
    console.log(`✅ 権限付与完了: ${userEmail} に編集権限を付与しました`, result)
  } catch (error) {
    console.error('❌ 権限付与エラー:', error)
    throw error
  }
}

// テンプレートスプレッドシート作成（自動権限付与版）
async function createTemplateWithPermissions(auth: JWT): Promise<{
  spreadsheetId: string
  url: string
}> {
  // 個人アカウントのメールアドレス（環境変数または固定値）
  const userEmail = process.env.USER_EMAIL || 'take0piece.0715@gmail.com'
  
  const spreadsheetId = await createNewSpreadsheet(auth, '価格比較テンプレート', userEmail)
  const doc = new GoogleSpreadsheet(spreadsheetId, auth)
  await doc.loadInfo()

  try {
    // データシートを作成
    const dataSheet = await doc.addSheet({
      title: 'データ',
      headerValues: [
        '商品名', '価格', 'ショップ', '評価', 'カテゴリ', 
        '商品URL', '画像URL', '取得日時', 'メモ'
      ]
    })

    // 分析シートを作成
    const analysisSheet = await doc.addSheet({
      title: '分析',
      headerValues: ['項目', '値', '備考']
    })

    // 分析データ追加
    await analysisSheet.addRows([
      { '項目': '最低価格', '値': '=IF(COUNTA(データ!B:B)>1,MIN(データ!B2:B1000),"")', '備考': '最安値' },
      { '項目': '最高価格', '値': '=IF(COUNTA(データ!B:B)>1,MAX(データ!B2:B1000),"")', '備考': '最高値' },
      { '項目': '平均価格', '値': '=IF(COUNTA(データ!B:B)>1,AVERAGE(データ!B2:B1000),"")', '備考': '平均値' },
      { '項目': '商品数', '値': '=COUNTA(データ!A2:A1000)', '備考': 'ヘッダー除く' },
      { '項目': '取得日時', '値': '=NOW()', '備考': 'テンプレート作成日時' }
    ])

    // デフォルトシートを削除（エラーが出ても続行）
    try {
      const defaultSheet = doc.sheetsByIndex[0]
      if (defaultSheet && defaultSheet.title === 'シート1') {
        await defaultSheet.delete()
      }
    } catch (error) {
      console.warn('⚠️ デフォルトシート削除をスキップ:', error)
    }

  } catch (error) {
    console.warn('⚠️ シート設定エラー（基本シートは作成済み）:', error)
  }

  return {
    spreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
  }
}

