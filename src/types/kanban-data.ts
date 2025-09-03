export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'

export type Task = {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
  tags: string[]
}

export type Column = {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
}

// Create example tasks
export function getExampleTasks(): Task[] {
  const tasks: Task[] = []
  const statuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'done']
  const priorities = ['low', 'medium', 'high'] as const
  const assignees = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Emma Brown']
  const tags = [
    ['Frontend', 'React'],
    ['Backend', 'API'],
    ['Design', 'UI/UX'],
    ['Testing', 'QA'],
    ['Documentation'],
    ['Bug Fix'],
    ['Feature'],
    ['Performance']
  ]

  for (let i = 0; i < 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const assignee = assignees[Math.floor(Math.random() * assignees.length)]
    const taskTags = tags[Math.floor(Math.random() * tags.length)]
    
    tasks.push({
      id: `task-${i + 1}`,
      title: `Task ${i + 1}: ${getTaskTitle()}`,
      description: Math.random() > 0.5 ? getTaskDescription() : undefined,
      status,
      priority,
      assignee: Math.random() > 0.3 ? assignee : undefined,
      dueDate: Math.random() > 0.6 ? getFutureDate() : undefined,
      tags: taskTags
    })
  }

  return tasks
}

function getTaskTitle(): string {
  const titles = [
    'Implement user authentication',
    'Design landing page',
    'Fix responsive layout',
    'Add search functionality',
    'Optimize database queries',
    'Create API documentation',
    'Update user interface',
    'Implement dark mode',
    'Add email notifications',
    'Refactor component structure'
  ]
  return titles[Math.floor(Math.random() * titles.length)]
}

function getTaskDescription(): string {
  const descriptions = [
    'This task requires careful attention to detail and coordination with the design team.',
    'Implementation should follow our established coding standards and best practices.',
    'Consider performance implications and ensure proper error handling.',
    'Review existing code and identify areas for improvement.',
    'Collaborate with stakeholders to gather requirements and feedback.'
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

function getFutureDate(): string {
  const today = new Date()
  const futureDate = new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000)
  return futureDate.toISOString().split('T')[0]
}

export function groupTasksByStatus(tasks: Task[]): Column[] {
  const columns: Column[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100', tasks: [] },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100', tasks: [] },
    { id: 'review', title: 'Review', color: 'bg-yellow-100', tasks: [] },
    { id: 'done', title: 'Done', color: 'bg-green-100', tasks: [] }
  ]

  tasks.forEach(task => {
    const column = columns.find(col => col.id === task.status)
    if (column) {
      column.tasks.push(task)
    }
  })

  return columns
}

const taskKey = Symbol('kanbanTask')
export type TaskData = { [taskKey]: true; taskId: string; columnId: TaskStatus }

export function getTaskData(taskId: string, columnId: TaskStatus): TaskData {
  return { [taskKey]: true, taskId, columnId }
}

export function isTaskData(data: Record<symbol | string, unknown>): data is TaskData {
  return data[taskKey] === true
}