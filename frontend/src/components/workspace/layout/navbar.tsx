import { SignedIn, UserButton } from '@clerk/clerk-react'

type Props = {
  workspaceName: string
}

export const WorkspaceNavbar: React.FC<Props> = ({ workspaceName }) => {
  return (
    <nav
      className="fixed top-0 right-0 left-0 flex items-center justify-between
      border-b border-sidebar-border p-5 bg-background z-10 md:left-[16rem]"
    >
      <span className="font-semibold">{workspaceName}</span>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  )
}
