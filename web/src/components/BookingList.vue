<script setup lang="ts">
import { computed, ref } from 'vue';
import { api } from '../api';
import { formatTime } from '../time';
import type { Booking, Room } from '../types';

const props = defineProps<{ rooms: Room[]; bookings: Booking[] }>();
const emit = defineEmits<{ cancelled: [index: number] }>();

const roomFilter = ref('all');

const visible = computed(() =>
  roomFilter.value === 'all'
    ? props.bookings
    : props.bookings.filter((b) => b.roomId === roomFilter.value),
);

function roomName(id: string): string {
  return props.rooms.find((r) => r.id === id)?.name ?? id;
}

async function cancel(booking: Booking, index: number): Promise<void> {
  await api.cancelBooking(booking.id);
  emit('cancelled', index);
}
</script>

<template>
  <label class="filter">
    Show
    <select v-model="roomFilter">
      <option value="all">All rooms</option>
      <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
    </select>
  </label>

  <p v-if="visible.length === 0" class="empty">No bookings yet. Use the form to book a room.</p>

  <ul v-else class="list">
    <li v-for="(b, index) in visible" :key="b.id">
      <div>
        <strong>{{ b.title }}</strong>
        <span
          >{{ roomName(b.roomId) }}, {{ formatTime(b.start) }}–{{ formatTime(b.end) }},
          {{ b.organizer }}</span
        >
      </div>
      <button type="button" @click="cancel(b, index)">Cancel booking</button>
    </li>
  </ul>
</template>

<style scoped>
.filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--muted);
  font-size: 0.9rem;
}
.filter select {
  width: auto;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0;
  border-top: 1px solid var(--line);
}
.list span {
  display: block;
  color: var(--muted);
  font-size: 0.85rem;
}
.empty {
  color: var(--muted);
}
</style>
