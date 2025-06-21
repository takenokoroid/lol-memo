# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

League of Legends APIを使用したメモアプリケーション。Next.js (App Router) + TypeScript + Tailwind CSS で構築。

## 技術スタック

- **Framework**: Next.js 14+ (App Router)
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

# Storybook起動
npm run storybook

# Storybookビルド
npm run build-storybook

# Chromatic実行
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
- **matchup_notes**: チャンピオンvs対面チャンピオンのメモ

すべてのテーブルでRow Level Security (RLS) を有効化し、`auth.uid()` ベースのアクセス制御を実装。

### 認証とルート保護
- **保護されたルート**: `/notes/*`, `/champions/*`
- **認証フロー**: Supabase Auth (SSR対応Cookie管理)
- **ミドルウェア**: `src/middleware.ts` で認証チェック

### API統合
- Riot Games APIは `/api/riot/[...path]` でプロキシ実装
- レート制限を考慮した実装が必要

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