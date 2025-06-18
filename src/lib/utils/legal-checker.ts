import { RobotsInfo } from '@/lib/types';

// スクレイピング法的配慮の設定
export const SCRAPING_POLICY = {
  requestDelay: 3000,           // 3秒間隔
  maxConcurrent: 1,             // 同時リクエスト数制限
  respectRobotsTxt: true,       // robots.txt遵守
  userAgent: 'Mozilla/5.0 (compatible; PriceComparisonBot/1.0; +https://price-comparison-tool.vercel.app; Educational)',
  timeout: 15000,               // 15秒タイムアウト
  maxRetries: 2,                // 最大リトライ回数
  maxResults: 50,               // 最大取得件数制限
  respectCrawlDelay: true,      // Crawl-Delay遵守
} as const;

/**
 * robots.txtを確認し、アクセス可能かどうかを判定
 */
export async function checkRobotsTxt(baseUrl: string): Promise<RobotsInfo> {
  const robotsUrl = new URL('/robots.txt', baseUrl).toString();
  console.log(`robots.txt確認中: ${robotsUrl}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒で中断

  try {
    const response = await fetch(robotsUrl, {
      headers: {
        'User-Agent': SCRAPING_POLICY.userAgent,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId); // 成功時はタイマーをクリア

    if (!response.ok) {
      console.warn(`robots.txt取得失敗: ${response.status}`);
      return {
        allowed: true,
        disallowedPaths: [],
        crawlDelay: undefined,
        sitemapUrls: [],
      };
    }

    const robotsText = await response.text();
    return parseRobotsTxt(robotsText);
  } catch (error) {
    clearTimeout(timeoutId); // エラー時もタイマーをクリア

    console.warn('robots.txt確認エラー:', error);
    return {
      allowed: true,
      disallowedPaths: [],
      crawlDelay: undefined,
      sitemapUrls: [],
    };
  }
}

/**
 * robots.txtの内容を解析
 */
function parseRobotsTxt(robotsText: string): RobotsInfo {
  const lines = robotsText.split('\n').map(line => line.trim());
  let currentUserAgent = '';
  let isRelevantSection = false;
  
  const disallowedPaths: string[] = [];
  const sitemapUrls: string[] = [];
  let crawlDelay: number | undefined;
  
  for (const line of lines) {
    // コメントと空行をスキップ
    if (line.startsWith('#') || line === '') continue;
    
    const [rawKey, rawValue] = line.split(':', 2);
    const key = rawKey?.trim();
    const value = rawValue?.trim();
    if (!key) continue;
    if (!value) continue;
    
    switch (key.toLowerCase()) {
      case 'user-agent':
        currentUserAgent = value.toLowerCase();
        // 我々のボット、または全てのボット（*）に適用される場合
        isRelevantSection = 
          currentUserAgent === '*' || 
          currentUserAgent.includes('pricecomparisonbot') ||
          currentUserAgent.includes('educational');
        break;
        
      case 'disallow':
        if (isRelevantSection && value) {
          disallowedPaths.push(value);
        }
        break;
        
      case 'crawl-delay':
        if (isRelevantSection && value) {
          const delay = parseInt(value);
          if (!isNaN(delay)) {
            crawlDelay = delay * 1000; // 秒をミリ秒に変換
          }
        }
        break;
        
      case 'sitemap':
        if (value) {
          sitemapUrls.push(value);
        }
        break;
    }
  }
  
  console.log('robots.txt解析結果:', {
    disallowedPaths: disallowedPaths.length,
    crawlDelay,
    sitemapUrls: sitemapUrls.length
  });
  
  return {
    allowed: true, // 基本的に許可（個別パスは後でチェック）
    disallowedPaths,
    crawlDelay,
    sitemapUrls
  };
}

/**
 * 特定のURLパスがrobots.txtで禁止されているかチェック
 */
export function isPathAllowed(path: string, robotsInfo: RobotsInfo): boolean {
  if (!robotsInfo.disallowedPaths.length) return true;
  
  for (const disallowedPath of robotsInfo.disallowedPaths) {
    // 完全一致または前方一致でチェック
    if (path === disallowedPath || path.startsWith(disallowedPath)) {
      console.warn(`パス禁止: ${path} (robots.txt: ${disallowedPath})`);
      return false;
    }
  }
  
  return true;
}

/**
 * 適切なリクエスト間隔を取得（robots.txtのCrawl-Delayを考慮）
 */
export function getRequestDelay(robotsInfo?: RobotsInfo): number {
  if (!robotsInfo?.crawlDelay) {
    return SCRAPING_POLICY.requestDelay;
  }
  
  // robots.txtのCrawl-Delayと設定値の大きい方を使用
  return Math.max(SCRAPING_POLICY.requestDelay, robotsInfo.crawlDelay);
}

/**
 * スクレイピング前の法的チェック
 */
export async function performLegalCheck(targetUrl: string): Promise<{
  allowed: boolean;
  robotsInfo: RobotsInfo;
  requestDelay: number;
  warnings: string[];
}> {
  const warnings: string[] = [];
  
  try {
    const url = new URL(targetUrl);
    const baseUrl = `${url.protocol}//${url.host}`;
    
    // robots.txt確認
    const robotsInfo = await checkRobotsTxt(baseUrl);
    
    // パス許可チェック
    const pathAllowed = isPathAllowed(url.pathname, robotsInfo);
    if (!pathAllowed) {
      warnings.push(`パス ${url.pathname} はrobots.txtで禁止されています`);
    }
    
    // リクエスト間隔決定
    const requestDelay = getRequestDelay(robotsInfo);
    if (requestDelay > SCRAPING_POLICY.requestDelay) {
      warnings.push(`robots.txtにより${requestDelay/1000}秒間隔が必要です`);
    }
    
    // 価格.com特有の制限チェック
    if (url.hostname.includes('kakaku.com')) {
      // 既知の禁止パス
      const kakakuForbiddenPaths = [
        '/item/*/localshops/',
        '/admin/',
        '/api/',
        '/private/'
      ];
      
      for (const forbiddenPath of kakakuForbiddenPaths) {
        const pattern = forbiddenPath.replace('*', '.*');
        if (new RegExp(pattern).test(url.pathname)) {
          warnings.push(`価格.com制限: ${forbiddenPath} パターンは避けてください`);
        }
      }
    }
    
    return {
      allowed: pathAllowed && warnings.length === 0,
      robotsInfo,
      requestDelay,
      warnings
    };
    
  } catch (error) {
    console.error('法的チェックエラー:', error);
    warnings.push(`法的チェック実行エラー: ${error}`);
    
    return {
      allowed: false,
      robotsInfo: {
        allowed: false,
        disallowedPaths: [],
        crawlDelay: undefined,
        sitemapUrls: []
      },
      requestDelay: SCRAPING_POLICY.requestDelay,
      warnings
    };
  }
}

/**
 * スクレイピング実行ログ記録
 */
export function logScrapingActivity(targetUrl: string, success: boolean, details?: unknown) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    url: targetUrl,
    success,
    userAgent: SCRAPING_POLICY.userAgent,
    purpose: 'Educational/Portfolio',
    details
  };
  
  console.log('スクレイピング実行ログ:', logEntry);
  
  // 本番環境では外部ログサービスに送信することを検討
  if (process.env.NODE_ENV === 'production') {
    // 例: 外部ログサービスへの送信
    // await sendToLoggingService(logEntry);
  }
}

/**
 * エラー時の適切な遅延時間を計算
 */
export function getRetryDelay(attemptNumber: number, baseDelay: number = SCRAPING_POLICY.requestDelay): number {
  // 指数バックオフ: 1回目=3秒、2回目=6秒、3回目=12秒
  return baseDelay * Math.pow(2, attemptNumber - 1);
}

/**
 * レート制限クラス
 */
export class RateLimiter {
  private lastRequestTime = 0;
  private requestCount = 0;
  private readonly maxRequestsPerMinute = 20; // 1分間の最大リクエスト数

  async waitIfNeeded(delay: number): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < delay) {
      const waitTime = delay - timeSinceLastRequest;
      console.log(`レート制限: ${waitTime}ms待機中...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
    
    // 1分あたりのリクエスト数チェック
    if (this.requestCount > this.maxRequestsPerMinute) {
      console.warn('リクエスト数制限に達しました。1分間待機します。');
      await new Promise(resolve => setTimeout(resolve, 60000));
      this.requestCount = 0;
    }
  }
  
  reset(): void {
    this.lastRequestTime = 0;
    this.requestCount = 0;
  }
}

// グローバルレート制限インスタンス
export const globalRateLimiter = new RateLimiter();