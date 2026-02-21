'use client';

export default function RSVPPage({ params }: { params: { id: string } }) {
  const statuses = ['GOING', 'NOT_GOING', 'MAYBE', 'WAITLIST'];
  return (
    <div className="bg-white p-4 rounded">
      <h1 className="text-xl mb-2">RSVP</h1>
      <div className="grid grid-cols-2 gap-2">
        {statuses.map((status) => (
          <button
            key={status}
            className="bg-slate-900 text-white"
            onClick={async () => {
              await fetch(`/api/events/${params.id}/rsvp`, { method: 'POST', body: JSON.stringify({ status }) });
              alert(`RSVP set to ${status}`);
            }}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
