import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import GoogleLogo from 'assets/logos/google.svg?url'
import { authClient } from 'lib/auth/auth-client';

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const router = useRouter();
  const { signIn } = authClient

  const [errorMessage, setErrorMessage] = useState('');

  return (
    <div className="h-screen flex items-center">
      <div className="container max-w-md mx-auto">
        <h2 className="mb-4 text-xl font-lexend font-semibold text-center">Authenticate with Petunia Chat</h2>
        <p className="text-center">If you don't have an account we'll create one for you.</p>
        <div className="flex justify-center items-center my-4">
          <button
            className="px-4 py-2 flex items-center gap-4 font-semibold bg-neutral-100 shadow rounded duration-150 hover:bg-neutral-200 hover:shadow-lg dark:shadow-slate-700 dark:bg-neutral-800 dark:hover:shadow-md dark:hover:bg-neutral-700"
            onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
          >
            <img src={GoogleLogo} className="h-4 w-4" />
            Sign in with Google
          </button>
          {errorMessage && (
            <p className="p-4 bg-red-100 border border-red-600 text-red-900">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}
