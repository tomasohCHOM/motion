import { useEffect } from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { ManagerHeader } from '@/components/workspace/manager/header'
import { Board } from '@/components/workspace/manager/board'
import EditTask from '@/components/workspace/manager/edit'
import { useWorkspaceTasksQuery } from '@/client/tasks/workspaceTasksQuery'
import { kanbanActions } from '@/store/manager/task-store'
import { transformBackendTasksToColumns } from '@/utils/taskTransform'
import { Spinner } from '@/components/ui/spinner'

export const Route = createFileRoute('/workspace/$workspaceId/manager/')({
  component: WorkspaceManager,
})

function WorkspaceManager() {
  const { workspaceId } = useParams({
    from: '/workspace/$workspaceId/manager/',
  })
  const {
    data: backendTasks,
    isLoading,
    error,
  } = useWorkspaceTasksQuery(workspaceId)

  // Sync backend data to store
  useEffect(() => {
    if (backendTasks && backendTasks.length >= 0) {
      const columns = transformBackendTasksToColumns(backendTasks)
      kanbanActions.setColumns(columns)
    }
  }, [backendTasks])

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
      <EditTask />
    </>
  )
}
