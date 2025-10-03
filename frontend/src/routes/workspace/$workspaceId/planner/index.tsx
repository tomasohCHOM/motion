import { createFileRoute } from '@tanstack/react-router'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
} from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/workspace/$workspaceId/planner/')({
  component: PlannerPage,
})

// Mock Data - can be replaced with API calls
const scheduleItems = [
  {
    time: '8:00',
    title: 'Team Standup',
    duration: '29m',
    attendees: 5,
    type: 'meeting',
  },
  {
    time: '13:00',
    title: 'Design Review',
    duration: '1h',
    attendees: 3,
    type: 'meeting',
  },
  {
    time: '16:00',
    title: 'Project Deadline',
    type: 'deadline',
  },
]

const upcomingTasks = [
  {
    title: 'Complete API Documentation',
    due: 'Today',
    priority: 'high',
  },
  {
    title: 'Review Pull Requests',
    due: 'Tomorrow',
    priority: 'medium',
  },
  {
    title: 'Update Design System',
    due: 'This Week',
    priority: 'low',
  },
]

// Helper functions for styling badges
const getPriorityBadgeClasses = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
  }
}

const getTypeBadgeClasses = (type: string) => {
  switch (type) {
    case 'meeting':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100'
    case 'deadline':
      return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100'
  }
}

// Sub-components for cleaner rendering
function ScheduleItemCard({ item }: { item: (typeof scheduleItems)[number] }) {
  return (
    <div className="flex items-center gap-5 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="text-sm text-muted-foreground font-medium min-w-1 w-16">
        {item.time}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground">{item.title}</h3>
        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
          {item.duration && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {item.duration}
            </div>
          )}
          {item.attendees && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {item.attendees}
            </div>
          )}
          <Badge
            variant="outline"
            className={cn('text-xs capitalize', getTypeBadgeClasses(item.type))}
          >
            {item.type}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function UpcomingTaskCard({ task }: { task: (typeof upcomingTasks)[number] }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-foreground truncate">
          {task.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Due: {task.due}</p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          'text-xs ml-3 capitalize',
          getPriorityBadgeClasses(task.priority),
        )}
      >
        {task.priority}
      </Badge>
    </div>
  )
}

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date)
      setIsPopoverOpen(false)
    }
  }

  const handlePrevDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Dynamic overview stats
  const totalEvents = scheduleItems.length
  const meetings = scheduleItems.filter(
    (item) => item.type === 'meeting',
  ).length
  const deadlines = scheduleItems.filter(
    (item) => item.type === 'deadline',
  ).length

  return (
    <div className="h-full p-4 sm:p-6 bg-background overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-md"
                onClick={handlePrevDay}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-lg font-semibold px-3"
                  >
                    {formattedDate}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-md"
                onClick={handleNextDay}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-md gap-1.5 px-3"
              onClick={handleToday}
            >
              Today
            </Button>
          </div>
          <Button className="h-10 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel - Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CalendarIcon className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduleItems.map((item, index) => (
                  <ScheduleItemCard key={index} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Events</span>
                  <span>{totalEvents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Meetings</span>
                  <span>{meetings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Deadlines</span>
                  <span>{deadlines}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <UpcomingTaskCard key={index} task={task} />
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View All Tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
