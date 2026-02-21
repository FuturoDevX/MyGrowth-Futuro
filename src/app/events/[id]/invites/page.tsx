'use client';

import { useState } from 'react';

export default function InvitesPage({ params }: { params: { id: string } }) {
  const [participantIds, setParticipantIds] = useState('');
  const [excludeIds, setExcludeIds] = useState('');
  return (
    <div className="bg-white p-4 rounded space-y-2">
      <h1 className="text-xl">Invite Participants</h1>
      <input placeholder="Participant IDs comma separated" value={participantIds} onChange={(e) => setParticipantIds(e.target.value)} />
      <input placeholder="Exclude IDs (offboarding safe)" value={excludeIds} onChange={(e) => setExcludeIds(e.target.value)} />
      <button
        className="bg-slate-900 text-white"
        onClick={async () => {
          await fetch(`/api/events/${params.id}/invites`, {
            method: 'POST',
            body: JSON.stringify({ participantIds: participantIds.split(',').map((x) => x.trim()).filter(Boolean), excludeIds: excludeIds.split(',').map((x) => x.trim()).filter(Boolean) })
          });
          alert('Invites sent');
        }}
      >
        Send Invites
      </button>
    </div>
  );
}
