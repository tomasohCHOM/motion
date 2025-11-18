import { useEffect } from 'react'
import {
  createFileRoute,
  useLoaderData,
  useParams,
} from '@tanstack/react-router'
import { ManagerHeader } from '@/components/workspace/manager/header'
import { Board } from '@/components/workspace/manager/board'
import EditTask from '@/components/workspace/manager/edit'
import { useWorkspaceTasksQuery } from '@/client/tasks/workspaceTasksQuery'
import { kanbanActions } from '@/store/manager/task-store'
import { Spinner } from '@/components/ui/spinner'
import { transformTasksToColumns } from '@/utils/taskTransform'

export const Route = createFileRoute('/workspace/$workspaceId/manager/')({
  component: WorkspaceManager,
})

function WorkspaceManager() {
  const { workspaceUsers } = useLoaderData({ from: '/workspace/$workspaceId' })
  const { workspaceId } = useParams({
    from: '/workspace/$workspaceId/manager/',
  })

  const { data: tasks, isLoading, error } = useWorkspaceTasksQuery(workspaceId)

  // Sync backend data to store
  useEffect(() => {
    if (tasks && tasks.length >= 0) {
      const columns = transformTasksToColumns(tasks)
      kanbanActions.setColumns(columns)
    }
  }, [tasks])

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load tasks: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="pt-12 w-full flex justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <>
      <ManagerHeader />
      <Board />
      <EditTask workspaceUsers={workspaceUsers} />
    </>
  )
}
