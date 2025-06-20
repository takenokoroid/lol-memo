# LoL Memo - League of Legends チャンピオンメモアプリ

League of Legendsのチャンピオン情報と戦略メモを管理するWebアプリケーションです。

## 主な機能

- 🏆 **チャンピオンメモ**: 各チャンピオンの戦略、ビルド、プレイスタイルを記録
- ⚔️ **対面メモ**: チャンピオン vs チャンピオンの対面情報を管理（今後実装予定）
- 🔍 **検索・フィルタ**: チャンピオン名、ロール、タグで素早く検索
- 🔐 **ユーザー認証**: 個人のメモを安全に管理

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Jotai
- **データ取得**: useSWR
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **API**: Riot Games API (Data Dragon)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Riot Games API (オプション)
RIOT_API_KEY=your-riot-api-key
```

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でアカウントを作成
2. 新しいプロジェクトを作成
3. SQL Editorで以下のマイグレーションファイルを実行：
   - `supabase/migrations/00001_create_tables.sql`
   - `supabase/migrations/00002_update_for_champion_memo.sql`

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)でアプリケーションが起動します。

## データベーススキーマ

### `notes` テーブル
チャンピオンの基本メモを保存

- `id`: UUID (主キー)
- `user_id`: UUID (ユーザーID)
- `champion_id`: TEXT (チャンピオンID)
- `title`: TEXT (メモタイトル)
- `content`: TEXT (メモ内容)
- `tags`: TEXT[] (タグ)
- `created_at`, `updated_at`: TIMESTAMPTZ

### `matchup_notes` テーブル（今後実装）
チャンピオン対面メモを保存

- `id`: UUID (主キー)
- `user_id`: UUID (ユーザーID)
- `champion_id`: TEXT (メインチャンピオン)
- `opponent_id`: TEXT (対面チャンピオン)
- `content`: TEXT (対面メモ内容)
- `created_at`, `updated_at`: TIMESTAMPTZ

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── champions/         # チャンピオン関連ページ
│   ├── notes/            # メモ関連ページ
│   └── auth/             # 認証ページ
├── features/              # 機能別モジュール
│   ├── auth/             # 認証機能
│   ├── champions/        # チャンピオン機能
│   └── notes/            # メモ機能
└── shared/               # 共通コンポーネント・ユーティリティ
    ├── components/       # 共通コンポーネント
    ├── hooks/           # 共通フック
    ├── lib/             # 外部サービス連携
    └── types/           # 型定義
```

## 使い方

1. **アカウント作成**: 新規登録してアカウントを作成
2. **チャンピオン選択**: チャンピオン一覧からメモを取りたいチャンピオンを選択
3. **メモ作成**: チャンピオンの戦略、ビルド、プレイスタイルなどを記録
4. **タグ付け**: メモにタグを付けて整理
5. **検索・閲覧**: 必要な時に素早くメモを検索・閲覧

## 今後の実装予定

- [ ] 対面メモ機能
- [ ] メモのエクスポート機能
- [ ] チャンピオン統計の表示
- [ ] メモの共有機能
- [ ] モバイルアプリ対応

## コントリビューション

プルリクエストやイシューの報告を歓迎します。

## ライセンス

MIT License