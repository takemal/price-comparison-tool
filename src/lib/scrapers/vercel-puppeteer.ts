// lib/scrapers/vercel-puppeteer.ts - Vercel対応版
import puppeteer, { Browser, Page } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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
      console.log('🚀 Vercel対応 Puppeteer初期化開始...');
      const startTime = Date.now();
      
      // 本番環境（Vercel）と開発環境の判定
      const isProduction = process.env.NODE_ENV === 'production';
      const isVercel = process.env.VERCEL === '1';
      
      let browserConfig: any;
      
      if (isProduction && isVercel) {
        console.log('📦 Vercel本番環境: @sparticuz/chromium使用');
        
        // Vercel本番環境設定
        browserConfig = {
          args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-ipc-flooding-protection',
            '--window-size=1200,800'
          ],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
          ignoreHTTPSErrors: true,
          timeout: 30000
        };
        
      } else {
        console.log('💻 ローカル開発環境: システムChrome使用');
        
        // ローカル開発環境設定
        browserConfig = {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--window-size=1200,800'
          ],
          timeout: 15000
        };
      }
      
      this.browser = await puppeteer.launch(browserConfig);
      this.isInitialized = true;
      
      const initTime = Date.now() - startTime;
      console.log(`✅ Puppeteer初期化完了: ${initTime}ms (${isProduction ? 'Vercel' : 'Local'})`);
      
    } catch (error) {
      console.error('❌ Puppeteer初期化エラー:', error);
      throw new Error(`ブラウザ初期化失敗: ${error}`);
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