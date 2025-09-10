import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Props = {
  isAdding: boolean
  isDialogOpen: boolean
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const EditTask: React.FC<Props> = ({
  isAdding,
  isDialogOpen,
  setIsDialogOpen,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <form>
        <DialogContent className="sm:max-w-[30rem]">
          <DialogHeader>
            <DialogTitle>
              {isAdding ? 'Add a new task' : 'Edit a task'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="task-title">Task Title</Label>
              <Input id="task-title" name="task-title" placeholder="Title" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="task-status">Task Status</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Indicate task status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kanban Column</SelectLabel>
                    <SelectItem value="to-do">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="labels">Labels</Label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="(Optional) Add labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Labels</SelectLabel>
                    <SelectItem value="web-design">
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        Web Design
                      </Badge>
                    </SelectItem>
                    <SelectItem value="backend">
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        Backend
                      </Badge>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isAdding ? 'Add task' : 'Edit task'}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export default EditTask
