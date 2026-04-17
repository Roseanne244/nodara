export function Skeleton({ width = '100%', height = 18, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 8, ...style }}
    />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Skeleton width="45%" height={12} />
      <Skeleton width="65%" height={32} />
      {lines > 2 && <Skeleton width="30%" height={12} />}
    </div>
  )
}

export function SkeletonRow({ columns = 5, widths = [] }) {
  return (
    <tr>
      {Array.from({ length: columns }, (_, index) => (
        <td key={index}>
          <Skeleton
            height={14}
            width={widths[index] ?? (index === 0 ? '80%' : index === 2 ? '60%' : '50%')}
          />
        </td>
      ))}
    </tr>
  )
}
