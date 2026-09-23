"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dictionaries } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { nextBirthday, type BirthdayPerson } from "@/lib/dates";
import { Arrow } from "./icons";
export function Birthday({
  locale,
  people,
}: {
  locale: Locale;
  people: BirthdayPerson[];
}) {
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    const refresh = () =>
      setDate(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Tokyo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date()),
      );
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);
  const person = date ? nextBirthday(people, date) : null;
  if (!person) return <div className="birthday-space" />;
  const d = dictionaries[locale];
  return (
    <aside className="birthday-strip">
      <div>
        <span className="eyebrow">
          {person.isToday ? d.todayBirthday : d.nextBirthday}
        </span>
        <p className="birthday-name">
          <Link href={`/${locale}/seiyuu/${person.slug}`}>
            {locale === "en" ? person.romaji : person.name}
            <Arrow />
          </Link>
        </p>
      </div>
      <span className="birthday-date">
        {String(person.birth.month).padStart(2, "0")}
        <i>/</i>
        {String(person.birth.day).padStart(2, "0")}
      </span>
    </aside>
  );
}
