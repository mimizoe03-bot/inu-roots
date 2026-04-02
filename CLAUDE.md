# いぬルーツ — CLAUDE.md

## プロジェクト概要
血統書から犬の家系を登録・可視化し、犬仲間とつながるペットオーナー向けSNSプラットフォーム。

## 技術スタック
- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS v4（@theme ブロックでカスタムカラー定義）
- Supabase（PostgreSQL + Auth + Storage + Realtime）
- Anthropic API (claude-sonnet-4-20250514)
- Replicate (recraft-v3)
- React Flow（家系図）
- framer-motion（アニメーション）

## コーディングルール
- `any` 型禁止 → `unknown` を使う
- Supabase クエリは必ず `try/catch`
- API Route は必ず認証チェック（`supabase.auth.getUser()`）
- コメントは日本語
- 画像アップロード：最大5MB、jpg/png/webpのみ（`validateImageFile()` を使う）

## デザインシステム
globals.css の CSS カスタムプロパティを使用：
- `var(--color-background)` / `var(--color-surface)` / `var(--color-surface-2)`
- `var(--color-gold-400)` がメインアクセント
- `var(--color-cream-*)` がテキスト系
- `.btn-gold` / `.btn-ghost` / `.card-luxury` / `.input-luxury` / `.badge-gold`
- `text-gradient-gold` でゴールドグラデーションテキスト

## ディレクトリ
- `app/(auth)/` → ログイン・登録ページ
- `app/(dashboard)/` → ログイン必須ページ（layout.tsx で認証チェック）
- `app/api/` → API Routes（全て認証必須）
- `components/dogs/` → 犬関連コンポーネント
- `components/layout/` → サイドバー等レイアウト
- `lib/supabase/` → クライアント・サーバー・型定義
- `supabase/migrations/` → DBマイグレーション

## Supabase Storageバケット
- バケット名: `dog-photos`（公開バケット）
- パス形式: `{userId}/{uuid}.{ext}` または `{userId}/ai-portraits/{dogId}.webp`
