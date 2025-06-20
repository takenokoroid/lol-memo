# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

League of Legends APIを使用したメモアプリケーション。Next.js (App Router) + TypeScript + Tailwind CSS で構築。

## 技術スタック

- **Framework**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: Jotai
- **データ取得**: useSWR
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **フォーム**: React Hook Form + Zod
- **リンター**: ESLint

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

# リント修正
npm run lint:fix
```

## ディレクトリ構造

Features設計を採用：

```
src/
├── app/                    # Next.js App Router
├── features/              # 機能別モジュール
│   ├── auth/             # 認証機能
│   ├── champions/        # チャンピオン情報
│   ├── matches/          # 試合データ
│   └── notes/            # メモ機能
└── shared/               # 共通コンポーネント・ユーティリティ
    ├── components/
    ├── hooks/
    ├── lib/              # 外部サービス連携
    │   ├── supabase/
    │   └── riot-api/
    └── types/
```

## 重要な設定ファイル

- `.env.local`: 環境変数（Supabase URL/Key, Riot API Key）
- `supabase/migrations/`: データベーススキーマ
- `src/middleware.ts`: 認証保護ルート設定

## 開発時の注意点

### データベース
- Supabaseを使用、Row Level Security (RLS) を有効化
- テーブル: `notes`, `champion_notes_settings`

### API
- Riot Games APIは `/api/riot/[...path]` でプロキシ
- レート制限を考慮した実装

### 認証
- Supabase Authを使用
- 保護されたルート: `/notes`, `/champions`
- middleware.tsで認証チェック

### 状態管理
- Jotaiでグローバル状態管理
- useSWRでサーバー状態とキャッシュ管理

## 環境変数の設定

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
RIOT_API_KEY=your-riot-api-key
```