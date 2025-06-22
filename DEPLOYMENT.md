# Vercelデプロイガイド

## 前提条件

- Vercelアカウントの作成
- GitHubリポジトリとの連携
- Supabaseプロジェクトの作成
- Riot Games API Keyの取得

## Vercelでの環境変数設定

Vercelダッシュボードの `Settings` > `Environment Variables` で以下の環境変数を設定してください：

### 必須環境変数

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | Supabaseダッシュボード > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | Supabaseダッシュボード > Settings > API |
| `RIOT_API_KEY` | Riot Games APIキー | [Riot Developer Portal](https://developer.riotgames.com/) |

### 環境別設定

#### Production環境
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

#### Preview環境
本番環境と同じ値を設定するか、開発用のSupabaseプロジェクトを使用してください。

## デプロイ手順

### 1. GitHubリポジトリとの連携

1. Vercelダッシュボードで `New Project` をクリック
2. GitHubリポジトリを選択
3. プロジェクト設定で以下を確認：
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2. カスタムドメイン設定（オプション）

1. Vercelダッシュボードで `Settings` > `Domains`
2. カスタムドメインを追加
3. DNS設定でCNAMEレコードを追加

### 3. デプロイ後の確認

以下の項目を確認してください：

- [ ] 認証機能が正常に動作する
- [ ] Supabaseとの接続が確立される
- [ ] Riot Games APIからのデータ取得が可能
- [ ] 画像の表示が正常に行われる（Data Dragon CDN）
- [ ] ミドルウェアによる認証保護が機能する

## トラブルシューティング

### よくある問題

#### 1. 環境変数が認識されない
- 環境変数名が正確に設定されているか確認
- 再デプロイを実行（`Deployments` > `...` > `Redeploy`）

#### 2. Supabase接続エラー
- Supabase URLとAnon Keyが正しいか確認
- Supabaseプロジェクトの状態を確認
- RLS（Row Level Security）ポリシーが正しく設定されているか確認

#### 3. Riot API接続エラー
- API Keyが有効期限内か確認
- レート制限に達していないか確認
- APIキーの権限設定を確認

#### 4. ビルドエラー
- `npm run build` をローカルで実行して事前確認
- TypeScriptエラーを解決
- ESLintエラーを解決

### ログの確認

デプロイメントログとランタイムログは以下で確認できます：

1. **ビルドログ**: `Deployments` > 該当のデプロイメント
2. **ランタイムログ**: `Functions` > `View Function Logs`

## パフォーマンス最適化

### 1. 画像最適化
- Next.js Image コンポーネントを使用
- Data Dragon CDN からの画像は自動最適化される

### 2. API最適化
- SWRキャッシュによるリクエスト最適化
- Riot APIのレート制限を考慮した実装

### 3. ビルド最適化
- Tree shaking による不要コードの除去
- Package imports の最適化

## セキュリティ

### 1. 環境変数の管理
- 秘密情報は環境変数で管理
- `NEXT_PUBLIC_` プレフィックスの使用に注意

### 2. API セキュリティ
- Supabase RLS によるデータアクセス制御
- ミドルウェアによる認証チェック

### 3. CORS設定
- vercel.json でCORSヘッダーを適切に設定

## モニタリング

### 1. アクセス解析
- Vercel Analytics を有効化
- Core Web Vitals の監視

### 2. エラー監視
- ランタイムエラーの監視
- API エラーレートの監視

### 3. パフォーマンス監視
- レスポンスタイムの監視
- 関数実行時間の監視

---

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Riot Games API](https://developer.riotgames.com/)