<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">
        Vue Virtual List with Drag & Drop
      </h1>
      <p class="text-gray-600 mb-8 text-center">
        Drag and drop items in this virtualized list of {{ items.length }} items
      </p>
      <VirtualList :items="items" @reorder="handleReorder" />
    </div>
    <div class="flex gap-6 overflow-x-auto pb-6">
      <KanbanColumn 
        v-for="column in columns" 
        :key="column.id"
        :column="column"
        :tasks="getTasksForColumn(column.id)"
        @task-moved="handleTaskMoved"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VirtualList from './components/VirtualList.vue'
import { getExampleList, type Item } from './types/list-data'

const items = ref<Item[]>(getExampleList(10000))

const handleReorder = (newItems: Item[]) => {
  items.value = newItems
}