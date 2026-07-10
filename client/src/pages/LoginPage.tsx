import { FirebaseError } from "firebase/app";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";

type AuthMode = "login" | "signup";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "That email is already in use. Try logging in instead.";
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Email or password is incorrect.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was closed before it finished.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return error.message;
    }
  }

  return "Something went wrong. Please try again.";
}

export function LoginPage() {
  const { loading, signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === "signup";

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const credential = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      console.log("Firebase user:", credential.user);
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);

    try {
      const credential = await signInWithGoogle();
      console.log("Firebase user:", credential.user);
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">
            {isSignUp ? "Create your SquadUp account" : "Log in to SquadUp"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp
              ? "Use email and password or continue with Google."
              : "Welcome back. Choose a sign-in method below."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailAuth}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            className="w-full rounded-md bg-slate-950 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={submitting || loading}
          >
            {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          className="w-full rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-950 disabled:cursor-not-allowed disabled:text-slate-400"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || loading}
        >
          Sign in with Google
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button
            className="font-medium text-slate-950 underline"
            type="button"
            onClick={() => {
              setError(null);
              setMode(isSignUp ? "login" : "signup");
            }}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </section>
  );
}
