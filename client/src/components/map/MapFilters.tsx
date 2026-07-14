import { useEffect, useRef, useState } from "react";
import type { Sport } from "@squadup/shared";
import { Button, Card } from "../ui";

type MapFiltersProps = {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  selectedSportIds: number[];
  onSelectedSportsChange: (ids: number[]) => void;
  sports: Sport[];
  resultCount: number;
};

export function MapFilters({
  radiusKm,
  onRadiusChange,
  selectedSportIds,
  onSelectedSportsChange,
  sports,
  resultCount,
}: MapFiltersProps) {
  const [isSportMenuOpen, setIsSportMenuOpen] = useState(false);
  const sportMenuRef = useRef<HTMLDivElement>(null);
  const selectedSportNames = sports
    .filter((sport) => selectedSportIds.includes(sport.id))
    .map((sport) => sport.name);

  useEffect(() => {
    if (!isSportMenuOpen) {
      return;
    }

    const closeSportMenu = (event: MouseEvent) => {
      if (!sportMenuRef.current?.contains(event.target as Node)) {
        setIsSportMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSportMenu);
    return () => document.removeEventListener("mousedown", closeSportMenu);
  }, [isSportMenuOpen]);

  const toggleSport = (sportId: number) => {
    onSelectedSportsChange(
      selectedSportIds.includes(sportId)
        ? selectedSportIds.filter((id) => id !== sportId)
        : [...selectedSportIds, sportId],
    );
  };

  return (
    <Card className="flex h-full w-full !p-6">
      <div className="flex flex-1 flex-col">
        <div className="space-y-10">
        <label className="block">
          <span className="block font-display text-[length:var(--text-h4)] leading-none font-bold text-charcoal">Sports</span>
          <span className="mt-1 block text-[length:var(--text-caption)] text-charcoal/65">
            {selectedSportNames.length > 0
              ? selectedSportNames.join(", ")
              : "All sports"}
          </span>
          <div className="relative mt-2" ref={sportMenuRef}>
            <Button
              aria-expanded={isSportMenuOpen}
              aria-haspopup="listbox"
              className="w-full !justify-between"
              variant="secondary"
              onClick={() => setIsSportMenuOpen((isOpen) => !isOpen)}
            >
              <span>{selectedSportNames.length > 0 ? "Change sports" : "Choose sports"}</span>
              <span aria-hidden="true">{isSportMenuOpen ? "↑" : "↓"}</span>
            </Button>
            {isSportMenuOpen && (
              <div
                aria-label="Sports"
                aria-multiselectable="true"
                className="absolute z-10 mt-2 max-h-56 w-full overflow-y-auto rounded-md border border-mist bg-white p-1 shadow-sm"
                role="listbox"
              >
                {sports.map((sport) => {
                  const isSelected = selectedSportIds.includes(sport.id);

                  return (
                    <button
                      key={sport.id}
                      aria-selected={isSelected}
                      className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-turf/10 font-semibold text-turf"
                          : "text-charcoal hover:bg-mist/50"
                      }`}
                      role="option"
                      type="button"
                      onClick={() => toggleSport(sport.id)}
                    >
                      {sport.name}
                      <span aria-hidden="true">{isSelected ? "✓" : ""}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </label>

        <label className="block">
          <span className="block font-display text-[length:var(--text-h4)] leading-none font-bold text-charcoal">
            Radius: <span className="tabular-nums">{radiusKm} km</span>
          </span>
          <input
            className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-mist accent-turf"
            type="range"
            min="1"
            max="10"
            step="1"
            value={radiusKm}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
          />
          <div className="mt-1 flex justify-between text-[length:var(--text-caption)] text-charcoal/55">
            <span>1 km</span>
            <span>10 km</span>
          </div>
        </label>
        </div>

        <div className="mt-auto border-t border-mist pt-5">
          <p className="font-display text-[length:var(--text-h3)] leading-none font-bold text-charcoal tabular-nums">
            {resultCount}
          </p>
          <p className="mt-1 text-[length:var(--text-caption)] text-charcoal/65">
            {resultCount === 1 ? "game found nearby" : "games found nearby"}
          </p>
        </div>
      </div>
    </Card>
  );
}
