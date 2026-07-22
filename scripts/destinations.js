// Shared destination knowledge and text helpers used by both the pair
// overview writer (formulaic-overview.js) and the per-resort writer
// (formulaic-resort.js). Pure data + pure functions, no API calls.

// ---- deterministic per-key randomness ---------------------------------------
function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

function rngFor(key) {
  let a = hashStr(key) || 1
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)] }

// ---- small text helpers ------------------------------------------------------
function fmt(v) { return v != null ? v.toFixed(1) : null }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

function listJoin(items) {
  if (items.length <= 1) return items.join('')
  return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1]
}

// Countries whose names take a definite article in running prose
// ("in the Bahamas", but "in Mexico"). Bare names stay correct in
// adjectival use ("a Bahamas all-inclusive"), so apply these helpers
// only where the name stands alone in a sentence.
const THE_COUNTRIES = new Set([
  'Bahamas', 'Dominican Republic', 'United States', 'Turks and Caicos',
  'Maldives', 'Philippines', 'British Virgin Islands', 'US Virgin Islands',
  'United Arab Emirates', 'Cayman Islands',
])

function countryName(c) {
  if (!c || !c.trim()) return 'the region'
  return THE_COUNTRIES.has(c) ? `the ${c}` : c
}

function countryPossessive(c) {
  const n = countryName(c)
  return n.endsWith('s') ? `${n}'` : `${n}'s`
}

function locationOf(r) {
  if (r.area && r.area !== r.country) {
    return r.country ? `${r.area}, ${countryName(r.country)}` : r.area
  }
  return r.country ? countryName(r.country) : (r.area || 'the region')
}

function shortLoc(r) {
  return (r.area && r.area !== r.country ? r.area : r.country) || 'the region'
}

// ---- rating vocabulary -------------------------------------------------------
const CATEGORY = {
  food: {
    noun: 'dining',
    strength: 'the restaurants and all-inclusive meal program',
    consequences: [
      "a gap you'd feel at every meal",
      'and restaurant quality is the one thing an all-inclusive guest cannot escape',
      'which matters three times a day on an all-inclusive plan',
    ],
  },
  beach: {
    noun: 'the beach',
    strength: 'the beach',
    consequences: [
      'decisive if beach time is the whole point of the trip',
      "worth real weight if you picture the trip from a lounger",
      'a difference measured in sand and swimmability, not decor',
    ],
  },
  pool: {
    noun: 'the pool scene',
    strength: 'the pool complex',
    consequences: [
      'worth noting if you expect to spend most days poolside',
      'the kind of gap that shapes a sea-day-free vacation',
      'relevant on any day the wind picks up and the beach empties',
    ],
  },
  atmosphere: {
    noun: 'atmosphere',
    strength: 'the atmosphere and setting',
    consequences: [
      'a sign the two properties feel very different to walk around',
      'the hardest category to fix with money, which makes the gap telling',
      'usually reflecting grounds, energy, and how the space flows',
    ],
  },
  location: {
    noun: 'location',
    strength: 'its location',
    consequences: [
      'a fixed advantage no renovation can copy',
      'the one score a resort can never improve',
      'which speaks to the setting itself rather than the property',
    ],
  },
  room: {
    noun: 'rooms',
    strength: 'the rooms',
    consequences: [
      'and you spend more hours in the room than most people budget for',
      'worth checking against recent photos before booking',
      'often the difference between a dated build and a recent refresh',
    ],
  },
  value: {
    noun: 'value for money',
    strength: 'value for money',
    consequences: [
      'meaning guests felt the bill matched the experience at one and not quite at the other',
      'a useful tiebreaker when the headline rates look similar',
      'the score that says whether guests would pay the same price again',
    ],
  },
  cleanliness: {
    noun: 'cleanliness',
    strength: 'cleanliness and housekeeping',
    consequences: [
      'a category where even small gaps change how a stay feels',
      'usually a proxy for housekeeping standards across the whole property',
      'and few complaints sour a review faster',
    ],
  },
  service: {
    noun: 'service',
    strength: 'the service',
    consequences: [
      'and staff warmth tends to color every other memory of a stay',
      'often the difference guests mention first when recommending a resort',
      'a gap that shows up at check-in and never really goes away',
    ],
  },
  sleepQuality: {
    noun: 'sleep quality',
    strength: 'sleep quality',
    consequences: [
      'usually a proxy for noise levels and bed comfort',
      'worth attention from light sleepers weighing entertainment-heavy resorts',
      'the quietest category on paper and the loudest one at 2am',
    ],
  },
}

function topRatings(r, n) {
  return Object.entries(r.ratings)
    .filter(([k, v]) => v != null && k !== 'overall' && CATEGORY[k])
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([k, v]) => ({ k, v }))
}

function weakestRating(r, excludeKey) {
  const sorted = Object.entries(r.ratings)
    .filter(([k, v]) => v != null && k !== 'overall' && k !== excludeKey && CATEGORY[k])
    .sort(([, a], [, b]) => a - b)
  return sorted.length ? { k: sorted[0][0], v: sorted[0][1] } : null
}

function ratingGaps(a, b, threshold) {
  const gaps = []
  for (const k of Object.keys(CATEGORY)) {
    const av = a.ratings[k], bv = b.ratings[k]
    if (av == null || bv == null) continue
    const diff = av - bv
    if (Math.abs(diff) >= threshold) gaps.push({ k, diff, av, bv })
  }
  return gaps.sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff))
}

const PRICE_WORDS = { '$': 'budget', '$$': 'mid-range', '$$$': 'upscale', '$$$$': 'luxury' }

// ---- seasons -----------------------------------------------------------------
const SEASONS = {
  'Mexico': 'December through April is the dry season. Hurricane season runs June–November; Riviera Maya and Cancun see the most risk August–October.',
  'Jamaica': 'December through April brings the driest weather. Hurricane season peaks August–October.',
  'Dominican Republic': 'December through April is prime. The north coast (Puerto Plata) gets more rain year-round than Punta Cana.',
  'Cuba': 'November through April is the dry season. Summer is hot and humid with occasional tropical storms.',
  'Bahamas': 'December through May is the sweet spot. Hurricane season runs June–November, peaking August–October.',
  'Barbados': 'December through May is best. Barbados sits south of the main hurricane belt and sees less storm risk than most Caribbean islands.',
  'Saint Lucia': 'January through April is driest. The island stays lush year-round thanks to reliable rainfall.',
  'Turks and Caicos': 'December through April is peak season, though water visibility is excellent year-round for diving.',
  'Antigua': 'January through April is ideal. The island averages only about 45 inches of rain per year — one of the driest in the Caribbean.',
  'Aruba': 'Any month works. Aruba sits outside the hurricane belt and receives less than 20 inches of rain annually.',
  'Curaçao': 'Any month works. Like Aruba, Curaçao sits outside the hurricane belt with consistent trade winds.',
  'Curacao': 'Any month works. Like Aruba, Curacao sits outside the hurricane belt with consistent trade winds.',
  'Panama': 'The Pacific coast (Farallon) is driest December through April; Bocas del Toro on the Caribbean side is drier September–October.',
  'Costa Rica': 'December through April is the Pacific-coast dry season (Guanacaste). The Caribbean coast has no true dry season.',
  'Honduras': 'March through May is best for Bay Islands diving; December through February is also dry and popular.',
  'Belize': 'February through May is driest, and dive visibility peaks in April.',
  'Haiti': 'December through March is best; the southern coast is drier than the north.',
  'Grenada': 'January through May is driest. Grenada sits at the southern edge of the hurricane belt.',
  'St. Kitts and Nevis': 'January through April is the dry season.',
  'Martinique': 'December through May is the dry season.',
  'Guadeloupe': 'December through May is the dry season.',
  'Puerto Rico': 'December through April is best; hurricane season runs June–November.',
  'US Virgin Islands': 'December through April is peak season.',
  'Cayman Islands': 'December through April is the dry season.',
  'Grand Cayman': 'December through April is the dry season.',
  'Bonaire': "Any month works. Bonaire sits outside the hurricane belt and is among the world's best shore-diving destinations.",
  'Trinidad and Tobago': 'January through May is driest. Tobago sees fewer visitors than most Caribbean islands, so beaches stay uncrowded.',
  'St. Vincent and the Grenadines': 'December through May is the dry season.',
  'Saint Vincent': 'December through May is the dry season.',
  'Saint Martin': 'December through April is peak season; hurricane season peaks August–October.',
  'Anguilla': 'December through April is peak season.',
  'St. Maarten': 'December through April is peak season.',
  'British Virgin Islands': 'December through April is peak season; hurricane season runs June–November.',
  'Saint Croix': 'December through April is peak season.',
  'Saint Thomas': 'December through April is peak season.',
  'Dominica': 'February through April are the driest months on this famously green island.',
  'Bermuda': 'May through October — unlike the tropical Caribbean, Bermuda is a summer destination.',
  'Colombia': 'December through March and July through August are the driest windows on the Caribbean coast.',
  'Ecuador': 'June through September is the most settled window.',
  'Peru': 'May through October is the dry season in most regions.',
  'Brazil': 'April through October suits the northeast (Bahia, Fortaleza); Rio and the south are best December through March.',
  'Guatemala': 'November through April is the dry season.',
  'Nicaraugua': 'November through April is the Pacific dry season.',
  'El Salvador': 'November through April is the dry season.',
  'United States': 'The Florida and Gulf Coast peak runs November through April; summers are hot and humid with an Atlantic hurricane season June–November.',
  'Egypt': 'October through April is best; summers are intensely hot.',
  'Morocco': 'March through May and September through November are ideal.',
  'Tanzania': 'June through October is the dry season; the great migration peaks July–August.',
  'Kenya': 'July through October is the classic window.',
  'South Africa': 'November through March suits beach resorts on the Indian Ocean coast.',
  'Mauritius': 'May through December is best; cyclone season runs January–March.',
  'Maldives': 'November through April is the dry northeast monsoon.',
  'Thailand': 'November through April suits the west coast (Phuket); October through May suits the east (Koh Samui).',
  'Indonesia': 'May through September is the dry season on Bali and Lombok.',
  'Philippines': 'November through May is the dry season.',
  'Vietnam': 'February through April is the most reliable window.',
  'Malaysia': 'March through October on the east coast; the west coast works year-round.',
  'Fiji': 'May through October is the dry season.',
  'Greece': 'June through September is beach season.',
  'Spain': 'May through October is beach season.',
  'Italy': 'May through September is beach season.',
  'Turkey': 'May through October is beach season.',
  'Croatia': 'June through September is beach season.',
  'Portugal': 'June through September is beach season.',
  'France': 'June through September is beach season.',
  'United Arab Emirates': 'November through March is ideal; summers are extremely hot.',
  'Oman': 'October through April is the comfortable season.',
  'Jordan': 'March through May and September through November are ideal.',
}

function seasonStr(country) {
  return SEASONS[country] || 'Shoulder-season months usually balance weather and price best — check a local climate guide for the specific region before locking dates.'
}

function hasKnownSeason(country) {
  return Object.prototype.hasOwnProperty.call(SEASONS, country)
}

// ---- destination activities --------------------------------------------------
function destinationActivities(r) {
  const area = (r.area || '').toLowerCase()
  if (r.country === 'Mexico') {
    if (/cabo|baja/.test(area)) return 'deep-sea fishing, whale watching in winter, and boat trips to the Arch, the famous rock formation at the tip of the peninsula'
    if (/vallarta|nayarit|punta mita|sayulita/.test(area)) return 'whale watching, zip-lining in the jungle-covered hills, and strolling the seafront boardwalk in town'
    if (/cancun|riviera|playa|tulum|cozumel|mujeres|maroma|akumal|costa mujeres|puerto morelos/.test(area)) return 'swimming in cenotes (natural freshwater pools in the rock), snorkeling the reef, and visiting ancient Maya ruins like Tulum and Chichén Itzá'
    return 'water sports, fishing trips, and local day trips'
  }
  const MAP = {
    'Dominican Republic': 'boat trips to nearby Saona Island, zip-lining, and golf',
    'Jamaica': "climbing Dunn's River Falls, bamboo rafting down the Martha Brae river, and sunset cruises",
    'Cuba': 'vintage-car tours of the cities, day trips to old Havana, and snorkeling the reef',
    'Saint Lucia': 'seeing the Pitons (two dramatic volcanic peaks), the drive-in volcano and warm mud baths at Soufrière, and rainforest zip-lines',
    'Barbados': "swimming with sea turtles, exploring Harrison's Cave, and the Friday-night fish fry at Oistins",
    'Brazil': 'dune-buggy rides, coastal boat trips, and live samba music',
    'Antigua': 'beach-hopping (the island is said to have one for every day of the year), the historic English Harbour, and Sunday sunset parties at Shirley Heights',
    'Costa Rica': 'zip-lining, surf lessons, and spotting wildlife in nearby rainforest parks',
    'Aruba': 'catamaran snorkel trips out to a shipwreck, jeep tours of the rugged national park, and easy swimming at Palm and Eagle Beach',
    'Colombia': 'exploring the walled old town of Cartagena, boat trips to the Rosario Islands, and salsa dancing',
    'Turks and Caicos': 'water sports off Grace Bay, reef diving and snorkeling, and casual seafood shacks',
    'Bahamas': 'snorkeling the reefs, visiting the famous swimming pigs, and day trips to the capital, Nassau',
    'Curaçao': 'diving and snorkeling straight from the beach, the colorful Dutch-style capital of Willemstad, and boat trips to the uninhabited island of Klein Curaçao',
    'Curacao': 'diving and snorkeling straight from the beach, the colorful Dutch-style capital of Willemstad, and boat trips to the uninhabited island of Klein Curacao',
    'Belize': 'trips out to the barrier reef, floating through caves on inner tubes, and visiting Maya ruins',
    'Panama': 'island-hopping in the Bocas del Toro islands, plus rainforest walks and canal day trips',
    'Honduras': 'excellent, affordable diving and snorkeling on the reef off Roatán',
    'Grenada': 'spice-plantation tours, waterfall hikes, and snorkeling over an underwater sculpture park',
    'Bonaire': 'snorkeling and diving on the reef right off the beach',
    'Bermuda': 'pink-sand beaches, the underground Crystal Caves, and golf',
    'Dominica': 'waterfall hikes, natural hot springs, and whale watching',
    'Saint Martin': 'beach-hopping between the French and Dutch sides, and watching planes land low over Maho Beach',
    'British Virgin Islands': 'island-hopping by boat and climbing the Baths, a beach of giant granite boulders',
    'Saint Vincent': 'sailing the nearby Grenadine islands and exploring black-sand beaches',
    'Grand Cayman': 'meeting friendly rays at Stingray City, relaxing on Seven Mile Beach, and shipwreck diving',
    'Saint Croix': 'snorkeling the protected reef at Buck Island and exploring the old Danish town of Christiansted',
    'Saint Thomas': 'Magens Bay beach, duty-free shopping in the harbor town, and ferries to nearby St. John',
    'Guatemala': 'Pacific surfing, volcano hikes, and day trips to the colonial town of Antigua',
    'Nicaraugua': 'Pacific surfing and volcano hikes',
    'El Salvador': 'surfing the Pacific beaches and volcano hikes',
    'Ecuador': 'in-season whale watching and visiting coastal parks',
    'Peru': 'fresh seafood and ceviche, and visiting nearby ancient ruins',
    'Maldives': 'snorkeling the house reef, sandbank picnics, and dolphin cruises',
    'Fiji': 'reef diving, village visits, and island-hopping day sails',
  }
  return MAP[r.country] || 'boat trips, water sports, and local sightseeing arranged through the resort'
}

// ---- destination landscape / character ---------------------------------------
// A one-clause read on what a destination is physically LIKE — its landscape,
// terrain, and defining feature — so a comparison can describe where each
// resort sits, not just name the country. Reads as "{Place} is {value}".
// Mexico is split by coast because Los Cabos, the Pacific, and the Riviera Maya
// are nothing alike. No em dashes (site style).
const DESTINATION_CHARACTER = {
  'Dominican Republic': 'a large island with long sandy beaches, palm groves, and green mountains inland',
  'Jamaica': 'a green, mountainous island known for waterfalls, river rafting, and a lively music-and-food scene along its north coast',
  'Cuba': 'a nostalgic island of vintage American cars and old colonial towns, with long white-sand beaches like those at Varadero',
  'Saint Lucia': 'a lush, mountainous island whose landmark is the Pitons, two dramatic volcanic peaks rising straight out of the sea, with rainforest and natural hot springs nearby',
  'Brazil': 'a warm northeastern coastline of sand dunes, lagoons, and a relaxed beach-and-music culture',
  'Barbados': 'a coral island with calm, swimmable beaches on its west coast, bigger Atlantic surf on the east, and low hurricane risk',
  'Antigua': 'a rolling green island said to have a beach for every day of the year, plus sheltered historic harbours',
  'Costa Rica': 'a green, wildlife-rich coast where rainforest and volcanoes meet Pacific surf beaches',
  'Aruba': 'a dry, sunny island with a cactus-dotted desert interior and calm, clear water along Palm and Eagle Beach',
  'Colombia': 'best known for the walled colonial city of Cartagena and the white-sand Rosario Islands just offshore',
  'Turks and Caicos': 'a flat, dry group of islands famous for the pale, exceptionally clear water and long reef off Grace Bay',
  'Bahamas': 'a spread of low, sandy islands with soft beaches, shallow turquoise water, and easy island-hopping',
  'Curaçao': 'a dry, sunny Dutch-Caribbean island with a cactus-covered interior, sheltered coves good for diving straight from the beach, and a capital, Willemstad, lined with colorful Dutch-style buildings',
  'Curacao': 'a dry, sunny Dutch-Caribbean island with a cactus-covered interior, sheltered coves good for diving straight from the beach, and a capital, Willemstad, lined with colorful Dutch-style buildings',
  'Belize': 'a country of jungle and reef, with a huge barrier reef offshore and ancient Maya ruins and caves inland',
  'Panama': 'where rainforest, two oceans, and the famous shipping canal meet, with small island groups on both coasts',
  'Honduras': 'best known for the Bay Islands, a set of reef-ringed islands offering some of the Caribbean\'s best-value diving',
  'Grenada': 'a lush, hilly island nicknamed the Spice Isle for its nutmeg, with rainforest waterfalls to explore',
  'Saint Martin': 'a small island shared by France and the Netherlands, each side with its own beaches and cuisine',
  'British Virgin Islands': 'a cluster of green islands popular for sailing, with quiet coves and the Baths, a beach of giant granite boulders',
  'United States': 'a warm-weather stretch of U.S. coast with easy access and familiar comforts',
  'Saint Vincent': 'a green, volcanic island at the top of the Grenadines, a chain of small islands popular for sailing',
  'Guatemala': 'a country of volcanoes, black-sand Pacific surf beaches, and the colonial town of Antigua',
  'Ecuador': 'a Pacific coastline of long beaches and, in season, whale watching',
  'Peru': 'a desert Pacific coast known for its seafood, especially ceviche, and nearby ancient ruins',
  'Saint Croix': 'the largest and quietest of the U.S. Virgin Islands, with the historic Danish-built town of Christiansted and a protected reef at Buck Island',
  'Bermuda': 'a subtropical Atlantic island, north of the Caribbean, known for pink-sand beaches and pastel towns',
  'Martinique': 'a lush French island of rainforest, rum distilleries, and a volcano, Mount Pelée',
  'Grand Cayman': 'a flat, polished island built around Seven Mile Beach, with excellent diving',
  'Dominica': 'a rugged, unspoiled island nicknamed the Nature Island, full of rainforest, rivers, hot springs, and whales offshore',
  'Saint Thomas': 'a hilly U.S. Virgin Island known for Magens Bay beach and duty-free shopping in its harbour town',
  'Bonaire': 'a flat, dry island ringed by a protected reef you can snorkel or dive right from the shore',
  'Nicaraugua': 'a Pacific coast of surf beaches and volcanoes',
  'El Salvador': 'a small Pacific surf coast of dark-sand beaches and volcanoes',
}
function destinationCharacter(r) {
  const area = (r.area || '').toLowerCase()
  if (r.country === 'Mexico') {
    if (/cabo|baja/.test(area)) return 'a striking desert-meets-sea landscape of dry cliffs and cactus, where the Sea of Cortez meets the Pacific'
    if (/vallarta|nayarit|punta mita|sayulita/.test(area)) return 'a green bay ringed by jungle-covered hills, more traditionally Mexican in feel than the Caribbean coast'
    if (/cancun|riviera|playa|tulum|cozumel|mujeres|maroma|akumal|costa mujeres|puerto morelos/.test(area)) return 'flat jungle over soft limestone, with powder-white Caribbean beaches, freshwater cave pools called cenotes, and a reef just offshore'
    return 'a warm Mexican coast built around the beach and water sports'
  }
  return DESTINATION_CHARACTER[r.country] || 'a warm, beach-focused stretch of coast'
}

// The single most iconic, self-explanatory thing to do at a destination, as a
// short phrase for use inside a verdict clause. One item keeps the verdict
// short; the fuller list lives in destinationActivities and the setting line.
function destinationDrawShort(r) {
  const full = destinationActivities(r)
  const first = full.split(/,\s+(?:and\s+)?/)[0]
  return (first || '').trim()
}

// ---- amenity handling --------------------------------------------------------
const ACTIVITY_AMENITIES = {
  'Scuba Diving': 'scuba diving', 'Diving': 'scuba diving',
  'Snorkeling': 'snorkeling', 'Snorkelling': 'snorkeling',
  'Golf': 'golf', 'Casino': 'a casino', 'Water Park': 'a water park',
  'Kids Club': 'a kids club', 'Swim-up Bar': 'swim-up bars',
  'Nightclub': 'a nightclub', 'Tennis': 'tennis courts',
  'Yoga Classes': 'yoga classes', 'Spa': 'a spa', 'Kayaking': 'kayaking',
  'Windsurfing': 'windsurfing', 'Horseback Riding': 'horseback riding',
  'Watersports Equipment Rentals': 'watersports rentals',
  'Hiking': 'hiking trails', 'Fishing': 'fishing trips',
  'Gym': 'a gym', 'Fitness Center': 'a gym', 'Heated Pool': 'a heated pool',
  'Water Sports': 'watersports', 'Bicycle Rental': 'bike rentals',
  'Evening Entertainment': 'nightly entertainment', 'Buffet': 'buffet dining',
}

function activityAmenities(r, n) {
  if (!r.amenities || !r.amenities.length) return []
  const out = []
  for (const a of r.amenities) {
    const phrase = ACTIVITY_AMENITIES[a]
    if (phrase && !out.includes(phrase)) out.push(phrase)
    if (out.length >= n) break
  }
  return out
}

module.exports = {
  hashStr, rngFor, pick, fmt, cap, listJoin, locationOf, shortLoc,
  countryName, countryPossessive,
  CATEGORY, topRatings, weakestRating, ratingGaps, PRICE_WORDS,
  SEASONS, seasonStr, hasKnownSeason, destinationActivities,
  destinationCharacter, destinationDrawShort,
  ACTIVITY_AMENITIES, activityAmenities,
}
