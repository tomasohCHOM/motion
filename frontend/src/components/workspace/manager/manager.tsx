import { Board } from './board'
import { ManagerHeader } from './header'
import EditTask from './edit'
import PageContent from '@/components/workspace/layout/page-content'

export default function WorkspaceManager() {
  return (
    <PageContent>
      <ManagerHeader />
      <Board />
      <EditTask />
    </PageContent>
  )
}
