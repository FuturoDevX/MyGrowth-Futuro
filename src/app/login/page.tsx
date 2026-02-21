'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@futuro.local');
  const [password, setPassword] = useState('Password123!');

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">MyGrowth@Futuro Login</h1>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn('credentials', { email, password, callbackUrl: '/dashboard' });
        }}
      >
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button className="bg-slate-900 text-white w-full">Sign in</button>
      </form>
    </div>
  );
}
