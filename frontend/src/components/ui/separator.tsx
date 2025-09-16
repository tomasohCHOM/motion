<<<<<<< HEAD
<<<<<<< HEAD
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'

import { cn } from '@/lib/utils'

function Separator({
  className,
  orientation = 'horizontal',
=======
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
=======
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
>>>>>>> 0fb15f3 (Implement note taking (#9))

import { cn } from '@/lib/utils'

function Separator({
  className,
<<<<<<< HEAD
  orientation = "horizontal",
>>>>>>> d903053 (Start working on team workspace UI layout (#6))
=======
  orientation = 'horizontal',
>>>>>>> 0fb15f3 (Implement note taking (#9))
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
<<<<<<< HEAD
<<<<<<< HEAD
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
=======
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
>>>>>>> d903053 (Start working on team workspace UI layout (#6))
=======
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
>>>>>>> 0fb15f3 (Implement note taking (#9))
      )}
      {...props}
    />
  )
}

export { Separator }
import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'

import { cn } from '@/lib/utils'

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
