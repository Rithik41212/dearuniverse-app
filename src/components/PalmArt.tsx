import type { SVGProps } from "react";

export function PalmIcon(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8 12V5a1.5 1.5 0 0 1 3 0v6-8a1.5 1.5 0 0 1 3 0v8-6a1.5 1.5 0 0 1 3 0v7-3a1.5 1.5 0 0 1 3 0v6c0 4-2.5 7-6 7h-1c-3 0-4.5-2-6-4l-3-4c-1.2-1.8.8-3.5 2-2l2 2Z" />
    <path d="M10 15c3-1 5 0 6 2m-4-4v6" />
  </svg>;
}

export default function PalmArt({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 300 320" fill="none" className={className} aria-hidden="true">
    <circle cx="150" cy="174" r="115" fill="#100e0d" fillOpacity=".78" />
    <g stroke="#c39159" strokeWidth=".65" opacity=".2">
      <circle cx="150" cy="161" r="139" /><circle cx="150" cy="161" r="128" strokeDasharray="2 7" />
      <path d="M150 10v302M0 161h300M44 55l212 212M44 267 256 55" />
    </g>
    <g stroke="#c58e56" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path fill="#171410" d="M113 301l-3-27c-30-16-41-39-48-62L38 158c-8-20 5-29 20-15 15 12 21 25 30 41l-17-120c-3-26 19-29 25-8l15 77 2-108c1-24 27-24 29 0l2 105 15-88c4-23 29-19 27 3l-10 93 21-60c7-21 30-12 24 7l-23 75 25-40c12-18 31-4 20 13l-30 59c-9 19-5 43-18 66l-8 43" />
      <path d="M72 169c3 10 10 16 16 19 28 19 40 48 40 77M99 183c34 5 71 11 95 26M109 170c29 8 56 10 90 8M140 154l-1 113M171 167l-17 79M189 174l-29 94M110 274c30 17 62 8 81-12M149 292l-1 12" stroke="#e2a166" strokeWidth="1.7" />
      <path d="m79 61 11-2m-7 38 12-2m28-59 10 1m-11 39 13 0m28-29 10 1m-16 39 13 1m31-6 9 3m-67 47 10 0M45 158l11-5" opacity=".75" />
      <path d="m46 268 3-11 3 11 7 3-7 3-3 11-3-11-7-3Zm202-98 3-10 3 10 6 3-6 3-3 10-3-10-6-3ZM239 50l4-16 4 16 8 4-8 4-4 16-4-16-8-4ZM78 21l3-10 3 10 5 3-5 3-3 10-3-10-5-3Z" />
    </g>
  </svg>;
}
