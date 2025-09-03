<template>
  <div class="flex-shrink-0 w-80">
    <!-- Column Header -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center space-x-2">
          <div :class="['w-3 h-3 rounded-full', getStatusColor(column.id)]"></div>
          <h2 class="font-semibold text-gray-800">{{ column.title }}</h2>
          <span class="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
            {{ column.tasks.length }}
          </span>
        </div>
        <button class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Virtual List Container -->
    <div
      ref="scrollElement"
      :class="['h-[calc(100vh-200px)] overflow-auto rounded-lg', column.color]"
      class="border-2 border-dashed border-gray-200 p-2"
    >
      <div
        :style="{
          position: 'relative',
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%'
        }"
      >
        <TaskCard
          v-for="virtualItem in virtualItems"
          :key="column.tasks[virtualItem.index].id"
          :task="column.tasks[virtualItem.index]"
          :index="virtualItem.index"
          :virtual-item="virtualItem"
          :column-id="column.id"
          @task-moved="$emit('task-moved', $event.taskId, $event.newStatus, $event.newIndex)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge'
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import TaskCard from './TaskCard.vue'
import { isTaskData, type Column, type TaskStatus } from '../types/kanban-data'

const props = defineProps<{
  column: Column
}>()

const emit = defineEmits<{
  'task-moved': [{ taskId: string; newStatus: TaskStatus; newIndex: number }]
}>()

const scrollElement = ref<HTMLDivElement>()

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.column.tasks.length,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => 120,
    overscan: 3
  }))
)

const virtualItems = computed(() => virtualizer.value.getVirtualItems())

function getStatusColor(status: TaskStatus): string {
  const colors = {
    'todo': 'bg-gray-400',
    'in-progress': 'bg-blue-500',
    'review': 'bg-yellow-500',
    'done': 'bg-green-500'
  }
  return colors[status]
}

let cleanup: (() => void) | undefined

onMounted(() => {
  cleanup = monitorForElements({
    canMonitor({ source }) {
      return isTaskData(source.data)
    },
    onDrop: ({ location, source }) => {
      const target = location.current.dropTargets[0]
      if (!target) return

      const sourceData = source.data
      const targetData = target.data

      if (!isTaskData(sourceData) || !isTaskData(targetData)) return

      const sourceTaskId = sourceData.taskId
      const targetColumnId = targetData.columnId
      
      // Find the target index in the new column
      const targetIndex = props.column.tasks.findIndex(task => task.id === targetData.taskId)
      
      emit('task-moved', {
        taskId: sourceTaskId,
        newStatus: targetColumnId,
        newIndex: targetIndex
      })

      setTimeout(() => {
        const element = document.querySelector(`[data-task-id="${targetData.taskId}"]`)
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element)
        }
      }, 100)
    }
  })
})

onUnmounted(() => {
  cleanup?.()
})
</script>