import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import { CreateGamePage } from "./pages/CreateGamePage";
import { GameDetailsPage } from "./pages/GameDetailsPage";
import { GamesPage } from "./pages/GamesPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";

function App() {
  const [status, setStatus] = useState("checking...");
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/health`)
      .then((res) => res.json())
      .then((data: { status?: string }) => setStatus(data.status ?? "unknown"))
      .catch(() => setStatus("failed to connect"));
  }, []);
  if (loading) {
    return <p className="p-4 text-sm text-slate-600">Checking authentication...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-slate-950">SquadUp</p>
            <p className="text-sm text-slate-600">Backend status: {status}</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-medium">
            <Link className="rounded border border-slate-300 px-3 py-2 text-slate-950" to="/games/new">Create Game</Link>
            <Link className="rounded border border-slate-300 px-3 py-2 text-slate-950" to="/games">Games</Link>
            {user ? (
              <div className="flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-slate-700">
                <span>{user.displayName || user.email || "Signed in"}</span>
                <button className="font-medium text-slate-950 underline" type="button" onClick={() => void signOut()}>
                  Logout
                </button>
              </div>
            ) : (
              <Link className="rounded border border-slate-300 px-3 py-2 text-slate-950" to="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/games/new" element={user ? <CreateGamePage /> : <Navigate to="/login" replace />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={user ? <GameDetailsPage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/games" replace /> : <LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
