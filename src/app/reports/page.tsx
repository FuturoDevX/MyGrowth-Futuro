'use client';

export default function ReportsPage() {
  return (
    <div className="bg-white p-4 rounded space-y-2">
      <h1 className="text-xl">Reports</h1>
      <a href="/api/reports/completions?lastMonths=12" className="underline">Download type completion CSV (12 months)</a>
      <a href="/api/reports/payment-preferences" className="underline block">Download payment preferences CSV</a>
    </div>
  );
}
