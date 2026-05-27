import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const RATING_LABELS: Record<string, string> = {
  overall: 'Overall',
  food: 'Food & Dining',
  beach: 'Beach',
  pool: 'Pool',
  atmosphere: 'Atmosphere',
  location: 'Location',
  room: 'Rooms',
  value: 'Value',
  cleanliness: 'Cleanliness',
  service: 'Service',
  sleepQuality: 'Sleep Quality',
}

export function countryFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
