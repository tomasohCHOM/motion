export const mockManagerTestData = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      {
        id: '1',
        title: 'Backend Doc Reading',
        description:
          'Understand design doc to develop microservices architecture',
        assignee: { name: 'Josh Holman' },
        priority: 'low',
        tags: ['Backend', 'API'],
      },
      {
        id: '2',
        title: 'Workspace Notes Page',
        description: 'For creating notes within workspaces',
        assignee: { name: 'Donovan Bosson' },
        priority: 'medium',
        tags: ['Frontend', 'Design'],
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      {
        id: '3',
        title: 'Authentication',
        description: 'Working on user registration + auth with Clerk',
        assignee: { name: 'Nathan Chen' },
        priority: 'high',
        dueDate: '2025-09-11',
        tags: ['Auth', 'User registration'],
      },
    ],
  },
  {
    id: 'review',
    title: 'Review',
    tasks: [
      {
        id: '5',
        title: 'Workspace Manager Page',
        description:
          'UI design for the manager page; includes Kanban board for managing tasks',
        assignee: { name: 'Tomas Oh', avatar: '/avatars/david.png' },
        priority: 'high',
        dueDate: '2025-09-05',
        tags: ['Design', 'Frontend'],
      },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      {
        id: '6',
        title: 'Infrastructure',
        description: 'Set up motion infrastructure with Terraform',
        assignee: { name: 'Joshua Holman' },
        priority: 'high',
        tags: ['Backend', 'Infrastructure'],
      },
    ],
  },
]
