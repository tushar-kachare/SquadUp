import { useState } from "react";
import type { FormEvent } from "react";
import type { User } from "@squadup/shared";
import { createUser, getUser } from "../api/users.api";
import { Alert, Badge, Button, Card, Input, formatErrorMessage } from "../components/ui";

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
      setMessage(`Successfully created user profile for ${created.displayName}.`);
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to create user. Please try again."));
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
      setMessage(`Found user profile for ${found.displayName}.`);
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to fetch user profile. Please check the ID."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="font-display text-[length:var(--text-h1)] leading-none font-bold text-charcoal">
          User Management
        </h1>
        <p className="font-body text-base text-charcoal/70">
          Create or look up user profiles for SquadUp player accounts.
        </p>
      </section>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[length:var(--text-h3)] leading-none font-bold text-charcoal mb-4">
            Create User Profile
          </h2>
          <form className="space-y-4" onSubmit={handleCreate}>
            <label className="block text-sm font-semibold text-charcoal">
              Firebase UID
              <Input
                className="mt-1.5"
                value={firebaseUid}
                onChange={(event) => setFirebaseUid(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-semibold text-charcoal">
              Display Name
              <Input
                className="mt-1.5"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm font-semibold text-charcoal">
              Email Address
              <Input
                className="mt-1.5"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="font-display text-[length:var(--text-h3)] leading-none font-bold text-charcoal mb-4">
            Look Up User
          </h2>
          <form className="space-y-4" onSubmit={handleLookup}>
            <label className="block text-sm font-semibold text-charcoal">
              User ID
              <Input
                className="mt-1.5"
                placeholder="Enter user GUID"
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
                required
              />
            </label>

            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Find User"}
            </Button>
          </form>
        </Card>
      </div>

      {user && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-mist pb-3">
            <h3 className="font-display text-xl font-bold text-charcoal">User Profile</h3>
            <Badge status="open">Active Account</Badge>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">
                Display Name
              </p>
              <p className="mt-0.5 font-medium text-charcoal">{user.displayName}</p>
            </div>
            <div>
              <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">
                Email
              </p>
              <p className="mt-0.5 font-medium text-charcoal">{user.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">
                User ID
              </p>
              <p className="mt-0.5 font-mono text-xs text-charcoal/80">{user.id}</p>
            </div>
            <div>
              <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">
                Member Since
              </p>
              <p className="mt-0.5 font-medium text-charcoal">
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
