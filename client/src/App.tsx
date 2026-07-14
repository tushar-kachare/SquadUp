import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { CreateGamePage } from "./pages/CreateGamePage";
import { GameDetailsPage } from "./pages/GameDetailsPage";
import { GamesPage } from "./pages/GamesPage";
import { UsersPage } from "./pages/UsersPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";
import { InstallPrompt } from "./components/InstallPrompt";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { Button, Card } from "./components/ui";

function getInitials(displayName: string | null, email: string | null) {
  const name = displayName?.trim();

  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return (email?.split("@")[0].slice(0, 2) || "SU").toUpperCase();
}

function App() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const isOnline = useOnlineStatus();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isProfileMenuOpen]);

  if (loading) {
    return <p className="p-4 text-sm text-slate-600">Checking authentication...</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="relative z-[1000] border-b border-mist bg-chalk">
        {!isOnline && (
          <p className="bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-900">
            You&apos;re offline. You can browse cached games, but creating or joining games is unavailable.
          </p>
        )}
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl leading-none font-bold text-charcoal">SquadUp</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-medium">
            <InstallPrompt />
            {isOnline ? (
              <Button onClick={() => navigate("/games/new")}>Create Game</Button>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-10 cursor-not-allowed items-center justify-center rounded-md border border-mist bg-mist/30 px-4 py-2 text-sm font-semibold text-charcoal/40"
                title="Reconnect to create a game"
              >
                Create Game
              </span>
            )}
            <Button variant="secondary" onClick={() => navigate("/games")}>Games</Button>
            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="menu"
                  aria-label="Open profile menu"
                  className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-mist bg-turf/10 font-display text-base font-bold text-turf transition-colors hover:border-turf focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turf"
                  type="button"
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                >
                  {user.photoURL ? (
                    <img alt="" className="size-full object-cover" referrerPolicy="no-referrer" src={user.photoURL} />
                  ) : (
                    getInitials(user.displayName, user.email)
                  )}
                </button>

                {isProfileMenuOpen && (
                  <Card className="absolute right-0 top-full z-20 mt-2 w-56 !p-2 shadow-sm">
                    <p className="px-2 pb-3 text-sm font-medium text-charcoal/70">
                      {user.displayName || user.email || "Signed in"}
                    </p>
                    <div className="space-y-1" role="menu">
                      <Button
                        className="w-full !justify-start"
                        title="Profile page coming soon"
                        variant="secondary"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        View Profile
                      </Button>
                      <Button
                        className="w-full !justify-start"
                        variant="danger"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          void signOut();
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Button variant="secondary" onClick={() => navigate("/login")}>Login</Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/games" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/games/new" element={user && isOnline ? <CreateGamePage /> : <Navigate to={user ? "/games" : "/login"} replace />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/games/:id" element={user ? <GameDetailsPage /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/games" replace /> : <LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
