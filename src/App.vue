<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002-2M9 7a2 2 0 012 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 002-2" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-semibold text-gray-900">Project Board</h1>
              <p class="text-sm text-gray-500">{{ totalTasks }} tasks across {{ columns.length }} columns</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              + Add Task
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Kanban Board -->
    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex space-x-6 overflow-x-auto pb-6">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          @task-moved="handleTaskMoved"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KanbanColumn from './components/KanbanColumn.vue'
import { getExampleTasks, groupTasksByStatus, type Task, type TaskStatus } from './types/kanban-data'

const tasks = ref<Task[]>(getExampleTasks())
const columns = computed(() => groupTasksByStatus(tasks.value))
const totalTasks = computed(() => tasks.value.length)

const handleTaskMoved = (taskId: string, newStatus: TaskStatus, newIndex: number) => {
  const taskIndex = tasks.value.findIndex(task => task.id === taskId)
  if (taskIndex === -1) return

  const task = tasks.value[taskIndex]
  const updatedTask = { ...task, status: newStatus }
  
  // Remove task from current position
  tasks.value.splice(taskIndex, 1)
  
  // Find the new position in the target column
  const targetColumnTasks = tasks.value.filter(t => t.status === newStatus)
  const insertIndex = Math.min(newIndex, targetColumnTasks.length)
  
  // Calculate the actual index in the full tasks array
  let actualIndex = 0
  let columnTaskCount = 0
  
  for (const t of tasks.value) {
    if (t.status === newStatus) {
      if (columnTaskCount === insertIndex) {
        break
      }
      columnTaskCount++
    }
    actualIndex++
  }
  
  // Insert task at new position
  tasks.value.splice(actualIndex, 0, updatedTask)
}
</script>