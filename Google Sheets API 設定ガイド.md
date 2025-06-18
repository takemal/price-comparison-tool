# 🔧 Google Sheets API 設定ガイド

## 📋 必要な手順一覧

### **1. Google Cloud Console プロジェクト作成**

1. **Google Cloud Console** にアクセス
   - URL: https://console.cloud.google.com/
   - Googleアカウントでログイン

2. **新しいプロジェクトを作成**
   - 画面上部の「プロジェクトを選択」をクリック
   - 「新しいプロジェクト」を選択
   - プロジェクト名: `price-comparison-tool`
   - 「作成」をクリック

### **2. Google Sheets API の有効化**

1. **APIライブラリに移動**
   - 左側メニュー → 「APIとサービス」 → 「ライブラリ」

2. **Google Sheets API を検索**
   - 検索ボックスに「Google Sheets API」と入力
   - 「Google Sheets API」をクリック
   - 「有効にする」をクリック

3. **Google Drive API も有効化** (必要に応じて)
   - 同様に「Google Drive API」を検索
   - 「有効にする」をクリック

### **3. サービスアカウントの作成**

1. **認証情報ページに移動**
   - 左側メニュー → 「APIとサービス」 → 「認証情報」

2. **サービスアカウントを作成**
   - 「認証情報を作成」 → 「サービスアカウント」をクリック
   - サービスアカウント名: `sheets-service-account`
   - サービスアカウントID: `sheets-service-account`
   - 説明: `Price comparison tool sheets integration`
   - 「作成して続行」をクリック

3. **権限設定**
   - ロールを選択: 「編集者」または「Google Sheets API」の権限
   - 「続行」をクリック
   - 「完了」をクリック

### **4. 認証キーの生成**

1. **作成したサービスアカウントをクリック**
   - 認証情報ページのサービスアカウント一覧から選択

2. **キーを生成**
   - 「キー」タブをクリック
   - 「鍵を追加」 → 「新しい鍵を作成」
   - キーのタイプ: **JSON** を選択
   - 「作成」をクリック

3. **JSONファイルをダウンロード**
   - 自動的にダウンロードされるJSONファイルを保存
   - ⚠️ このファイルは秘密情報なので安全に保管

### **5. 環境変数の設定**

ダウンロードしたJSONファイルから以下の情報を抽出：

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "sheets-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### **6. ローカル環境変数ファイル作成**

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# Google Sheets API 認証情報
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# オプション: デフォルトスプレッドシートID
DEFAULT_SPREADSHEET_ID=your-default-spreadsheet-id
```

### **7. Vercel環境変数設定**

Vercelにデプロイする場合：

1. **Vercel Dashboard** にアクセス
2. プロジェクトの「Settings」 → 「Environment Variables」
3. 以下の変数を追加：
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: サービスアカウントのメールアドレス
   - `GOOGLE_PRIVATE_KEY`: プライベートキー（改行も含めて全て）

### **8. 初回テスト用スプレッドシート作成**

1. **Google Sheets** にアクセス
   - URL: https://sheets.google.com/
   - 新しいスプレッドシートを作成
   - 名前: `価格比較テストデータ`

2. **サービスアカウントに共有権限を付与**
   - スプレッドシートの「共有」をクリック
   - サービスアカウントのメールアドレスを追加
   - 権限: 「編集者」を設定
   - 「送信」をクリック

3. **スプレッドシートIDを取得**
   - URLから ID を抽出: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - この ID を `.env.local` の `DEFAULT_SPREADSHEET_ID` に設定

## ✅ 設定完了チェックリスト

- [ ] Google Cloud Console プロジェクト作成
- [ ] Google Sheets API 有効化
- [ ] サービスアカウント作成
- [ ] 認証キー（JSON）ダウンロード
- [ ] 環境変数ファイル（.env.local）作成
- [ ] テスト用スプレッドシート作成・共有
- [ ] スプレッドシートID取得

## 🚨 セキュリティ注意事項

1. **JSONキーファイルをGitにコミットしない**
   - `.gitignore` に `.env.local` が含まれていることを確認

2. **本番環境では環境変数を使用**
   - 直接コードにキーを埋め込まない

3. **最小権限の原則**
   - 必要最小限の権限のみを付与

## 🔧 トラブルシューティング

### **よくあるエラーと解決方法**

**エラー: "The caller does not have permission"**
- サービスアカウントがスプレッドシートに共有されているか確認
- Google Sheets API が有効化されているか確認

**エラー: "Invalid credentials"**
- 環境変数が正しく設定されているか確認
- プライベートキーの改行文字（\n）が正しく設定されているか確認

**エラー: "Requested entity was not found"**
- スプレッドシートIDが正しいか確認
- スプレッドシートが削除されていないか確認

次のステップで連携画面の実装に進みます！