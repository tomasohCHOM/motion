import { SignedIn, UserButton } from '@clerk/clerk-react'
import { Logo } from '../common/logo'
import type React from 'react'

export const UserNavbar: React.FC = () => {
  return (
    <nav className="z-10 bg-background p-4 fixed flex w-full top-0 items-center justify-between border border-b-border">
      <div className="flex items-center gap-2">
        <Logo /> <span className="text-lg font-semibold">Motion</span>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  )
}
