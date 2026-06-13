import React from 'react';

// TODO: Implement login form validation, credentials verification, and NextAuth integration

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-900/50 p-8 border border-zinc-800 backdrop-blur-md shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-500">Cafe POS</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to your staff terminal</p>
        </div>
        <div className="border border-dashed border-zinc-800 p-6 rounded-lg text-center text-zinc-500">
          Login Form Placeholder
        </div>
      </div>
    </div>
  );
}
