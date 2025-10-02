import type React from 'react'

export default function PageContent({
  children,
}: {
  children: React.ReactNode
}) {
  return <main className="flex pt-16 flex-col w-full gap-8">{children}</main>
}
