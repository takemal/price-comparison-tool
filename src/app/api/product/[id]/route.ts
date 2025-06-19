// src/app/api/product/[id]/route.ts - 最終版
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { ProductDetailResponse } from '@/lib/types';
import { kakakuScraper } from '@/lib/scrapers/kakaku-scraper';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  
  try {
    const productId = params.id;
    
    console.log(`🔍 商品詳細取得開始: ${productId}`);
    
    // 商品IDの妥当性チェック
    if (!productId || productId.length < 5) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_PRODUCT_ID',
          message: '無効な商品IDです'
        }
      }, { status: 400 });
    }
    
    // 商品詳細をスクレイピング
    const productDetail = await kakakuScraper.getProductDetail(productId);
    
    if (!productDetail) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: '商品が見つかりませんでした'
        }
      }, { status: 404 });
    }

    const response: ProductDetailResponse = {
      success: true,
      data: {
        product: productDetail,
        searchInfo: {
          scrapedAt: new Date().toISOString(),
          source: 'kakaku.com',
          processingTime: Date.now() - startTime
        }
      }
    };

    console.log(`✅ 商品詳細取得完了: ${Date.now() - startTime}ms`);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800', // 30分キャッシュ
        'X-Product-ID': productId,
        'X-Processing-Time': `${Date.now() - startTime}ms`
      }
    });

  } catch (error) {
    console.error('🚨 商品詳細取得エラー:', error);
    
    const errorCode = classifyError(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const response: ProductDetailResponse = {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      }
    };

    return NextResponse.json(response, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * エラー分類
 */
function classifyError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (message.includes('network')) return 'NETWORK_ERROR';
    if (message.includes('page') || message.includes('browser')) return 'BROWSER_ERROR';
    if (message.includes('access') || message.includes('forbidden')) return 'ACCESS_ERROR';
    if (message.includes('parse') || message.includes('html')) return 'PARSING_ERROR';
  }
  
  return 'SCRAPING_ERROR';
}