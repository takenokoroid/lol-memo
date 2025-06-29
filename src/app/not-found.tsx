import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-6xl font-extrabold text-gray-900">404</h2>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ページが見つかりません
          </p>
          <p className="mt-2 text-sm text-gray-600">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}