import PageContent from '@/components/workspace/layout/page-content'
import { Board } from './board'
import { ManagerHeader } from './header'
import EditTask from './edit'

export default function WorkspaceManager() {
  return (
    <PageContent>
      <EditTask isAdding={true} />
      <ManagerHeader />
      <Board />
    </PageContent>
  )
}
