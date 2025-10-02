import { Board } from './board'
import { ManagerHeader } from './header'
import EditTask from './edit'

export default function WorkspaceManager() {
  return (
    <>
      <ManagerHeader />
      <Board />
      <EditTask />
    </>
  )
}
