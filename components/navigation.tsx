"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/types";
import { dictionaries, locales, tr } from "@/lib/i18n";
import { searchEntries, type SearchEntry } from "@/lib/search";
import { Arrow, SearchIcon, ThemeIcon, Wave } from "./icons";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <div className="language-switch" aria-label={dictionaries[locale].language}>
      {locales.map((lang) => (
        <a
          key={lang}
          href={pathname.replace(/^\/(zh-CN|ja-JP|en)(?=\/|$)/, `/${lang}`)}
          onClick={(event) => {
            if (
              !event.metaKey &&
              !event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey
            ) {
              event.preventDefault();
              window.location.assign(
                pathname.replace(/^\/(zh-CN|ja-JP|en)(?=\/|$)/, `/${lang}`) +
                  window.location.search +
                  window.location.hash,
              );
            }
          }}
          lang={lang}
          hrefLang={lang}
          aria-label={
            {
              "zh-CN": "中 · 简体中文",
              "ja-JP": "JP · 日本語",
              en: "EN · English",
            }[lang]
          }
          aria-current={lang === locale ? "true" : undefined}
        >
          {{ "zh-CN": "中", "ja-JP": "JP", en: "EN" }[lang]}
        </a>
      ))}
    </div>
  );
}

export function Navigation({
  locale,
  entries,
}: {
  locale: Locale;
  entries: SearchEntry[];
}) {
  const d = dictionaries[locale];
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = searchEntries(entries, query).slice(0, 16);
  const visibleResults = query.trim()
    ? results
    : entries.filter((entry) => entry.kind === "people").slice(0, 4);
  useEffect(() => {
    if (dialog.current?.open)
      document
        .getElementById(`search-result-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  const open = () => {
    setQuery("");
    setActive(0);
    dialog.current?.showModal();
    input.current?.focus();
  };
  const close = () => dialog.current?.close();
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          setQuery("");
          setActive(0);
          dialog.current?.showModal();
          input.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  const toggleTheme = () => {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("seiyuu-theme", next);
    } catch {
      /* The theme still works when browser storage is disabled. */
    }
  };
  return (
    <>
      <header className="site-header shell">
        <Link href={`/${locale}`} className="brand">
          seiyuu<span className="brand-dot">.</span>
          <span className="brand-ja" lang="ja">
            声優
          </span>
        </Link>
        <nav className="primary-nav" aria-label={d.menu}>
          {[
            ["seiyuu", d.explore],
            ["journal", d.journal],
            ["about", d.about],
          ].map(([path, label]) => (
            <Link
              key={path}
              href={`/${locale}/${path}`}
              aria-current={pathname.includes(`/${path}`) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-utilities">
          <button
            className="search-trigger"
            ref={trigger}
            onClick={open}
            aria-label={d.search}
            aria-keyshortcuts="Control+k Meta+k"
          >
            <SearchIcon />
            <span>{d.search}</span>
            <kbd aria-hidden="true">⌘ K</kbd>
          </button>
          <LanguageSwitcher locale={locale} />
          <button
            className="icon-button theme-button"
            onClick={toggleTheme}
            aria-label={d.theme}
          >
            <ThemeIcon />
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="search-title"
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="search-inner">
          <div className="search-heading">
            <h2 id="search-title">{d.search}</h2>
            <button
              className="text-button"
              onClick={close}
              aria-label={d.close}
            >
              Esc <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="dialog-input">
            <SearchIcon />
            <input
              ref={input}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              placeholder={d.searchPlaceholder}
              aria-label={d.searchPlaceholder}
              role="combobox"
              aria-expanded="true"
              aria-controls="search-results"
              aria-autocomplete="list"
              aria-activedescendant={
                visibleResults[active] ? `search-result-${active}` : undefined
              }
              autoComplete="off"
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((n) =>
                    Math.max(0, Math.min(n + 1, visibleResults.length - 1)),
                  );
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((n) => Math.max(0, n - 1));
                }
                if (event.key === "Enter" && visibleResults[active]) {
                  event.preventDefault();
                  document.getElementById(`search-link-${active}`)?.click();
                }
              }}
            />
          </div>
          {query === "こえ" && (
            <div className="koe-easter" aria-hidden="true">
              <Wave />
            </div>
          )}
          <p className="search-section-label">
            {query.trim()
              ? `${visibleResults.length} ${tr(locale, "项结果", "件", "results")}`
              : d.searchHint}
          </p>
          <ul
            id="search-results"
            role="listbox"
            aria-label={d.search}
            className="search-results"
          >
            {visibleResults.map((entry, index) => (
              <li
                key={`${entry.kind}-${entry.id}`}
                role="option"
                id={`search-result-${index}`}
                aria-selected={active === index}
              >
                <Link
                  id={`search-link-${index}`}
                  href={`/${locale}${entry.path}`}
                  onClick={close}
                  onFocus={() => setActive(index)}
                  className={
                    active === index ? "search-result active" : "search-result"
                  }
                >
                  <span className="search-result-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="search-result-name">
                    <strong>{entry.label[locale]}</strong>
                    <small>{entry.secondary}</small>
                  </span>
                  <span className="search-kind">{d[entry.kind]}</span>
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
          {!visibleResults.length && (
            <div className="search-empty">
              <p>{d.empty}</p>
              <span>{d.searchEmpty}</span>
            </div>
          )}
          <div className="search-bottom" aria-hidden="true">
            <span>↑ ↓</span>
            <span>↵</span>
            <span>SEIYUU — 声の記録</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
