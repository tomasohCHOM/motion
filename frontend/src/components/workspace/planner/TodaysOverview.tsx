import { Card } from '@/components/ui/card'

export function TodaysOverview({
  total,
  typeCounts,
}: {
  total: number
  typeCounts: Array<{ label: string; count: number }>
}) {
  return (
    <Card className="rounded-xl border p-4">
      <div className="text-base font-medium mb-2">Today’s Overview</div>
      <div className="text-sm text-muted-foreground mb-3">
        {total} {total === 1 ? 'event' : 'events'}
      </div>
      <div className="flex flex-wrap gap-2">
        {typeCounts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No types yet.</div>
        ) : (
          typeCounts.map((t) => (
            <span
              key={t.label}
              className="rounded-full border px-2 py-0.5 text-xs"
              title={`${t.count} ${t.label}`}
            >
              {t.label} · {t.count}
            </span>
          ))
        )}
      </div>
    </Card>
  )
}
