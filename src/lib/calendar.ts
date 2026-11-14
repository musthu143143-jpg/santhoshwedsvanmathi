import { wedding } from "@/config";

const pad = (n: number) => String(n).padStart(2, "0");

/** 2027-06-12T14:00:00Z → 20270612T140000Z */
function toUtcStamp(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

const title = `${wedding.partnerOne} & ${wedding.partnerTwo}'s Wedding`;
const location = `${wedding.venue}, ${wedding.city}, ${wedding.country}`;
const description = `Save the date! ${wedding.partnerOne} & ${wedding.partnerTwo} are getting married. Formal invitation to follow. ${wedding.hashtag}`;

export const ceremonyStart = new Date(wedding.ceremonyStartISO);
export const celebrationEnd = new Date(wedding.celebrationEndISO);

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toUtcStamp(ceremonyStart)}/${toUtcStamp(celebrationEnd)}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const escapeIcs = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function downloadIcs() {
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Save the Date//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${toUtcStamp(ceremonyStart)}-${wedding.partnerOne.toLowerCase()}-${wedding.partnerTwo.toLowerCase()}@save-the-date`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(ceremonyStart)}`,
    `DTEND:${toUtcStamp(celebrationEnd)}`,
    `SUMMARY:${escapeIcs(title)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P14D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(title)} is in two weeks`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${wedding.partnerOne}-and-${wedding.partnerTwo}-save-the-date.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function mapsUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wedding.mapQuery)}`;
}

/** Key-less Google Maps embed for the venue card. */
export function mapEmbedUrl() {
  return `https://maps.google.com/maps?q=${encodeURIComponent(wedding.mapQuery)}&z=13&output=embed`;
}
