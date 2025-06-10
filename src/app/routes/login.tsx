import { useState } from 'react';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { usersTable } from 'db/schema';
import { Route as IndexRoute } from './index';
import { getUser } from 'db/queries';
import { db } from 'db';
import { useAuthSession } from 'lib/session';

const loginOrRegister = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('gtfo');
    }
    const email = data.get('email')
    const password = data.get('password')

    if (!email || !password) {
      throw new Error('Wheres the login???');
    }

    return {
      email: email.toString(),
      password: password.toString(),
    }
  })
  .handler(async ({ data: { email } }) => {
    let existingUser = await getUser(email);
    if (!existingUser) {
      [existingUser] = await db.insert(usersTable).values({ email, emailVerified: true, }).returning();
    }

    const session = await useAuthSession(process.env.SESSION_SECRET!);
    await session.update({ email });

    return existingUser;
  })

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const router = useRouter();
  const { user } = Route.useRouteContext();

  if (user) {
    throw redirect(IndexRoute);
  }

  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div className="h-screen flex items-center">
      <div className="container max-w-md mx-auto">
        <h2 className="mb-4 text-xl font-semibold text-center">Authenticate with Petunia Chat</h2>
        <p className="text-center">If you don't have an account we'll create one for you.</p>
        <div className="my-4 p-4 border">
          <form
            className="space-y-1"
            onSubmit={async (event) => {
              event.preventDefault();

              const formData = new FormData(event.currentTarget);
              try {
                await loginOrRegister({ data: formData });
                await router.invalidate();
                router.navigate(IndexRoute);
              } catch (err) {
                setErrorMessage(err);
              }
            }}
          >
            <input 
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="block w-full border"
            />
            <input 
              type="password"
              name="password"
              placeholder="Shhh just type anything here for now"
              required
              className="block w-full border"
            />
            <button type="submit">GO!!</button>
          </form>
          {errorMessage && (
            <p className="p-4 bg-red-100 border border-red-600 text-red-900">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
