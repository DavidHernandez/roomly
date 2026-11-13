<script setup lang="ts">
import { reactive, ref } from 'vue';
import { api } from '../api';
import type { Booking, Room } from '../types';

defineProps<{ rooms: Room[] }>();
const emit = defineEmits<{ created: [booking: Booking] }>();

const form = reactive({
  roomId: '',
  title: '',
  organizer: '',
  attendees: 2,
  from: '09:00',
  to: '10:00',
});
const message = ref('');
const isError = ref(false);

function toIso(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

async function submit(): Promise<void> {
  try {
    const booking = await api.createBooking({
      roomId: form.roomId,
      title: form.title,
      organizer: form.organizer,
      attendees: form.attendees,
      start: toIso(form.from),
      end: toIso(form.to),
    });
    emit('created', booking);
    isError.value = false;
    message.value = `Booked ${form.title}.`;
    form.title = '';
  } catch (e) {
    isError.value = true;
    message.value = (e as Error).message;
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <label>
      Room
      <select v-model="form.roomId" required>
        <option value="" disabled>Choose a room</option>
        <option v-for="r in rooms" :key="r.id" :value="r.id">
          {{ r.name }} ({{ r.capacity }} seats)
        </option>
      </select>
    </label>
    <label>Meeting name <input v-model="form.title" required /></label>
    <label>Your name <input v-model="form.organizer" required /></label>
    <label>People <input v-model.number="form.attendees" type="number" min="1" required /></label>
    <div class="times">
      <label>From <input v-model="form.from" type="time" required /></label>
      <label>To <input v-model="form.to" type="time" required /></label>
    </div>
    <button class="primary" type="submit">Book room</button>
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
