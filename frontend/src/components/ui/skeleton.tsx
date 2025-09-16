<<<<<<< HEAD
<<<<<<< HEAD
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
=======
import { cn } from "@/lib/utils"
=======
import { cn } from '@/lib/utils'
>>>>>>> 0fb15f3 (Implement note taking (#9))

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
<<<<<<< HEAD
      className={cn("bg-accent animate-pulse rounded-md", className)}
>>>>>>> d903053 (Start working on team workspace UI layout (#6))
=======
      className={cn('bg-accent animate-pulse rounded-md', className)}
>>>>>>> 0fb15f3 (Implement note taking (#9))
      {...props}
    />
  )
}

export { Skeleton }
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
