export function TodaysOverview({
  total,
  typeCounts,
}: {
  total: number
  typeCounts: Array<{ label: string; count: number }>
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-base font-medium mb-4">Today&apos;s Overview</div>

      <div className="space-y-4">
        <Row label="Total Events" value={total} />
        {typeCounts.slice(0, 2).map((t) => (
          <Row key={t.label} label={t.label} value={t.count} />
        ))}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
