"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { dictionaries, tr } from "@/lib/i18n";
import { emptyFilters, filterPeople, type Filters } from "@/lib/search";
import type { Agency, Locale, Seiyuu } from "@/lib/types";
import { PersonCard } from "./person-card";
import { SearchIcon, Wave } from "./icons";

export function Explore({
  locale,
  people,
  agencies,
  initialFilters,
}: {
  locale: Locale;
  people: Seiyuu[];
  agencies: Agency[];
  initialFilters: Filters;
}) {
  const d = dictionaries[locale];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState(initialFilters);
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);
  const filtered = filterPeople(people, filters);
  const decades = [
    ...new Set(
      people.flatMap((p) =>
        p.debutYear ? [Math.floor(p.debutYear / 10) * 10] : [],
      ),
    ),
  ].sort();
  const years = [
    ...new Set(people.flatMap((p) => (p.debutYear ? [p.debutYear] : []))),
  ].sort();
  const change = (key: keyof Filters, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const params = new URLSearchParams(
      Object.entries(next).filter(([, v]) => v),
    );
    // Replace avoids one browser-history entry per keystroke; filters remain shareable.
    startTransition(() =>
      router.replace(`/${locale}/seiyuu${params.size ? `?${params}` : ""}`, {
        scroll: false,
      }),
    );
  };
  const clear = () => {
    setFilters(emptyFilters);
    startTransition(() =>
      router.replace(`/${locale}/seiyuu`, { scroll: false }),
    );
  };
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <>
      <div className="directory-search">
        <SearchIcon />
        <input
          type="search"
          value={filters.q}
          onChange={(event) => change("q", event.target.value)}
          placeholder={d.query}
          aria-label={d.query}
          autoComplete="off"
        />
        {filters.q && (
          <button
            className="text-button"
            onClick={() => change("q", "")}
            aria-label={d.clear}
          >
            ×
          </button>
        )}
      </div>
      <div className="directory-tools">
        <details className="filters-disclosure" open>
          <summary>
            {d.filters}
            <span aria-hidden="true">+</span>
          </summary>
          <div className="filter-controls">
            <label>
              {d.agency}
              <select
                value={filters.agency}
                onChange={(e) => change("agency", e.target.value)}
              >
                <option value="">{d.all}</option>
                {agencies.map((agency) => (
                  <option value={agency.id} key={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {d.month}
              <select
                value={filters.month}
                onChange={(e) => change("month", e.target.value)}
              >
                <option value="">{d.all}</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option value={i + 1} key={i}>
                    {new Intl.DateTimeFormat(locale, {
                      month: "long",
                      timeZone: "UTC",
                    }).format(new Date(Date.UTC(2000, i, 1)))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {d.generation}
              <select
                value={filters.decade}
                onChange={(e) => change("decade", e.target.value)}
              >
                <option value="">{d.all}</option>
                {decades.map((year) => (
                  <option value={year} key={year}>
                    {year}s
                  </option>
                ))}
                <option value="unknown">{d.undocumented}</option>
              </select>
            </label>
            <label>
              {d.gender}
              <select
                value={filters.gender}
                onChange={(e) => change("gender", e.target.value)}
              >
                <option value="">{d.all}</option>
                <option value="female">{d.female}</option>
                <option value="male">{d.male}</option>
                <option value="unknown">{d.undocumented}</option>
              </select>
            </label>
            <label>
              {d.debutYear}
              <select
                value={filters.year}
                onChange={(e) => change("year", e.target.value)}
              >
                <option value="">{d.all}</option>
                {years.map((year) => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
                <option value="unknown">{d.undocumented}</option>
              </select>
            </label>
          </div>
        </details>
        <span className="result-count" aria-live="polite" aria-atomic="true">
          <strong>{String(filtered.length).padStart(2, "0")}</strong>{" "}
          {d.results}
        </span>
      </div>
      <div className="kana-bar">
        <div
          role="group"
          aria-label={tr(locale, "五十音索引", "五十音順", "Kana index")}
        >
          {["", "あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"].map(
            (kana) => (
              <button
                key={kana}
                className={filters.kana === kana ? "selected" : ""}
                aria-pressed={filters.kana === kana}
                onClick={() => change("kana", kana)}
              >
                {kana || d.all}
              </button>
            ),
          )}
        </div>
        {hasFilters && (
          <button className="clear-filters" onClick={clear}>
            {d.clear} <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <div className="directory-grid" aria-busy={pending}>
        {filtered.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            locale={locale}
            headingLevel={2}
            index={people.findIndex((p) => p.id === person.id)}
            agencyName={agencies.find((a) => a.id === person.agencyId)!.name}
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="directory-empty">
          <Wave />
          <h2>{d.empty}</h2>
          <button className="text-link" onClick={clear}>
            {d.clear}
          </button>
        </div>
      )}
    </>
  );
}
