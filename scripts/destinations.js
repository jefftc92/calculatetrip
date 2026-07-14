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

function locationOf(r) {
  if (r.area && r.area !== r.country) return `${r.area}, ${r.country}`
  return r.country || r.area || 'the region'
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
    if (/cabo|baja/.test(area)) return 'marlin fishing, whale watching in winter, and boat trips to the Arch at Land’s End'
    if (/vallarta|nayarit|punta mita|sayulita/.test(area)) return 'whale watching, ziplining in the Sierra Madre foothills, and the Malecón in town'
    if (/cancun|riviera|playa|tulum|cozumel|mujeres|maroma|akumal|costa mujeres|puerto morelos/.test(area)) return 'cenote swims, reef snorkeling, and Mayan ruins from Tulum to Chichén Itzá'
    return 'watersports, sportfishing, and regional day trips'
  }
  const MAP = {
    'Dominican Republic': 'catamaran trips to Saona Island, ziplining, and championship golf around Punta Cana',
    'Jamaica': "Dunn's River Falls, Martha Brae river rafting, and catamaran sunset cruises",
    'Cuba': 'classic-car city tours, day trips to Havana or Trinidad, and reef snorkeling',
    'Saint Lucia': 'the Pitons, Soufrière’s drive-in volcano and mud baths, and rainforest ziplines',
    'Barbados': "swimming with sea turtles, Harrison's Cave, and the Friday-night Oistins fish fry",
    'Brazil': 'beach-buggy dune rides, boat trips along the coast, and samba and capoeira culture',
    'Antigua': 'a different beach for every day of the year, English Harbour’s naval history, and Shirley Heights sunset parties',
    'Costa Rica': 'ziplining, surf lessons, and wildlife spotting in nearby national parks',
    'Aruba': 'catamaran snorkel cruises to the Antilla shipwreck, jeep tours through Arikok National Park, and reliably calm water at Palm and Eagle Beach',
    'Colombia': 'Cartagena’s walled Old Town, Rosario Islands boat trips, and salsa nightlife',
    'Turks and Caicos': 'Grace Bay watersports, barrier-reef diving and snorkeling, and conch-shack dining',
    'Bahamas': 'reef snorkeling, swimming-pigs excursions, and Nassau day trips',
    'Curaçao': 'shore diving, UNESCO-listed Willemstad, and boat trips to Klein Curaçao',
    'Curacao': 'shore diving, UNESCO-listed Willemstad, and boat trips to Klein Curacao',
    'Belize': 'trips out to the Belize Barrier Reef, cave tubing, and Mayan ruins',
    'Panama': 'island-hopping in Bocas del Toro or the Pearl Islands, plus rainforest and canal day trips',
    'Honduras': 'world-class diving on the Mesoamerican Reef off Roatán',
    'Grenada': 'spice-plantation tours, waterfall hikes, and the Underwater Sculpture Park',
    'Bonaire': 'some of the world’s best shore diving, right off the beach',
    'Bermuda': 'pink-sand beaches, the Crystal Caves, and golf',
    'Dominica': 'waterfall hikes, hot springs, and whale watching',
    'Saint Martin': 'beach-hopping across the French and Dutch sides and plane watching at Maho Beach',
    'British Virgin Islands': 'island-hopping by boat and the granite Baths on Virgin Gorda',
    'Saint Vincent': 'sailing the Grenadines and black-sand-beach exploring',
    'Grand Cayman': 'Stingray City, Seven Mile Beach, and wreck diving',
    'Saint Croix': 'snorkeling at Buck Island reef and exploring Danish-colonial Christiansted',
    'Saint Thomas': 'Magens Bay, duty-free shopping in Charlotte Amalie, and ferries to St. John',
    'Guatemala': 'Pacific surf, volcano hikes, and colonial Antigua Guatemala day trips',
    'Nicaraugua': 'Pacific surf breaks and volcano hikes',
    'El Salvador': 'the surf breaks around El Tunco and volcano hikes',
    'Ecuador': 'whale watching in season and coastal national parks',
    'Peru': 'coastal ceviche culture and pre-Columbian sites',
    'Maldives': 'house-reef snorkeling, sandbank picnics, and dolphin cruises',
    'Fiji': 'reef diving, village visits, and island-hopping day sails',
  }
  return MAP[r.country] || 'boat excursions, watersports, and local sightseeing arranged through the resort'
}

// ---- area character ------------------------------------------------------------
// Editorial one-liners describing what each resort area is actually like.
// Used by the detailed same-country comparison writer. First match wins.
const AREA_CHARACTER = {
  'Dominican Republic': [
    [/cap cana/i, 'Cap Cana, the gated upscale enclave south of Punta Cana with Juanillo Beach and Punta Espada golf'],
    [/uvero alto/i, 'Uvero Alto, the quieter far-north end of the Punta Cana coast with a wilder, palm-backed beach'],
    [/miches/i, 'Miches, the low-density emerging coast on Samaná Bay'],
    [/punta cana|bavaro|cortecito|cabeza de toro/i, 'the Punta Cana–Bávaro corridor, the DR’s main resort strip with long white beaches and quick transfers from PUJ airport'],
    [/la romana|bayahibe|dominicus/i, 'the La Romana–Bayahibe coast, known for calmer seas, diving, and Saona Island boat trips'],
    [/puerto plata|sosua|cabarete/i, 'the greener Puerto Plata north coast — better value, trade-wind beaches, and its own POP airport'],
    [/boca chica|juan dolio|guayacanes|el soco/i, 'the Boca Chica–Juan Dolio strip, closest to Santo Domingo'],
    [/terrenas|galeras|levantado|balandra|saman/i, 'the lush Samaná Peninsula, whale-watching territory each winter'],
  ],
  'Jamaica': [
    [/montego bay|rose hall|ironshore/i, 'Montego Bay, minutes from MBJ airport with reef-sheltered beaches and the busiest resort scene on the island'],
    [/negril|west end|green island/i, 'Negril, the barefoot west end famous for Seven Mile Beach and cliff-top sunsets'],
    [/ocho?s? rios/i, 'Ocho Rios, the garden-parish coast near Dunn’s River Falls'],
    [/runaway bay|duncans|falmouth|trelawny/i, 'the quieter Runaway Bay–Falmouth stretch of the north coast'],
    [/lucea|hopewell/i, 'the Lucea coast midway between Montego Bay and Negril'],
    [/bluefields|white house/i, 'Jamaica’s undeveloped south coast, far from the cruise-port crowds'],
  ],
  'Cuba': [
    [/varadero/i, 'Varadero, Cuba’s flagship 20-kilometer beach peninsula about two hours from Havana'],
    [/cayo coco|cayo guillermo|cayo cruz/i, 'the Jardines del Rey cays — reef-fringed islands reached by causeway, remote from any city'],
    [/cayo santa maria|las brujas|ensenachos/i, 'the Cayo Santa María cays at the end of a 48-kilometer causeway off the north-central coast'],
    [/holguin|guardalavaca|rafael freyre/i, 'the green, hilly Holguín coast in eastern Cuba'],
    [/cayo largo/i, 'Cayo Largo, a remote southern islet prized for its beaches'],
    [/jibacoa/i, 'Jibacoa, a small beach pocket between Havana and Varadero with snorkeling off the sand'],
    [/trinidad/i, 'the south coast near colonial Trinidad, a UNESCO World Heritage town'],
  ],
  'Saint Lucia': [
    [/cap estate|rodney bay|gros islet|castries|corinth/i, 'the developed northwest around Rodney Bay and Cap Estate — calm water, restaurants, and nightlife within reach'],
    [/soufri|jalousle|anse cochon/i, 'the Soufrière coast beneath the Pitons — dramatic, lush, and far more secluded'],
    [/vieux fort/i, 'Vieux Fort at the island’s southern tip, closest to UVF airport'],
  ],
  'Barbados': [
    [/saint james|saint peter|holetown/i, 'the calm, prestigious Platinum west coast'],
    [/lawrence gap|oistins/i, 'the livelier south coast near St. Lawrence Gap'],
    [/bridgetown/i, 'the coast just outside Bridgetown'],
  ],
  'Costa Rica': [
    [/papagayo|playa panama|culebra/i, 'the Gulf of Papagayo, the driest and most resort-developed corner of Guanacaste'],
    [/brasilito|flamingo|langosta|samara|sardinal|tamarindo/i, 'Guanacaste’s Pacific beach-town coast'],
    [/drake bay/i, 'remote Drake Bay on the Osa Peninsula, gateway to Corcovado’s rainforest'],
    [/tortuguero/i, 'Tortuguero’s canal-laced Caribbean jungle, reachable only by boat or plane'],
    [/tambor/i, 'the Nicoya Peninsula’s sheltered Tambor Bay'],
  ],
  'Aruba': [
    [/palm|eagle/i, 'the Palm–Eagle Beach strip — high-rise energy on Palm, low-rise calm on Eagle'],
    [/oranjestad/i, 'the coast by Oranjestad, Aruba’s capital'],
    [/san nicolas/i, 'San Nicolas at the quiet southeastern end, near Baby Beach'],
  ],
  'Colombia': [
    [/san andres/i, 'San Andrés, the Caribbean island famed for its “sea of seven colors”'],
    [/cartagena|baru/i, 'the Cartagena coast, pairing beach time with the walled Old Town'],
    [/santa marta/i, 'Santa Marta, where the Sierra Nevada meets the Caribbean'],
    [/quimbaya/i, 'Quimbaya in the inland coffee region — a plantation stay, not a beach one'],
  ],
  'Turks and Caicos': [
    [/grace bay|providenciales|leeward|wheeland/i, 'Providenciales, home of Grace Bay’s ranked-among-the-world’s-best beach'],
    [/pine cay|ambergris|south caicos/i, 'the outer cays — private-island seclusion a boat or short flight from Provo'],
  ],
  'Bahamas': [
    [/nassau|paradise island/i, 'Nassau/Paradise Island, the busy hub with casinos, restaurants, and direct flights'],
    [/freeport/i, 'Freeport on Grand Bahama'],
    [/andros/i, 'Andros, the Bahamas’ wild bonefishing-and-blue-holes island'],
    [/san salvador/i, 'remote San Salvador on the Atlantic edge of the archipelago'],
    [/exuma/i, 'Great Exuma, launch point for the swimming pigs and sandbar-studded Exuma Cays'],
  ],
  'Curaçao': [
    [/willemstad/i, 'the coast around UNESCO-listed Willemstad'],
    [/nieuwpoort/i, 'the island’s undeveloped southeastern shore'],
    [/tera kora/i, 'the quieter Tera Kora stretch on the west side'],
  ],
  'Belize': [
    [/san pedro/i, 'San Pedro on Ambergris Caye, steps from the Belize Barrier Reef'],
    [/coco plum|glovers/i, 'a private cay of its own off the southern coast'],
    [/hopkins|placencia/i, 'the laid-back Hopkins–Placencia south coast'],
  ],
  'Antigua': [
    [/long island/i, 'private Jumby Bay island, reached by launch from the main island'],
    [/mamora bay/i, 'sheltered Mamora Bay on the southeast coast'],
    [/five islands|jolly harbour|bolans/i, 'the calm west coast near Jolly Harbour'],
    [/saint mary/i, 'the southwest coast in Saint Mary’s Parish'],
    [/willikies|freetown|phillips/i, 'the breezier Atlantic east coast'],
    [/john/i, 'the coast near St. John’s, the capital'],
    [/cedar grove/i, 'the northwest corner near Dickenson Bay'],
  ],
  'Brazil': [
    [/porto de galinhas/i, 'Porto de Galinhas, Pernambuco’s tide-pool beach town'],
    [/praia do forte|imbassai|sauipe|guarajuba/i, 'Bahia’s Coconut Coast north of Salvador'],
    [/trancoso|porto seguro/i, 'Bahia’s Discovery Coast around Trancoso and Porto Seguro'],
    [/maragogi|japaratinga/i, 'the Alagoas reef coast, Brazil’s “Caribbean”'],
    [/maceio/i, 'the Maceió coast in Alagoas'],
    [/natal|touros/i, 'Rio Grande do Norte’s dune-backed coast near Natal'],
    [/florianopolis/i, 'the island beaches of Florianópolis in the south'],
    [/mangaratiba/i, 'the Costa Verde between Rio and Paraty'],
    [/caucaia/i, 'the coast just west of Fortaleza'],
  ],
}

// Normalized comparison so 'St. Lucia' == 'Saint Lucia' and 'Aruba' == 'Aruba'.
function sameName(x, y) {
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\bsaint\b/g, 'st').replace(/[^a-z0-9]/g, '')
  return norm(x) === norm(y)
}

// The resort's area when it names a real sub-region (not just the country again).
function realArea(r) {
  return r.area && !sameName(r.area, r.country) ? r.area : null
}

function areaCharacter(r) {
  const list = AREA_CHARACTER[r.country]
  if (!list || !r.area) return null
  for (const [re, note] of list) if (re.test(r.area)) return note
  return null
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

// Plain-English quality word for a 0-10 guest score.
function scoreWord(v) {
  if (v >= 9.3) return 'outstanding'
  if (v >= 9.0) return 'superb'
  if (v >= 8.5) return 'excellent'
  if (v >= 8.0) return 'strong'
  if (v >= 7.0) return 'respectable'
  if (v >= 6.0) return 'middling'
  return 'weak'
}

module.exports = {
  hashStr, rngFor, pick, fmt, cap, listJoin, locationOf, shortLoc,
  CATEGORY, topRatings, weakestRating, ratingGaps, PRICE_WORDS, scoreWord,
  SEASONS, seasonStr, hasKnownSeason, destinationActivities,
  ACTIVITY_AMENITIES, activityAmenities,
  AREA_CHARACTER, areaCharacter, realArea, sameName,
}
