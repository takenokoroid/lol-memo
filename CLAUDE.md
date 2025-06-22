# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

League of Legends APIを使用したメモアプリケーション。Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 で構築。各チャンピオンの戦略メモと対面情報を管理。

## 技術スタック

- **Framework**: Next.js 15.3.4 (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **状態管理**: Jotai (グローバル状態)
- **データ取得**: useSWR (サーバー状態とキャッシュ管理)
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth (SSR対応)
- **フォーム**: React Hook Form + Zod
- **テスト**: Jest + React Testing Library + MSW
- **ビジュアルテスト**: Storybook + Chromatic
- **リンター**: ESLint (Next.js Core Web Vitals準拠)

## コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# テスト実行
npm test

# テストウォッチモード
npm run test:watch

# カバレッジレポート生成
npm run test:coverage

# 単一テストファイルの実行
npm test -- src/features/champions/api/getChampions.test.ts

# 特定のテストケースのみ実行
npm test -- -t "チャンピオン一覧を取得"

# Storybook起動
npm run storybook

# Storybookビルド
npm run build-storybook

# Chromatic実行（プロジェクトトークン設定が必要）
npm run chromatic
```

## アーキテクチャ概要

### Features設計
ドメイン駆動設計に基づく機能別モジュール構成：

```
src/
├── app/                    # Next.js App Router
├── features/              # 機能別モジュール
│   ├── auth/             # 認証機能
│   ├── champions/        # チャンピオン情報管理
│   ├── matches/          # 試合データ（将来実装）
│   └── notes/            # メモ機能
└── shared/               # 共通コンポーネント・ユーティリティ
    ├── components/
    ├── hooks/
    ├── lib/              # 外部サービス連携
    │   ├── supabase/
    │   └── riot-api/
    └── types/
```

### データベーススキーマ
- **notes**: ユーザーごとのチャンピオンメモ（タグ機能付き）
- **champion_notes_settings**: チャンピオン別設定（ビルド、ロール等）
- **matchup_notes**: チャンピオンvs対面チャンピオンのメモ（実装済み）

すべてのテーブルでRow Level Security (RLS) を有効化し、`auth.uid()` ベースのアクセス制御を実装。

### 認証とルート保護
- **保護されたルート**: `/notes/*`, `/champions/*`
- **認証フロー**: Supabase Auth (SSR対応Cookie管理)
- **ミドルウェア**: `src/middleware.ts` で認証チェック

### API統合
- Riot Games APIは `/api/riot/[...path]` でプロキシ実装
- レート制限を考慮した実装が必要
- Data Dragon（DDragon）からのチャンピオン画像を使用

## テスト戦略

### カバレッジ目標
- 全体のカバレッジ目標: 70%以上（branches, functions, lines, statements）
- 新規コードは必ずテストを含める

### テスト作成ガイドライン
- **APIテスト**: MSWを使用してモック作成
- **コンポーネントテスト**: React Testing Library使用
- **ビジュアルテスト**: Storybookストーリー作成
- **アクセシビリティ**: a11yアドオンで検証

### テスト設定
- パスエイリアス: `@/` → `src/`
- セットアップ: `jest.setup.js` でDOM、環境変数、Supabase、Next.jsのモック設定
- カバレッジ除外: `.d.ts`、`.stories.tsx`、`index.ts` ファイル

## コード品質基準

### TypeScript
- strict mode有効
- 型定義は必須
- any型の使用を避ける
- パスエイリアス: `@/*` → `./src/*`

### ESLint
- Next.js Core Web Vitalsに準拠
- Storybookプラグイン統合

### Storybook
- すべてのUIコンポーネントにストーリーを作成
- ビューポート設定:
  - Mobile: 375px × 667px
  - Tablet: 768px × 1024px
  - Desktop: 1200px × 800px

## 環境変数の設定

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
RIOT_API_KEY=your-riot-api-key
```

## 開発時の重要ポイント

### 状態管理の使い分け
- **Jotai**: UIステート、クライアントサイドのグローバル状態
- **useSWR**: サーバーデータのフェッチとキャッシュ管理

### セキュリティ
- Supabase RLSによるデータアクセス制御
- 環境変数を通じたAPI鍵の管理
- サーバーサイドでのみRiot API鍵を使用

### パス解決
- TypeScriptとJestの両方で `@/` エイリアスが設定済み
- `@/` は `src/` ディレクトリを指す

### Next.js設定
- 画像最適化: DDragon CDNからの画像取得を許可（`next.config.js`）
- React 19とApp Routerを使用

### 最近の更新
- 対面メモ機能が実装済み（コミット: 9f692d5）
- テスト環境の整備（Jest、MSW、Storybook）
- HMR設定の追加（コミット: ccda7f6）
- チャンピオン表示のグリッド/リスト切り替え機能（コミット: 9e90a93）

## 既知の問題と注意点

### テスト環境
- 現在、一部のテストが失敗している可能性があります（Response is not defined エラー）
- テストカバレッジが目標の70%に達していない場合があります
- テスト実行前に環境変数が正しく設定されているか確認してください

### 開発上の注意
- チャンピオンデータはRiot Games APIのData Dragon (DDragon) から取得
- APIレート制限に注意（特にRiot Games API）
- Supabaseの型定義は `npm run generate-types` で更新可能（package.jsonにスクリプトがある場合）

### コンポーネント設計
- 各featureディレクトリ内で独立性を保つ
- 共通コンポーネントは `src/shared/components` に配置
- feature間の依存は最小限に抑える