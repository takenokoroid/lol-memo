import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/shared/components/AuthProvider'
import { Header } from '@/shared/components/Header'

export const metadata: Metadata = {
  title: 'LoL Memo - League of Legends チャンピオンメモアプリ',
  description: 'League of Legendsのチャンピオン情報と対面メモを管理するアプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
