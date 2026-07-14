import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Badge, Button, Card, Input, Select } from "./components/ui";

export function UiPreview() {
  return (
    <main className="min-h-screen bg-chalk px-4 py-10 text-charcoal sm:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="border-b-2 border-turf pb-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-turf uppercase">SquadUp UI foundation</p>
          <h1 className="mt-1 font-display text-[length:var(--text-h1)] leading-none font-bold">Pickup, on the line.</h1>
          <p className="mt-3 max-w-xl text-sm text-charcoal/70">A standalone preview for shared UI primitives. It does not change any app route.</p>
        </header>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-[length:var(--text-h3)] font-bold">Saturday five-a-side</p>
              <p className="mt-1 text-sm text-charcoal/70">Central Turf · 7:30 PM</p>
            </div>
            <div className="text-right">
              <Badge status="open">Open</Badge>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums">3/5</p>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="font-display text-[length:var(--text-h3)] font-bold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Join game</Button>
            <Button variant="secondary">View details</Button>
            <Button variant="danger">Leave game</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[length:var(--text-h3)] font-bold">Fields</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input aria-label="Game name" placeholder="Game name" />
            <Select aria-label="Sport" defaultValue="">
              <option value="" disabled>Choose a sport</option>
              <option>Football</option>
              <option>Basketball</option>
            </Select>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-[length:var(--text-h3)] font-bold">Status badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge status="open">Open</Badge>
            <Badge status="full">Full</Badge>
            <Badge status="cancelled">Cancelled</Badge>
            <Badge status="expired">Expired</Badge>
            <Badge>Draft</Badge>
          </div>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UiPreview />
  </StrictMode>,
);
