<template>
  <div
    ref="scrollElement"
    class="h-[600px] w-full overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm"
  >
    <div
      :style="{
        position: 'relative',
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%'
      }"
    >
      <ListItem
        v-for="virtualItem in virtualItems"
        :key="items[virtualItem.index].id"
        :item="items[virtualItem.index]"
        :index="virtualItem.index"
        :virtual-item="virtualItem"
      />
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
import ListItem from './ListItem.vue'
import { isItemData, type Item } from '../types/list-data'

const props = defineProps<{
  items: Item[]
}>()

const emit = defineEmits<{
  reorder: [items: Item[]]
}>()

const scrollElement = ref<HTMLDivElement>()

const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => scrollElement.value,
    estimateSize: () => 50,
    overscan: 5
  }))
)

const virtualItems = computed(() => virtualizer.value.getVirtualItems())

let cleanup: (() => void) | undefined

onMounted(() => {
  cleanup = monitorForElements({
    canMonitor({ source }) {
      return isItemData(source.data)
    },
    onDrop: ({ location, source }) => {
      const target = location.current.dropTargets[0]
      if (!target) {
        return
      }
      const sourceData = source.data
      const targetData = target.data

      if (!isItemData(sourceData) || !isItemData(targetData)) {
        return
      }

      const sourceIndex = sourceData.index
      const targetIndex = targetData.index

      const closestEdge = sourceIndex > targetIndex ? ('top' as Edge) : ('bottom' as Edge)
      const newItems = reorderWithEdge({
        list: props.items,
        startIndex: sourceIndex,
        indexOfTarget: targetIndex,
        closestEdgeOfTarget: closestEdge,
        axis: 'vertical'
      })

      emit('reorder', newItems)

      setTimeout(() => {
        const element = document.querySelector(`[data-item-index="${targetData.index}"]`)
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