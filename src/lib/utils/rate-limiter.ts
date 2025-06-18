import { RateLimitConfig } from '@/lib/types';

/**
 * 高度なレート制限実装
 */
export class AdvancedRateLimiter {
  private requestQueue: Array<{
    resolve: () => void;
    timestamp: number;
  }> = [];
  
  private activeRequests = 0;
  private requestHistory: number[] = [];
  
  constructor(private config: RateLimitConfig) {}
  
  /**
   * リクエスト実行許可を待機
   */
  async acquire(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push({
        resolve,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }
  
  /**
   * リクエスト完了時に呼び出し
   */
  release(): void {
    this.activeRequests--;
    this.processQueue();
  }
  
  /**
   * キュー処理
   */
  private processQueue(): void {
    if (this.requestQueue.length === 0) return;
    
    // 同時リクエスト数制限チェック
    if (this.activeRequests >= this.config.maxConcurrent) return;
    
    // 時間窓内のリクエスト数制限チェック
    const now = Date.now();
    this.cleanupHistory(now);
    
    if (this.requestHistory.length >= this.config.requests) {
    // 次に実行可能な時間を計算
      const oldestRequest = this.requestHistory[0];
      if (oldestRequest === undefined) return; // 安全対策

      const waitTime = this.config.windowMs - (now - oldestRequest);
      if (waitTime > 0) {
        setTimeout(() => this.processQueue(), waitTime);
        return;
      }
    }
    
    // 最小遅延チェック
    const lastRequestTime = this.requestHistory[this.requestHistory.length - 1] || 0;
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < this.config.minDelay) {
      const waitTime = this.config.minDelay - timeSinceLastRequest;
      setTimeout(() => this.processQueue(), waitTime);
      return;
    }
    
    // リクエスト実行
    const request = this.requestQueue.shift();
    if (request) {
      this.activeRequests++;
      this.requestHistory.push(now);
      request.resolve();
    }
  }
  
  /**
   * 古い履歴を削除
   */
  private cleanupHistory(now: number): void {
    const cutoff = now - this.config.windowMs;
    this.requestHistory = this.requestHistory.filter(time => time > cutoff);
  }
  
  /**
   * 統計情報取得
   */
  getStats(): {
    activeRequests: number;
    queueLength: number;
    requestsInWindow: number;
    estimatedWaitTime: number;
  } {
    const now = Date.now();
    this.cleanupHistory(now);
    
    let estimatedWaitTime = 0;
    
    if (this.requestQueue.length > 0) {
      // 同時実行制限による待機時間
      if (this.activeRequests >= this.config.maxConcurrent) {
        estimatedWaitTime += 5000; // 推定5秒
      }
      
      // レート制限による待機時間
      if (this.requestHistory.length >= this.config.requests) {
        const oldestRequest = this.requestHistory[0];
        if (oldestRequest !== undefined) {
          const windowWaitTime = this.config.windowMs - (now - oldestRequest);
          estimatedWaitTime = Math.max(estimatedWaitTime, windowWaitTime);
        }
      }
      
      // 最小遅延による待機時間
      const lastRequestTime = this.requestHistory[this.requestHistory.length - 1] || 0;
      const minDelayWaitTime = this.config.minDelay - (now - lastRequestTime);
      estimatedWaitTime = Math.max(estimatedWaitTime, minDelayWaitTime);
    }
    
    return {
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      requestsInWindow: this.requestHistory.length,
      estimatedWaitTime: Math.max(0, estimatedWaitTime)
    };
  }
  
  /**
   * リセット
   */
  reset(): void {
    this.requestQueue = [];
    this.activeRequests = 0;
    this.requestHistory = [];
  }
}

/**
 * シンプルなレート制限実装
 */
export class SimpleRateLimiter {
  private lastRequestTime = 0;
  
  constructor(private minDelay: number = 3000) {}
  
  async wait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minDelay) {
      const waitTime = this.minDelay - timeSinceLastRequest;
      console.log(`レート制限: ${waitTime}ms待機中...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }
}

/**
 * ドメイン別レート制限管理
 */
export class DomainRateLimiter {
  private limiters = new Map<string, AdvancedRateLimiter>();
  private domainConfigs = new Map<string, RateLimitConfig>();
  
  /**
   * ドメイン設定を追加
   */
  setDomainConfig(domain: string, config: RateLimitConfig): void {
    this.domainConfigs.set(domain, config);
  }
  
  /**
   * ドメインのレート制限取得
   */
  private getLimiter(domain: string): AdvancedRateLimiter {
    if (!this.limiters.has(domain)) {
      const config = this.domainConfigs.get(domain) || {
        requests: 20,
        windowMs: 60000, // 1分
        maxConcurrent: 1,
        minDelay: 3000
      };
      
      this.limiters.set(domain, new AdvancedRateLimiter(config));
    }
    
    return this.limiters.get(domain)!;
  }
  
  /**
   * リクエスト実行許可を取得
   */
  async acquire(url: string): Promise<() => void> {
    const domain = new URL(url).hostname;
    const limiter = this.getLimiter(domain);
    
    await limiter.acquire();
    
    return () => limiter.release();
  }
  
  /**
   * ドメイン統計取得
   */
  getDomainStats(domain: string) {
    const limiter = this.limiters.get(domain);
    return limiter ? limiter.getStats() : null;
  }
  
  /**
   * 全ドメイン統計取得
   */
  getAllStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {};

    for (const [domain, limiter] of this.limiters) {
      stats[domain] = limiter.getStats();
    }

    return stats;
  }
}

/**
 * 指数バックオフ実装
 */
export class ExponentialBackoff {
  constructor(
    private baseDelay: number = 1000,
    private maxDelay: number = 30000,
    private factor: number = 2,
    private jitter: boolean = true
  ) {}
  
  /**
   * 試行回数に基づく遅延時間計算
   */
  getDelay(attempt: number): number {
    let delay = this.baseDelay * Math.pow(this.factor, attempt);
    delay = Math.min(delay, this.maxDelay);
    
    if (this.jitter) {
      // ジッターを追加して同時リクエストを分散
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }
  
  /**
   * 遅延実行
   */
  async wait(attempt: number): Promise<void> {
    const delay = this.getDelay(attempt);
    console.log(`指数バックオフ: ${delay}ms待機 (試行${attempt + 1}回目)`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * リクエスト実行統計
 */
export class RequestStats {
  private requests: Array<{
    timestamp: number;
    duration: number;
    success: boolean;
    url: string;
    error?: string;
  }> = [];
  
  /**
   * リクエスト記録
   */
  recordRequest(
    url: string,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    this.requests.push({
      timestamp: Date.now(),
      duration,
      success,
      url,
      error
    });
    
    // 古いデータを削除（24時間以上前）
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.requests = this.requests.filter(req => req.timestamp > cutoff);
  }
  
  /**
   * 統計計算
   */
  getStats(timeWindow: number = 60 * 60 * 1000): {
    totalRequests: number;
    successRate: number;
    averageDuration: number;
    requestsPerMinute: number;
    errors: string[];
  } {
    const cutoff = Date.now() - timeWindow;
    const recentRequests = this.requests.filter(req => req.timestamp > cutoff);
    
    const totalRequests = recentRequests.length;
    const successfulRequests = recentRequests.filter(req => req.success).length;
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
    
    const totalDuration = recentRequests.reduce((sum, req) => sum + req.duration, 0);
    const averageDuration = totalRequests > 0 ? totalDuration / totalRequests : 0;
    
    const requestsPerMinute = (totalRequests / (timeWindow / 1000)) * 60;
    
    const errors = recentRequests
      .filter(req => !req.success && req.error)
      .map(req => req.error!)
      .slice(-10); // 最新10件のエラー
    
    return {
      totalRequests,
      successRate,
      averageDuration,
      requestsPerMinute,
      errors
    };
  }
}

// デフォルト設定
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  'kakaku.com': {
    requests: 20,
    windowMs: 60000, // 1分
    maxConcurrent: 1,
    minDelay: 3000   // 3秒
  },
  'scraping-for-beginner.herokuapp.com': {
    requests: 60,
    windowMs: 60000, // 1分
    maxConcurrent: 2,
    minDelay: 1000   // 1秒
  },
  'default': {
    requests: 30,
    windowMs: 60000, // 1分
    maxConcurrent: 2,
    minDelay: 2000   // 2秒
  }
};

// グローバルインスタンス
export const globalDomainLimiter = new DomainRateLimiter();
export const globalStats = new RequestStats();
export const globalBackoff = new ExponentialBackoff();

// 初期化
Object.entries(DEFAULT_RATE_LIMITS).forEach(([domain, config]) => {
  globalDomainLimiter.setDomainConfig(domain, config);
});

/**
 * ヘルパー関数: リクエスト実行とレート制限
 */
export async function executeWithRateLimit<T>(
  url: string,
  requestFunction: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  const release = await globalDomainLimiter.acquire(url);
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    
    try {
      const result = await requestFunction();
      const duration = Date.now() - startTime;
      
      globalStats.recordRequest(url, duration, true);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      lastError = error as Error;
      
      globalStats.recordRequest(url, duration, false, lastError.message);
      
      if (attempt < maxRetries) {
        await globalBackoff.wait(attempt);
      }
    } finally {
      if (attempt === maxRetries) {
        release();
      }
    }
  }
  
  release();
  throw lastError;
}