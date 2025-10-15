import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Zap } from 'lucide-react'
import type React from 'react'

export const UserNavbar: React.FC = () => {
  return (
    <nav className="z-10 bg-background p-4 fixed flex w-full top-0 items-center justify-between border border-b-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold">Motion</span>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  )
}
