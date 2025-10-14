import * as React from 'react'

export function TodaysOverview({
  total,
  typeCounts,
}: {
  total: number
  typeCounts: Array<{ label: string; count: number }>
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-base font-medium mb-3">Today's Overview</div>
      <div className="space-y-2">
        <OverviewRow label="Total Events" value={total} />
        {typeCounts.map(({ label, count }) => (
          <OverviewRow key={label.toLowerCase()} label={label} value={count} />
        ))}
      </div>
    </div>
  )
}

function OverviewRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-3 py-2">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  )
}
