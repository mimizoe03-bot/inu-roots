/** 愛犬一覧のスケルトンローディング */
function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* 画像スケルトン */}
      <div
        className="h-40 w-full animate-pulse"
        style={{ background: 'var(--color-surface-2)' }}
      />
      {/* テキストスケルトン */}
      <div className="p-4 space-y-3">
        <div
          className="h-5 w-2/3 animate-pulse rounded"
          style={{ background: 'var(--color-surface-2)' }}
        />
        <div
          className="h-3 w-1/2 animate-pulse rounded"
          style={{ background: 'var(--color-surface-2)' }}
        />
        <div className="flex gap-3">
          <div className="h-3 w-12 animate-pulse rounded" style={{ background: 'var(--color-surface-2)' }} />
          <div className="h-3 w-12 animate-pulse rounded" style={{ background: 'var(--color-surface-2)' }} />
        </div>
      </div>
    </div>
  )
}

export default function DogsLoading() {
  return (
    <div>
      {/* ヘッダースケルトン */}
      <div className="mb-8 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 animate-pulse rounded" style={{ background: 'var(--color-surface-2)' }} />
          <div className="h-8 w-32 animate-pulse rounded" style={{ background: 'var(--color-surface-2)' }} />
        </div>
        <div className="h-9 w-20 animate-pulse rounded-md" style={{ background: 'var(--color-surface-2)' }} />
      </div>

      <div className="mb-8 h-px" style={{ background: 'var(--color-border)' }} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
