'use client';

import { useState } from 'react';

export default function ReflectionPage({ params }: { params: { id: string } }) {
  const [learned, setLearned] = useState('');
  const [applyPlan, setApplyPlan] = useState('');
  return (
    <div className="bg-white p-4 rounded space-y-2">
      <h1 className="text-xl">Reflection</h1>
      <textarea placeholder="What did you learn?" value={learned} onChange={(e) => setLearned(e.target.value)} />
      <textarea placeholder="How will you apply it?" value={applyPlan} onChange={(e) => setApplyPlan(e.target.value)} />
      <button className="bg-slate-900 text-white" onClick={async () => {
        await fetch(`/api/reflections/${params.id}`, { method: 'PATCH', body: JSON.stringify({ learned, applyPlan }) });
        alert('Saved');
      }}>Submit</button>
    </div>
  );
}
