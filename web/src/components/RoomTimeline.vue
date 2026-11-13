<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { DAY_END, DAY_START, formatTime, hoursSinceDayStart } from '../time';
import type { Booking, Room } from '../types';

const props = defineProps<{ rooms: Room[]; bookings: Booking[] }>();

const span = DAY_END - DAY_START;
const hours = Array.from({ length: span + 1 }, (_, i) => DAY_START + i);
const now = ref(new Date().toISOString());
let timer: number | undefined;

onMounted(() => {
  timer = window.setInterval(() => (now.value = new Date().toISOString()), 60_000);
});
onBeforeUnmount(() => window.clearInterval(timer));

const nowOffset = computed(() => {
  const h = hoursSinceDayStart(now.value);
  return h >= 0 && h <= span ? `${(h / span) * 100}%` : null;
});

function blockStyle(b: Booking): Record<string, string> {
  const left = Math.max(0, hoursSinceDayStart(b.start));
  const right = Math.min(span, hoursSinceDayStart(b.end));
  return { left: `${(left / span) * 100}%`, width: `${((right - left) / span) * 100}%` };
}

function isFreeNow(roomId: string): boolean {
  const t = new Date(now.value).getTime();
  return !props.bookings.some(
    (b) => b.roomId === roomId && new Date(b.start).getTime() <= t && t < new Date(b.end).getTime(),
  );
}
</script>

<template>
  <div class="timeline">
    <div class="scale" aria-hidden="true">
      <span v-for="h in hours" :key="h" :style="{ left: `${((h - DAY_START) / span) * 100}%` }">
        {{ h }}:00
      </span>
    </div>

    <div v-for="room in props.rooms" :key="room.id" class="row">
      <div class="room">
        <strong>{{ room.name }}</strong>
        <span>{{ room.capacity }} seats, floor {{ room.floor }}</span>
        <span :class="isFreeNow(room.id) ? 'free' : 'busy'">
          {{ isFreeNow(room.id) ? 'Free now' : 'In use' }}
        </span>
      </div>
      <div class="track">
        <div
          v-for="b in props.bookings.filter((x) => x.roomId === room.id)"
          :key="b.id"
          class="block"
          :style="blockStyle(b)"
          :title="`${b.title}, ${formatTime(b.start)}–${formatTime(b.end)}`"
        >
          {{ b.title }}
        </div>
        <div v-if="nowOffset" class="now" :style="{ left: nowOffset }" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  overflow-x: auto;
}
.scale,
.row {
  display: grid;
  grid-template-columns: 11rem minmax(36rem, 1fr);
}
.scale {
  position: relative;
  height: 1.5rem;
  margin-left: 11rem;
  display: block;
  min-width: 36rem;
}
.scale span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--muted);
}
.row {
  border-top: 1px solid var(--line);
  min-height: 3.75rem;
}
.room {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.4rem 0.75rem 0.4rem 0;
  font-size: 0.85rem;
}
.room strong {
  font-size: 1rem;
}
.room span {
  color: var(--muted);
}
.room .free {
  color: var(--free);
  font-weight: 700;
}
.room .busy {
  color: var(--muted);
  font-weight: 700;
}
.track {
  position: relative;
  background: repeating-linear-gradient(
    90deg,
    transparent 0 calc(100% / 11 - 1px),
    var(--line) calc(100% / 11 - 1px) calc(100% / 11)
  );
}
.block {
  position: absolute;
  top: 0.6rem;
  bottom: 0.6rem;
  background: var(--booked);
  color: var(--booked-ink);
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.8rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.now {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--now);
}
</style>
