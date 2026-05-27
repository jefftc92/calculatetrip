export function ratingColor(score) {
  if (score === null) return 'text-gray-400'
  if (score >= 9.5) return 'text-green-600'
  if (score >= 9.0) return 'text-green-500'
  if (score >= 8.0) return 'text-yellow-500'
  return 'text-orange-500'
}

export function ratingBg(score) {
  if (score === null) return 'bg-gray-200'
  if (score >= 9.5) return 'bg-green-500'
  if (score >= 9.0) return 'bg-green-400'
  if (score >= 8.0) return 'bg-yellow-400'
  return 'bg-orange-400'
}

export function ratingLabel(score) {
  if (score === null) return 'N/A'
  if (score >= 9.5) return 'Exceptional'
  if (score >= 9.0) return 'Superb'
  if (score >= 8.0) return 'Excellent'
  if (score >= 7.0) return 'Good'
  return 'Fair'
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function countryFromSlug(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const RATING_LABELS = {
  overall:      'Overall',
  food:         'Food & Dining',
  beach:        'Beach',
  pool:         'Pool',
  atmosphere:   'Atmosphere',
  location:     'Location',
  room:         'Rooms',
  value:        'Value for Money',
  cleanliness:  'Cleanliness',
  service:      'Service',
  sleepQuality: 'Sleep Quality',
}

export const SITE_URL = 'https://www.calculatetrip.com'
export const SITE_NAME = 'CalculateTrip'
