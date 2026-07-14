// Editorial writer for resort-pair overviews — pure function of the two
// resort records, no API calls. build.js uses it as the lowest-priority
// fallback for any comparison page that has no stored (hand-authored or
// LLM-generated) overview.
//
// Every sentence slot has several phrasings and the choice is made with a
// PRNG seeded from the pair key, so pages read differently from each other
// but any given pair renders identically on every build.

// ---- deterministic per-pair randomness --------------------------------------
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
    consequences: [
      "a gap you'd feel at every meal",
      'and restaurant quality is the one thing an all-inclusive guest cannot escape',
      'which matters three times a day on an all-inclusive plan',
    ],
  },
  beach: {
    noun: 'the beach',
    consequences: [
      'decisive if beach time is the whole point of the trip',
      "worth real weight if you picture the trip from a lounger",
      'a difference measured in sand and swimmability, not decor',
    ],
  },
  pool: {
    noun: 'the pool scene',
    consequences: [
      'worth noting if you expect to spend most days poolside',
      'the kind of gap that shapes a sea-day-free vacation',
      'relevant on any day the wind picks up and the beach empties',
    ],
  },
  atmosphere: {
    noun: 'atmosphere',
    consequences: [
      'a sign the two properties feel very different to walk around',
      'the hardest category to fix with money, which makes the gap telling',
      'usually reflecting grounds, energy, and how the space flows',
    ],
  },
  location: {
    noun: 'location',
    consequences: [
      'a fixed advantage no renovation can copy',
      'the one score a resort can never improve',
      'which speaks to the setting itself rather than the property',
    ],
  },
  room: {
    noun: 'rooms',
    consequences: [
      'and you spend more hours in the room than most people budget for',
      'worth checking against recent photos before booking',
      'often the difference between a dated build and a recent refresh',
    ],
  },
  value: {
    noun: 'value for money',
    consequences: [
      'meaning guests felt the bill matched the experience at one and not quite at the other',
      'a useful tiebreaker when the headline rates look similar',
      'the score that says whether guests would pay the same price again',
    ],
  },
  cleanliness: {
    noun: 'cleanliness',
    consequences: [
      'a category where even small gaps change how a stay feels',
      'usually a proxy for housekeeping standards across the whole property',
      'and few complaints sour a review faster',
    ],
  },
  service: {
    noun: 'service',
    consequences: [
      'and staff warmth tends to color every other memory of a stay',
      'often the difference guests mention first when recommending a resort',
      'a gap that shows up at check-in and never really goes away',
    ],
  },
  sleepQuality: {
    noun: 'sleep quality',
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

// ---- destination knowledge ---------------------------------------------------
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

// ---- section writers -----------------------------------------------------------
function writeKeyDifferences(a, b, rng) {
  const parts = []
  const sameCountry = a.country && a.country === b.country
  const aRealArea = a.area && a.area !== a.country ? a.area : null
  const bRealArea = b.area && b.area !== b.country ? b.area : null

  // 1. Geography frame
  if (sameCountry && aRealArea && bRealArea && aRealArea !== bRealArea) {
    parts.push(pick(rng, [
      `${a.name} and ${b.name} are both in ${a.country}, but in different corners of it — ${aRealArea} versus ${bRealArea} — so the setting is part of the choice, not just the resort.`,
      `The first fork in the road is geography: ${a.name} sits in ${aRealArea} while ${b.name} is over in ${bRealArea}, two distinctly different corners of ${a.country}.`,
      `Both fly the ${a.country} flag, but ${a.name} (${aRealArea}) and ${b.name} (${bRealArea}) occupy different parts of the country, with different transfer times and coastal character.`,
    ]))
  } else if (sameCountry) {
    const place = aRealArea && aRealArea === bRealArea ? `${aRealArea}, ${a.country}` : a.country
    parts.push(pick(rng, [
      `${a.name} and ${b.name} compete on the same turf — both are ${place} all-inclusives — so the destination is a wash and the decision comes down to the properties themselves.`,
      `With both resorts in ${place}, you aren't choosing a destination here; you're choosing between two takes on the same coastline.`,
      `${a.name} and ${b.name} share ${place} as a home base, which makes this a like-for-like matchup where the scores can do most of the talking.`,
    ]))
  } else {
    parts.push(pick(rng, [
      `${a.name} (${locationOf(a)}) and ${b.name} (${locationOf(b)}) put two different countries on the table, so flights, transfer logistics, and destination character weigh as heavily as the resorts.`,
      `This comparison crosses borders — ${locationOf(a)} versus ${locationOf(b)} — making it a destination decision as much as a resort decision.`,
      `${a.name} sits in ${locationOf(a)}; ${b.name} is a different trip entirely, in ${locationOf(b)}. Weigh the destinations first, then let the scores refine the call.`,
    ]))
  }

  // 2. Overall verdict
  const ao = a.ratings.overall, bo = b.ratings.overall
  if (ao != null && bo != null) {
    const d = Math.abs(ao - bo)
    const w = ao >= bo ? a : b, l = ao >= bo ? b : a
    if (d < 0.2) {
      parts.push(pick(rng, [
        `On overall guest score they're effectively tied, ${fmt(ao)} to ${fmt(bo)}, so the separation lives in the category ratings.`,
        `The headline numbers won't settle it — ${fmt(ao)} versus ${fmt(bo)} overall is a statistical tie.`,
      ]))
    } else if (d < 0.6) {
      parts.push(pick(rng, [
        `${w.name} holds a slim overall edge, ${fmt(w.ratings.overall)} to ${fmt(l.ratings.overall)}.`,
        `Overall, guests give ${w.name} a modest lead: ${fmt(w.ratings.overall)} against ${fmt(l.ratings.overall)}.`,
      ]))
    } else {
      parts.push(pick(rng, [
        `${w.name} is clearly ahead overall, ${fmt(w.ratings.overall)} to ${fmt(l.ratings.overall)} — a gap guests genuinely feel.`,
        `The overall scores aren't close: ${fmt(w.ratings.overall)} for ${w.name} versus ${fmt(l.ratings.overall)} for ${l.name}.`,
      ]))
    }
  }

  // 3. Category gaps
  const gaps = ratingGaps(a, b, 0.5)
  if (gaps.length === 0) {
    parts.push(pick(rng, [
      `Category by category the two track each other closely — nothing separates them by even half a point — so let price, setting, and style break the tie.`,
      `Neither resort opens a meaningful lead in any single category; the rating cards are near mirror images, which pushes the decision toward location and price.`,
    ]))
  } else {
    const g = gaps[0]
    const w = g.diff > 0 ? a : b, l = g.diff > 0 ? b : a
    const wv = g.diff > 0 ? g.av : g.bv, lv = g.diff > 0 ? g.bv : g.av
    const cat = CATEGORY[g.k]
    parts.push(pick(rng, [
      `The widest split is ${cat.noun}: ${w.name} scores ${fmt(wv)} to ${l.name}'s ${fmt(lv)} — ${pick(rng, cat.consequences)}.`,
      `${cap(cat.noun)} is where they diverge most, ${fmt(wv)} for ${w.name} against ${fmt(lv)} for ${l.name} — ${pick(rng, cat.consequences)}.`,
      `Start with ${cat.noun}, the biggest gap on the card: ${w.name} at ${fmt(wv)}, ${l.name} at ${fmt(lv)} — ${pick(rng, cat.consequences)}.`,
    ]))
    if (gaps.length > 1) {
      const g2 = gaps[1]
      const w2 = g2.diff > 0 ? a : b
      const wv2 = g2.diff > 0 ? g2.av : g2.bv, lv2 = g2.diff > 0 ? g2.bv : g2.av
      const noun2 = CATEGORY[g2.k].noun
      if (w2 === w) {
        parts.push(pick(rng, [
          `Its advantage repeats on ${noun2}, ${fmt(wv2)} to ${fmt(lv2)}.`,
          `The same resort also leads on ${noun2} (${fmt(wv2)} vs ${fmt(lv2)}), so the gaps point one direction.`,
        ]))
      } else {
        parts.push(pick(rng, [
          `${w2.name} pushes back on ${noun2}, though, ${fmt(wv2)} to ${fmt(lv2)}, so the scorecard cuts both ways.`,
          `It isn't one-sided: ${w2.name} answers on ${noun2}, ${fmt(wv2)} against ${fmt(lv2)}.`,
        ]))
      }
    }
  }

  // 4. Profiles. If the headline gap category is also a resort's weakest,
  // surface the next-weakest instead so one category doesn't dominate the text.
  const mainGapKey = gaps.length ? gaps[0].k : null
  const aTop = topRatings(a, 2), bTop = topRatings(b, 2)
  const aWeak = weakestRating(a, mainGapKey), bWeak = weakestRating(b, mainGapKey)
  if (aTop.length >= 2 && aWeak) {
    parts.push(pick(rng, [
      `${a.name} is at its best on ${CATEGORY[aTop[0].k].noun} (${fmt(aTop[0].v)}) and ${CATEGORY[aTop[1].k].noun}, with ${CATEGORY[aWeak.k].noun} its softest score at ${fmt(aWeak.v)}.`,
      `${a.name}'s card peaks at ${CATEGORY[aTop[0].k].noun} (${fmt(aTop[0].v)}) and ${CATEGORY[aTop[1].k].noun}; ${CATEGORY[aWeak.k].noun}, at ${fmt(aWeak.v)}, trails the rest.`,
    ]))
  }
  if (bTop.length >= 2 && bWeak) {
    parts.push(pick(rng, [
      `${b.name} earns its highest marks for ${CATEGORY[bTop[0].k].noun} (${fmt(bTop[0].v)}) and ${CATEGORY[bTop[1].k].noun}, while ${CATEGORY[bWeak.k].noun} (${fmt(bWeak.v)}) is the weak spot.`,
      `For ${b.name}, ${CATEGORY[bTop[0].k].noun} (${fmt(bTop[0].v)}) and ${CATEGORY[bTop[1].k].noun} lead the card, and ${CATEGORY[bWeak.k].noun} (${fmt(bWeak.v)}) brings up the rear.`,
    ]))
  }

  // 5. Practicalities: price and audience
  const ap = PRICE_WORDS[a.priceLevel], bp = PRICE_WORDS[b.priceLevel]
  if (ap && bp) {
    if (ap === bp) {
      parts.push(pick(rng, [
        `Both book at a ${ap} price point.`,
        `Pricing won't separate them — both are ${ap} properties.`,
      ]))
    } else {
      parts.push(pick(rng, [
        `Budgets differ: ${a.name} books as a ${ap} stay while ${b.name} runs ${bp}.`,
        `Expect different bills, too — ${a.name} is ${ap}, ${b.name} is ${bp}.`,
      ]))
    }
  }
  if (a.type !== b.type) {
    const adults = a.type === 'adults-only' ? a : b
    const fam = a.type === 'adults-only' ? b : a
    parts.push(pick(rng, [
      `And note the crowd: ${adults.name} is adults-only while ${fam.name} welcomes kids — for many travelers that alone settles it.`,
      `One structural difference outranks every score: ${adults.name} is adults-only, ${fam.name} is family-friendly.`,
    ]))
  }

  return parts.join(' ')
}

// `avoid` carries the template indices used for the other resort's blurb so the
// two "who should choose" blocks on one page never share the same skeleton.
function writeWhoShouldChoose(r, other, rng, avoid = {}) {
  const top = topRatings(r, 2)
  const weak = weakestRating(r)
  const price = PRICE_WORDS[r.priceLevel]
  const loc = locationOf(r)
  const audience = r.type === 'adults-only'
    ? pick(rng, ['couples and adults traveling without kids', 'travelers after a child-free stay'])
    : pick(rng, ['families', 'multi-generational groups and families'])
  const parts = []
  const used = { openerIdx: null, settingIdx: null, caveatIdx: null }

  if (top.length >= 2) {
    const n1 = CATEGORY[top[0].k].noun, n2 = CATEGORY[top[1].k].noun
    const openers = [
      `${r.name} is the pick for ${audience} who put ${n1} and ${n2} at the top of the list — guests score it ${fmt(top[0].v)} and ${fmt(top[1].v)} there.`,
      `Choose ${r.name} if ${n1} is what you're really buying: at ${fmt(top[0].v)} it's the resort's calling card, with ${n2} (${fmt(top[1].v)}) close behind. It suits ${audience}.`,
      `Book ${r.name} when ${n1} (${fmt(top[0].v)}) and ${n2} (${fmt(top[1].v)}) matter more than anything else on the card — a natural fit for ${audience}.`,
    ]
    let oi = Math.floor(rng() * openers.length)
    if (oi === avoid.openerIdx) oi = (oi + 1) % openers.length
    used.openerIdx = oi
    parts.push(openers[oi])
  } else {
    parts.push(`${r.name} suits ${audience} looking for a straightforward stay in ${loc}.`)
  }

  if (price) {
    const settings = [
      `It's a ${price} property in ${loc}.`,
      `Expect ${price} pricing for its ${loc} address.`,
    ]
    let si = Math.floor(rng() * settings.length)
    if (si === avoid.settingIdx) si = (si + 1) % settings.length
    used.settingIdx = si
    parts.push(settings[si])
  } else {
    parts.push(`It sits in ${loc}.`)
  }

  if (weak && weak.v < 7.5) {
    const caveats = [
      `Just go in with measured expectations for ${CATEGORY[weak.k].noun} — at ${fmt(weak.v)}, it's the soft spot.`,
      `The trade-off is ${CATEGORY[weak.k].noun} (${fmt(weak.v)}), the one category where guests consistently mark it down.`,
      `Its rating card does dip on ${CATEGORY[weak.k].noun} (${fmt(weak.v)}), so weight that accordingly.`,
    ]
    let ci = Math.floor(rng() * caveats.length)
    if (ci === avoid.caveatIdx) ci = (ci + 1) % caveats.length
    used.caveatIdx = ci
    parts.push(caveats[ci])
  } else if (r.ratings.overall != null && other.ratings.overall != null && r.ratings.overall >= other.ratings.overall) {
    parts.push(pick(rng, [
      `It also carries the stronger overall score of the pair (${fmt(r.ratings.overall)}).`,
      `At ${fmt(r.ratings.overall)} overall, it's the higher-rated of the two.`,
    ]))
  }

  return { text: parts.join(' '), used }
}

function writeWhenToVisit(a, b, rng) {
  if (a.country && a.country === b.country) {
    return pick(rng, [
      `Both resorts run on ${a.country}'s weather calendar, so timing is one decision, not two. ${seasonStr(a.country)}`,
      `Seasonality is identical here — one ${a.country} climate covers both properties. ${seasonStr(a.country)}`,
      `Whichever resort wins, the calendar advice is the same. ${seasonStr(a.country)}`,
    ])
  }
  return pick(rng, [
    `The two destinations run on different calendars. For ${a.name} in ${a.country || 'its region'}: ${seasonStr(a.country)} For ${b.name} in ${b.country || 'its region'}: ${seasonStr(b.country)}`,
    `Timing depends on which destination you pick. ${a.country || a.name}: ${seasonStr(a.country)} ${b.country || b.name}: ${seasonStr(b.country)}`,
  ])
}

function writeActivities(a, b, rng) {
  const aActs = activityAmenities(a, 3)
  const bActs = activityAmenities(b, 3)
  const parts = []

  if (aActs.length && bActs.length) {
    parts.push(pick(rng, [
      `On site, ${a.name} covers ${listJoin(aActs)}, while ${b.name} answers with ${listJoin(bActs)}.`,
      `${a.name} keeps guests busy with ${listJoin(aActs)}; ${b.name} counters with ${listJoin(bActs)}.`,
    ]))
  } else if (aActs.length || bActs.length) {
    const has = aActs.length ? a : b
    const acts = aActs.length ? aActs : bActs
    parts.push(`On site, ${has.name} offers ${listJoin(acts)}.`)
  }

  if (a.country && a.country === b.country) {
    parts.push(pick(rng, [
      `Off property, ${a.country} adds ${destinationActivities(a)}.`,
      `Beyond the resort gates, count on ${destinationActivities(a)}.`,
    ]))
  } else {
    const aDest = destinationActivities(a), bDest = destinationActivities(b)
    parts.push(`Off property the destinations diverge: around ${a.name}, expect ${aDest}; near ${b.name}, ${bDest}.`)
  }

  return parts.join(' ')
}

// ---- public API ---------------------------------------------------------------
function buildOverview(a, b) {
  const rng = rngFor(`${a.slug}-vs-${b.slug}`)
  const keyDifferences = writeKeyDifferences(a, b, rng)
  const chooseA = writeWhoShouldChoose(a, b, rng)
  const chooseB = writeWhoShouldChoose(b, a, rng, chooseA.used)
  return {
    keyDifferences,
    whoShouldChooseA: chooseA.text,
    whoShouldChooseB: chooseB.text,
    whenToVisit: writeWhenToVisit(a, b, rng),
    activities: writeActivities(a, b, rng),
  }
}

module.exports = { buildOverview }
