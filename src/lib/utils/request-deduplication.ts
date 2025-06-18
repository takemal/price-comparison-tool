// lib/utils/request-deduplication.ts - 重複リクエスト防止

type PendingRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

/**
 * ⚡ リクエスト重複排除クラス
 * 同じAPIが短時間で複数回呼ばれるのを防ぐ
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private readonly timeout = 30000; // 30秒でタイムアウト

  /**
   * 重複排除してリクエスト実行
   */
  async execute<T>(
    key: string,
    requestFunction: () => Promise<T>
  ): Promise<T> {
    const now = Date.now();
    
    // 既存の実行中リクエストをチェック
    const existing = this.pendingRequests.get(key);
    if (existing) {
      const age = now - existing.timestamp;
      
      // タイムアウトしていない場合は既存のPromiseを返す
      if (age < this.timeout) {
        console.log(`⚡ 重複リクエスト検出: ${key} (${age}ms前に開始)`);
        return existing.promise;
      } else {
        // タイムアウトした場合は削除
        this.pendingRequests.delete(key);
      }
    }

    // 新しいリクエストを作成
    console.log(`⚡ 新規リクエスト開始: ${key}`);
    const promise = requestFunction();
    
    // ペンディングリストに追加
    this.pendingRequests.set(key, {
      promise,
      timestamp: now
    });

    // 完了時にペンディングリストから削除
    promise
      .finally(() => {
        this.pendingRequests.delete(key);
        console.log(`⚡ リクエスト完了: ${key}`);
      })
      .catch(() => {
        // エラーハンドリングは呼び出し元で行う
      });

    return promise;
  }

  /**
   * 統計情報
   */
  getStats() {
    const now = Date.now();
    const activeRequests = Array.from(this.pendingRequests.entries()).map(([key, req]) => ({
      key,
      age: now - req.timestamp
    }));

    return {
      activeRequests: activeRequests.length,
      requests: activeRequests
    };
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.timeout) {
        this.pendingRequests.delete(key);
        console.log(`⚡ タイムアウトリクエスト削除: ${key}`);
      }
    }
  }
}

// グローバルインスタンス
export const globalDeduplicator = new RequestDeduplicator();

/**
 * ヘルパー関数：検索リクエストキー生成
 */
export function createSearchKey(filters: {
  keyword: string;
  sortBy?: string;
  maxResults?: number;
  minPrice?: number;
  maxPrice?: number;
}): string {
  const parts = [
    filters.keyword,
    filters.sortBy || 'default',
    filters.maxResults || 20,
    filters.minPrice || '',
    filters.maxPrice || ''
  ];
  
  return `search_${parts.join('_')}`;
}