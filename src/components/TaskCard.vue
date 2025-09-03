<template>
  <div
    ref="element"
    :data-task-id="task.id"
    :class="[
      'absolute left-0 w-full px-2 transition-all duration-200',
      stateClasses[state]
    ]"
    :style="{
      height: `${virtualItem.size}px`,
      transform: `translateY(${virtualItem.start}px)`
    }"
  >
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab hover:shadow-md transition-all duration-200 h-full">
      <!-- Priority Indicator -->
      <div class="flex items-start justify-between mb-3">
        <div :class="['w-1 h-full absolute left-0 top-0 rounded-l-lg', getPriorityColor(task.priority)]"></div>
        <div class="flex-1 ml-2">
          <h3 class="font-medium text-gray-900 text-sm leading-tight mb-1">
            {{ task.title }}
          </h3>
          <p v-if="task.description" class="text-xs text-gray-600 line-clamp-2">
            {{ task.description }}
          </p>
        </div>
        <div class="flex space-x-1 ml-2">
          <div class="w-1 h-3 bg-gray-300 rounded-full"></div>
          <div class="w-1 h-3 bg-gray-300 rounded-full"></div>
          <div class="w-1 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in task.tags"
          :key="tag"
          class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center space-x-2">
          <!-- Assignee -->
          <div v-if="task.assignee" class="flex items-center space-x-1">
            <div class="w-5 h-5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium text-xs">
              {{ getInitials(task.assignee) }}
            </div>
          </div>
          <!-- Due Date -->
          <div v-if="task.dueDate" class="flex items-center space-x-1 text-gray-500">
          
            <span>{{ formatDate(task.dueDate) }}</span>
          </div>
        </div>
        <!-- Priority Badge -->
        <div :class="['px-2 py-1 rounded-full text-xs font-medium', getPriorityBadgeColor(task.priority)]">
          {{ task.priority }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine'
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { getTaskData, isTaskData, type Task, type TaskStatus } from '../types/kanban-data'
import type { VirtualItem } from '@tanstack/vue-virtual'

type DragState = 'idle' | 'is-dragging' | 'is-dragging-over'

const stateClasses: Record<DragState, string> = {
  idle: '',
  'is-dragging': 'opacity-50 scale-95 z-50',
  'is-dragging-over': 'scale-105'
}

const props = defineProps<{
  task: Task
  index: number
  virtualItem: VirtualItem
  columnId: TaskStatus
}>()

const emit = defineEmits<{
  'task-moved': [{ taskId: string; newStatus: TaskStatus; newIndex: number }]
}>()

const element = ref<HTMLElement>()
const state = ref<DragState>('idle')

function getPriorityColor(priority: string): string {
  const colors = {
    low: 'bg-green-400',
    medium: 'bg-yellow-400',
    high: 'bg-red-400'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-400'
}

function getPriorityBadgeColor(priority: string): string {
  const colors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  }
  return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-700'
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

let cleanup: (() => void) | undefined

onMounted(() => {
  if (!element.value) return

  cleanup = combine(
    draggable({
      element: element.value,
      getInitialData: () => getTaskData(props.task.id, props.columnId),
      onDragStart: () => {
        state.value = 'is-dragging'
      },
      onDrop: () => {
        state.value = 'idle'
      }
    }),
    dropTargetForElements({
      element: element.value,
      canDrop: ({ source }) => {
        if (source.element === element.value) return false
        return isTaskData(source.data)
      },
      getData: () => getTaskData(props.task.id, props.columnId),
      onDragEnter: () => {
        if (state.value !== 'is-dragging') {
          state.value = 'is-dragging-over'
        }
      },
      onDragLeave: () => {
        if (state.value !== 'is-dragging') {
          state.value = 'idle'
        }
      },
      onDrop: () => {
        state.value = 'idle'
      }
    })
  )
})

onUnmounted(() => {
  cleanup?.()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>