<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { api } from './api';
import BookingForm from './components/BookingForm.vue';
import BookingList from './components/BookingList.vue';
import RoomTimeline from './components/RoomTimeline.vue';
import { todayKey } from './time';
import type { Booking, Room } from './types';

const rooms = ref<Room[]>([]);
const bookings = ref<Booking[]>([]);
const loadError = ref('');

async function load(): Promise<void> {
  try {
    [rooms.value, bookings.value] = await Promise.all([api.rooms(), api.bookings(todayKey())]);
  } catch (e) {
    loadError.value = `Couldn't reach the Roomly API. Is the server running on port 3001? (${(e as Error).message})`;
  }
}

function onCreated(booking: Booking): void {
  bookings.value.push(booking);
  bookings.value.sort((a, b) => a.start.localeCompare(b.start));
}

function onCancelled(id: string): void {
  bookings.value = bookings.value.filter((b) => b.id !== id);
}

onMounted(load);
</script>

<template>
  <header class="top">
    <h1>Roomly</h1>
    <p>
      {{ new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }) }}
    </p>
  </header>

  <main class="layout">
    <p v-if="loadError" class="error" role="alert">{{ loadError }}</p>

    <section class="panel timeline-panel" aria-label="Today's room schedule">
      <RoomTimeline :rooms="rooms" :bookings="bookings" />
    </section>

    <section class="panel">
      <h2>Book a room</h2>
      <BookingForm :rooms="rooms" @created="onCreated" />
    </section>

    <section class="panel">
      <h2>Today's bookings</h2>
      <BookingList :rooms="rooms" :bookings="bookings" @cancelled="onCancelled" />
    </section>
  </main>
</template>

<style scoped>
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem clamp(1rem, 4vw, 3rem) 0.5rem;
}
.top h1 {
  font-size: 2.4rem;
  letter-spacing: -0.02em;
  margin: 0;
}
.top p {
  margin: 0;
  color: var(--muted);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 1.25rem;
  padding: 1rem clamp(1rem, 4vw, 3rem) 3rem;
}
.timeline-panel {
  grid-column: 1 / -1;
}
.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 1.25rem;
}
.error {
  grid-column: 1 / -1;
  color: var(--danger);
  margin: 0;
}

@media (max-width: 760px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
