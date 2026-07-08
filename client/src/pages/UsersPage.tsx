import { useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@squadup/shared";
import { createUser, getUser } from "../api/users.api";

export function UsersPage() {
  const [firebaseUid, setFirebaseUid] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const created = await createUser({
        firebaseUid,
        displayName,
        email: email || undefined,
      });
      setUser(created);
      setMessage(`Created user ${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const found = await getUser(lookupId);
      setUser(found);
      setMessage(`Found user ${found.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-4">
        <h1 className="text-xl font-semibold text-slate-950">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create and fetch temporary users for manual game testing.
        </p>
      </section>

      {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded border border-slate-200 bg-white p-4" onSubmit={handleCreate}>
          <h2 className="font-semibold text-slate-950">Create User</h2>
          <label className="block text-sm font-medium text-slate-700">
            Firebase UID
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={firebaseUid} onChange={(event) => setFirebaseUid(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Display Name
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <button className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={loading}>
            Create User
          </button>
        </form>

        <form className="space-y-4 rounded border border-slate-200 bg-white p-4" onSubmit={handleLookup}>
          <h2 className="font-semibold text-slate-950">Get User</h2>
          <label className="block text-sm font-medium text-slate-700">
            User ID
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={lookupId} onChange={(event) => setLookupId(event.target.value)} required />
          </label>
          <button className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={loading}>
            Fetch User
          </button>
        </form>
      </div>

      {user && (
        <pre className="overflow-auto rounded border border-slate-200 bg-slate-50 p-4 text-sm">
          {JSON.stringify(user, null, 2)}
        </pre>
      )}
    </div>
  );
}
