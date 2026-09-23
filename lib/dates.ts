export interface BirthdayPerson {
  slug: string;
  name: string;
  romaji: string;
  birth: { month: number; day: number };
}
export function nextBirthday(people: BirthdayPerson[], today: string) {
  const [year, month, day] = today.split("-").map(Number);
  const now = Date.UTC(year, month - 1, day);
  const sorted = people
    .map((person) => {
      // Leap-day birthdays are shown on February 28 in non-leap years.
      const timestamp = (y: number) =>
        Date.UTC(
          y,
          person.birth.month - 1,
          Math.min(
            person.birth.day,
            new Date(Date.UTC(y, person.birth.month, 0)).getUTCDate(),
          ),
        );
      let next = timestamp(year);
      if (next < now) next = timestamp(year + 1);
      return {
        ...person,
        next,
        isToday: person.birth.month === month && person.birth.day === day,
      };
    })
    .sort((a, b) => a.next - b.next);
  return sorted[0] ?? null;
}
