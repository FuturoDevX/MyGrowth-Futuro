'use client';

import { useState } from 'react';

export default function AttendancePage({ params }: { params: { id: string } }) {
  const [participantId, setParticipantId] = useState('');
  const [status, setStatus] = useState('ATTENDED');

  return (
    <div className="bg-white p-4 rounded space-y-2">
      <h1 className="text-xl">Attendance</h1>
      <input placeholder="Participant ID" value={participantId} onChange={(e) => setParticipantId(e.target.value)} />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>ATTENDED</option><option>NO_SHOW</option><option>CANCELLED</option><option>LATE</option>
      </select>
      <button
        className="bg-slate-900 text-white"
        onClick={async () => {
          await fetch(`/api/events/${params.id}/attendance`, { method: 'PATCH', body: JSON.stringify({ updates: [{ participantId, status }] }) });
          alert('Attendance updated');
        }}
      >
        Save
      </button>
    </div>
  );
}
