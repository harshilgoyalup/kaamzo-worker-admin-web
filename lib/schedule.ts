export interface ScheduleWindow {
  startDate: string | Date;
  endDate: string | Date;
  shiftStartTime: string; // e.g. "09:00"
  shiftEndTime: string;   // e.g. "14:00"
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toLowerCase();
  
  if (clean.includes("am") || clean.includes("pm")) {
    const isPm = clean.includes("pm");
    const parts = clean.replace(/am|pm/g, "").trim().split(":");
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  const [h, m] = clean.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function hasDateOverlap(
  start1: string | Date,
  end1: string | Date,
  start2: string | Date,
  end2: string | Date
): boolean {
  const dStart1 = new Date(start1).getTime();
  const dEnd1 = new Date(end1).getTime();
  const dStart2 = new Date(start2).getTime();
  const dEnd2 = new Date(end2).getTime();

  if (isNaN(dStart1) || isNaN(dEnd1) || isNaN(dStart2) || isNaN(dEnd2)) {
    return false;
  }

  return dStart1 <= dEnd2 && dEnd1 >= dStart2;
}

export function hasTimeOverlap(
  shiftStart1: string,
  shiftEnd1: string,
  shiftStart2: string,
  shiftEnd2: string
): boolean {
  const s1 = parseTimeToMinutes(shiftStart1);
  const e1 = parseTimeToMinutes(shiftEnd1);
  const s2 = parseTimeToMinutes(shiftStart2);
  const e2 = parseTimeToMinutes(shiftEnd2);

  return s1 < e2 && e1 > s2;
}

export function hasReservationConflict(
  proposed: ScheduleWindow,
  existing: ScheduleWindow
): boolean {
  const dateOverlaps = hasDateOverlap(
    proposed.startDate,
    proposed.endDate,
    existing.startDate,
    existing.endDate
  );

  if (!dateOverlaps) return false;

  const timeOverlaps = hasTimeOverlap(
    proposed.shiftStartTime,
    proposed.shiftEndTime,
    existing.shiftStartTime,
    existing.shiftEndTime
  );

  return timeOverlaps;
}

export const CONFLICT_MESSAGES = {
  en: "You already have an accepted reservation scheduled during this time.",
  hi: "इस समय के दौरान आपके पास पहले से एक स्वीकार की गई बुकिंग है।",
  pa: "ਤੁਹਾਡੇ ਕੋਲ ਇਸ ਸਮੇਂ ਦੌਰਾਨ ਪਹਿਲਾਂ ਹੀ ਇੱਕ ਸਵੀਕਾਰ ਕੀਤੀ ਰਿਜ਼ਰਵੇਸ਼ਨ ਹੈ।",
} as const;

export function getConflictMessage(lang: "en" | "hi" | "pa" = "en"): string {
  return CONFLICT_MESSAGES[lang] || CONFLICT_MESSAGES.en;
}
