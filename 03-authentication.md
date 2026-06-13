# Part 3: Authentication & Login → POS Redirect

## Goal
Signup/Login → on success, Admin lands on Backend Dashboard; Employee lands directly in POS (Floor Pop-up if no session open, else Order View).

---

## Step 1: NextAuth Configuration

`src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || user.isArchived) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};
```

`src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## Step 2: Signup API Route

`src/app/api/signup/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // First signup ever = ADMIN, otherwise default EMPLOYEE.
  // For hackathon simplicity, treat signup as Admin (the spec describes
  // "User" as the admin role who signs up to configure the backend).
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'ADMIN' },
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
```

---

## Step 3: Login Page

`src/app/(auth)/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', { email, password, redirect: false });

    if (res?.error) {
      setError('Invalid email or password');
      return;
    }

    // Fetch session to determine role-based redirect
    const session = await fetch('/api/auth/session').then(r => r.json());
    const role = session?.user?.role;

    if (role === 'ADMIN') {
      router.push('/dashboard');
    } else {
      // Employee → directly into POS session flow
      router.push('/pos');
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6 border rounded-lg">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button type="submit" className="w-full bg-black text-white rounded p-2">Log In</button>
        <p className="text-sm text-center">
          No account? <a href="/signup" className="underline">Sign up</a>
        </p>
      </form>
    </div>
  );
}
```

---

## Step 4: Signup Page

`src/app/(auth)/signup/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : data.error);
      return;
    }

    // Auto-login after signup, then route to POS (session opens directly per spec)
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    router.push('/pos');
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-6 border rounded-lg">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input placeholder="Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded p-2" required />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded p-2" required />
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded p-2" required />
        <button type="submit" className="w-full bg-black text-white rounded p-2">Sign Up</button>
        <p className="text-sm text-center">
          Already have an account? <a href="/login" className="underline">Log in</a>
        </p>
      </form>
    </div>
  );
}
```

---

## Step 5: Session Provider Wrapper

`src/app/layout.tsx` — wrap the app:

```tsx
import { SessionProvider } from 'next-auth/react';
// ... other imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`src/app/providers.tsx`:

```tsx
'use client';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

---

## Step 6: Middleware for Route Protection

`src/middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // KDS is publicly accessible via fixed URL (kitchen device, no login)
      if (path.startsWith('/kds')) return true;

      if (!token) return false;

      // Backend routes restricted to ADMIN
      if (path.startsWith('/dashboard') || path.startsWith('/products') ||
          path.startsWith('/categories') || path.startsWith('/users')) {
        return token.role === 'ADMIN';
      }

      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/products/:path*', '/categories/:path*',
            '/payment-methods/:path*', '/coupons/:path*', '/floors/:path*',
            '/users/:path*', '/reports/:path*', '/pos/:path*'],
};
```

> Note: KDS is intentionally excluded from auth (Section 4: "accessed through a fixed system URL... opened on a separate device").

---

## Flow Verification Checklist

- [ ] Signup creates ADMIN user, auto-logs in, redirects to `/pos`
- [ ] Login as ADMIN → redirects to `/dashboard`
- [ ] Login as EMPLOYEE → redirects to `/pos`
- [ ] `/pos` checks for open `PosSession` for current user — if none, shows "Open Session" screen (Part 5); if open, shows Floor Pop-up
- [ ] `/kds` is accessible without login
