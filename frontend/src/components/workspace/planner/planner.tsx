import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PlannerPage() {
  const scheduleItems = [
    {
      time: '09:00',
      title: 'Team Standup',
      duration: '30m',
      attendees: 6,
      type: 'meeting',
    },
    {
      time: '14:00',
      title: 'Design Review',
      duration: '1h',
      attendees: 4,
      type: 'meeting',
    },
    {
      time: '17:00',
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

  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return ''
    }
  }

  const date = new Date()
  const dateFrom = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="h-full p-6 bg-background overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-md"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              // TODO: Implement date picker lookahead
              <h2 className="text-lg font-semibold min-w-0">{dateFrom}</h2>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-md"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="h-8 rounded-md gap-1.5 px-3">
              Today
            </Button>
          </div>
          <Button className="h-9 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scheduleItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-sm text-muted-foreground min-w-0 w-16">
                      {item.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        {item.duration && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.duration}
                          </div>
                        )}
                        {item.attendees && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {item.attendees}
                          </div>
                        )}
                        <Badge
                          className={
                            item.type === 'meeting'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Today's Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Events
                  </span>
                  <span>3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Meetings
                  </span>
                  <span>2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Deadlines
                  </span>
                  <span>1</span>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-foreground truncate">
                        {task.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.due}
                      </p>
                    </div>
                    <Badge
                      className={`text-xs ml-2 ${getPriorityBadgeClasses(task.priority)}`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4 h-9 px-4 py-2">
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
