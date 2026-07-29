import { FirebaseError } from "firebase/app";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import { Alert, Button, Card, Input } from "../components/ui";

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
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
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
      await signInWithGoogle();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md py-6">
      <Card className="!p-6">
        <div className="mb-6">
          <h1 className="font-display text-[length:var(--text-h2)] leading-tight font-bold text-charcoal">
            {isSignUp ? "Create your SquadUp account" : "Log in to SquadUp"}
          </h1>
          <p className="mt-2 text-sm text-charcoal/70">
            {isSignUp
              ? "Use email and password or continue with Google."
              : "Welcome back. Sign in to join pickup games nearby."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailAuth}>
          <label className="block text-sm font-semibold text-charcoal">
            Email
            <Input
              className="mt-1.5"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm font-semibold text-charcoal">
            Password
            <Input
              className="mt-1.5"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button
            className="w-full"
            type="submit"
            disabled={submitting || loading}
          >
            {submitting ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-charcoal/40">
          <span className="h-px flex-1 bg-mist" />
          or
          <span className="h-px flex-1 bg-mist" />
        </div>

        <Button
          className="w-full"
          variant="secondary"
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || loading}
        >
          Sign in with Google
        </Button>

        <p className="mt-6 text-center text-sm text-charcoal/70">
          {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
          <button
            className="font-semibold text-turf underline underline-offset-4"
            type="button"
            onClick={() => {
              setError(null);
              setMode(isSignUp ? "login" : "signup");
            }}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </Card>
    </section>
  );
}
