// lib/scrapers/vercel-puppeteer.ts - Vercel対応版
import { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
export const runtime = 'nodejs';
let _puppeteer: typeof import('puppeteer-core');

/**
 * Vercel対応版 Puppeteerブラウザ起動設定
 */
export class VercelPuppeteerManager {
  private browser: Browser | null = null;
  private isInitialized = false;
  
  /**
   * Vercel環境対応のブラウザ初期化
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.browser) return;

    try {
      console.log('🚀 Puppeteer初期化開始...');
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';

      if (isProduction && isVercel) {
        console.log('📦 本番(Vercel): puppeteer-core + chromium-min');

        _puppeteer = await import('puppeteer-core');

        const executablePath = await chromium.executablePath();

        if (!executablePath) {
          throw new Error('❌ chromium.executablePath() が null を返しました。');
        }

        this.browser = await _puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless === 'shell' ? true : chromium.headless,
          ignoreHTTPSErrors: true,
        });
      } else {
        console.log('💻 開発環境: puppeteer フル版');

const devPuppeteer = await import('puppeteer');
_puppeteer = devPuppeteer as unknown as typeof import('puppeteer-core');

        this.browser = await _puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--window-size=1200,800'
          ],
        });
      }

      this.isInitialized = true;
      console.log('✅ Puppeteer初期化成功');
    } catch (err) {
      console.error('❌ Puppeteer初期化エラー:', err);
      throw err;
    }
  }
  
  /**
   * ページ作成（共通設定付き）
   */
  async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('ブラウザが初期化されていません');
    }
    
    const page = await this.browser.newPage();
    
    // 共通設定
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setViewport({ width: 1200, height: 800 });
    
    // リクエストインターセプション（パフォーマンス最適化）
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      const url = req.url();
      
      // 必要なリソースのみ許可
      if (
        resourceType === 'document' || 
        (resourceType === 'script' && url.includes('kakaku.com')) ||
        (resourceType === 'image' && url.includes('kakaku.k-img.com'))
      ) {
        req.continue();
      } else {
        req.abort();
      }
    });
    
    return page;
  }
  
  /**
   * 安全なページアクセス
   */
  async safePage(url: string): Promise<{ page: Page; response: any }> {
    const page = await this.createPage();
    
    try {
      console.log(`🌐 ページアクセス: ${url}`);
      
      const response = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      
      if (!response || !response.ok()) {
        throw new Error(`ページアクセス失敗: ${response?.status()}`);
      }
      
      // 基本的な待機
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return { page, response };
      
    } catch (error) {
      await page.close();
      throw error;
    }
  }
  
  /**
   * クリーンアップ
   */
  async cleanup(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.isInitialized = false;
        console.log('🧹 Puppeteerクリーンアップ完了');
      }
    } catch (error) {
      console.warn('⚠️ クリーンアップエラー:', error);
    }
  }
  
  /**
   * ブラウザ状態確認
   */
  isReady(): boolean {
    return this.isInitialized && this.browser !== null;
  }
  
  /**
   * 環境情報取得
   */
  getEnvironmentInfo() {
    return {
      isProduction: process.env.NODE_ENV === 'production',
      isVercel: process.env.VERCEL === '1',
      platform: process.platform,
      nodeVersion: process.version,
      puppeteerMode: this.isInitialized ? 'initialized' : 'not_initialized'
    };
  }
}

// グローバルインスタンス（シングルトン）
export const vercelPuppeteer = new VercelPuppeteerManager();