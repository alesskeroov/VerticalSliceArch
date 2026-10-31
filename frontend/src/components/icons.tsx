import type { SVGProps } from 'react';

// İkonlar öz SVG-lərimizdir; klub və liqa nişanlarından istifadə edilmir.
function Icon(props: SVGProps<SVGSVGElement>) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" focusable="false" {...props} />;
}
export function PlusIcon() { return <Icon><path d="M12 5v14M5 12h14" /></Icon>; }
export function CheckIcon() { return <Icon><path d="m5 12 4 4L19 6" /></Icon>; }
export function TrashIcon() {
  return <Icon><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7M14 10v7" /></Icon>;
}
export function BallIcon() {
  return <Icon><circle cx="12" cy="12" r="9" /><path d="m12 8 4 3-1.5 4.5h-5L8 11 12 8v-5M16 11l4.5-2M14.5 15.5l3 4M9.5 15.5l-3 4M8 11 3.5 9" /></Icon>;
}
export function PitchIcon() {
  return <Icon width="80" height="52" viewBox="0 0 80 52" strokeWidth="1.5">
    <rect x="2" y="2" width="76" height="48" rx="3" />
    <path d="M40 2v48M2 14h12v24H2M78 14H66v24h12" /><circle cx="40" cy="26" r="9" />
  </Icon>;
}
export function RedCardIcon() {
  return <Icon width="16" height="22" viewBox="0 0 16 22"><rect x="1" y="1" width="14" height="20" rx="2" fill="currentColor" stroke="none" /></Icon>;
}
export function YellowCardIcon() { return <RedCardIcon />; }
export function TrophyIcon() {
  return <Icon><path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H3v3a4 4 0 0 0 4 4M17 5h4v3a4 4 0 0 1-4 4M12 14v6M8 21h8" /></Icon>;
}
