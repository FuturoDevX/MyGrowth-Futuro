'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().min(3),
  eventDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  facilitator: z.string(),
  trainingTypeId: z.string(),
  deliveryMode: z.enum(['IN_PERSON', 'ONLINE'])
});

type FormValues = z.infer<typeof schema>;

export default function NewEventPage() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      facilitator: '',
      trainingTypeId: '',
      deliveryMode: 'IN_PERSON'
    }
  });

  return (
    <form
      className="bg-white p-4 rounded space-y-2"
      onSubmit={form.handleSubmit(async (values) => {
        const res = await fetch('/api/events', { method: 'POST', body: JSON.stringify(values) });
        const data = await res.json();
        router.push(`/events/${data.id}`);
      })}
    >
      <h1 className="text-xl">Create event</h1>
      <input placeholder="Title" {...form.register('title')} />
      <p className="text-xs text-slate-500">Suggestion: title displays as “Title — YYYY-MM-DD” in listings.</p>
      <input type="date" {...form.register('eventDate')} />
      <div className="grid grid-cols-2 gap-2"><input type="time" {...form.register('startTime')} /><input type="time" {...form.register('endTime')} /></div>
      <input placeholder="Facilitator" {...form.register('facilitator')} />
      <input placeholder="Training Type ID" {...form.register('trainingTypeId')} />
      <select {...form.register('deliveryMode')}><option value="IN_PERSON">In person</option><option value="ONLINE">Online</option></select>
      <button className="bg-slate-900 text-white">Save</button>
    </form>
  );
}
