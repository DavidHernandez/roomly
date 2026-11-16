<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { api } from '../api';
import type { Booking, Room } from '../types';

const props = defineProps<{ rooms: Room[] }>();
const emit = defineEmits<{ created: [booking: Booking] }>();

const form = reactive({
  roomId: '',
  title: '',
  organizer: '',
  attendees: 2 as number | string,
  from: '09:00',
  to: '10:00',
});
const message = ref('');
const isError = ref(false);

/** Rooms free and big enough for the chosen time and people. `null` while the inputs are invalid. */
const availableRooms = ref<Room[] | null>(null);
const searchError = ref('');
let requestId = 0;

const attendeeCount = computed(() =>
  typeof form.attendees === 'number' ? form.attendees : Number.NaN,
);
const noRoomFits = computed(
  () => availableRooms.value !== null && availableRooms.value.length === 0,
);

function toIso(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function roomName(id: string): string {
  return props.rooms.find((r) => r.id === id)?.name ?? id;
}

async function loadAvailableRooms(): Promise<void> {
  const current = ++requestId;
  searchError.value = '';

  if (!form.from || !form.to || form.to <= form.from) {
    availableRooms.value = null;
    searchError.value = 'The end time must be after the start time.';
    return;
  }
  if (!Number.isInteger(attendeeCount.value) || attendeeCount.value < 1) {
    availableRooms.value = null;
    searchError.value = 'Enter at least 1 person.';
    return;
  }

  try {
    const result = await api.availableRooms(toIso(form.from), toIso(form.to), attendeeCount.value);
    if (current !== requestId) return; // a newer search has started
    availableRooms.value = result;

    if (form.roomId && !result.some((r) => r.id === form.roomId)) {
      const name = roomName(form.roomId);
      form.roomId = '';
      isError.value = true;
      message.value = `${name} doesn't fit that time or group size any more. Pick another room.`;
    }
  } catch (e) {
    if (current !== requestId) return;
    availableRooms.value = null;
    searchError.value = (e as Error).message;
  }
}

watch(() => [form.from, form.to, form.attendees], loadAvailableRooms, { immediate: true });

// Picking a room answers any earlier "pick another room" prompt.
watch(
  () => form.roomId,
  (roomId) => {
    if (roomId) message.value = '';
  },
);

async function submit(): Promise<void> {
  try {
    const booking = await api.createBooking({
      roomId: form.roomId,
      title: form.title,
      organizer: form.organizer,
      attendees: attendeeCount.value,
      start: toIso(form.from),
      end: toIso(form.to),
    });
    emit('created', booking);
    isError.value = false;
    message.value = `Booked ${form.title}.`;
    form.title = '';
    form.roomId = '';
  } catch (e) {
    isError.value = true;
    message.value = (e as Error).message;
  }
  await loadAvailableRooms();
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <div class="times">
      <label>From <input v-model="form.from" type="time" required /></label>
      <label>To <input v-model="form.to" type="time" required /></label>
    </div>
    <label>People <input v-model.number="form.attendees" type="number" min="1" required /></label>

    <p v-if="searchError" class="error" role="alert">{{ searchError }}</p>
    <p v-else-if="noRoomFits" class="error" role="alert">
      No room is free for {{ attendeeCount }} people from {{ form.from }} to {{ form.to }}. Try
      another time or fewer people.
    </p>

    <label>
      Room
      <select
        v-model="form.roomId"
        required
        :disabled="availableRooms === null || availableRooms.length === 0"
      >
        <option value="" disabled>Choose a free room</option>
        <option v-for="r in availableRooms ?? []" :key="r.id" :value="r.id">
          {{ r.name }} ({{ r.capacity }} seats)
        </option>
      </select>
    </label>
    <label>Meeting name <input v-model="form.title" required /></label>
    <label>Your name <input v-model="form.organizer" required /></label>
    <button class="primary" type="submit" :disabled="!form.roomId">Book room</button>
    <p v-if="message" :class="{ error: isError }" role="status">{{ message }}</p>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 0.75rem;
}
label {
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: var(--muted);
}
.times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
p {
  margin: 0;
  font-size: 0.9rem;
}
.error {
  color: var(--danger);
}
</style>
