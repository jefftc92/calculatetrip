const resorts = [
  {
    slug: 'nayara-bocas-del-toro',
    name: 'Nayara Bocas del Toro',
    country: 'Panama',
    countrySlug: 'panama',
    area: 'Bocas del Toro Archipelago',
    airport: 'Bocas del Toro (BOC)',
    type: 'adults-only',
    ageNote: 'Adults 18+',
    description:
      'Nayara Bocas del Toro is an overwater bungalow resort set in a remote rainforest archipelago in Panama. Accessible only by boat, the resort offers an immersive jungle-and-sea experience with private plunge pools, outstanding personalized service, and extraordinary wildlife. The food program — incorporating local Caribbean ingredients — consistently earns top marks from guests.',
    heroTagline: 'Overwater bungalows in a remote Panamanian rainforest archipelago.',
    amenities: ['Overwater bungalows', 'Private plunge pools', 'Snorkeling', 'Kayaking', 'Guided wildlife tours', 'Spa', 'All-inclusive dining', 'Open bar', 'Sunset cocktails', 'Boat transfers'],
    affiliateLink: 'https://www.tripadvisor.com/Hotel_Review-g635538-d8534272-Reviews-Nayara_Bocas_del_Toro-Bocas_del_Toro_Bocas_del_Toro_Province.html',
    agodaLink: 'https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1959986&hl=en-us&hid=70643919',
    ratings: { overall: 9.9, food: 9.8, beach: null, pool: 9.6, atmosphere: 9.9, location: 9.7, room: 9.9, value: 9.2, cleanliness: 9.9, service: 9.9, sleepQuality: 9.8 },
  },
  {
    slug: 'coco-plum-island-resort',
    name: 'Coco Plum Island Resort',
    country: 'Belize',
    countrySlug: 'belize',
    area: 'Dangriga',
    airport: 'Philip S. W. Goldson International (BZE)',
    type: 'adults-only',
    ageNote: 'Adults 16+',
    description:
      'Coco Plum Island Resort is a private island all-inclusive on a tiny caye in Belize. With just 16 cabanas on a pristine beach, it offers an intimate, castaway experience. The reef-front location is world-class for snorkeling and diving, and the all-inclusive includes unlimited shore diving. Service is extraordinarily warm and personal — many guests return year after year.',
    heroTagline: 'A 16-cabana private-island all-inclusive on the Belize Barrier Reef.',
    amenities: ['Private island', 'Beach cabanas', 'Snorkeling', 'Unlimited shore diving', 'Kayaking', 'Paddleboarding', 'Windsurfing', 'All-inclusive meals', 'Open bar', 'Island transport'],
    affiliateLink: 'https://www.tripadvisor.com/Hotel_Review-g291971-d1567892-Reviews-Coco_Plum_Island_Resort-Dangriga_Stann_Creek_District.html',
    agodaLink: 'https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1959986&hl=en-us&hid=260388',
    ratings: { overall: 9.8, food: 9.4, beach: 9.9, pool: 7.0, atmosphere: 9.9, location: 9.9, room: 9.5, value: 9.3, cleanliness: 9.8, service: 9.9, sleepQuality: 9.7 },
  },
  {
    slug: 'jade-mountain',
    name: 'Jade Mountain',
    country: 'Saint Lucia',
    countrySlug: 'saint-lucia',
    area: 'Soufrière',
    airport: 'Hewanorra International (UVF)',
    type: 'adults-only',
    ageNote: 'Adults 16+',
    description:
      'Jade Mountain is one of the most architecturally dramatic resorts in the world. Perched on a hillside above Saint Lucia\'s Piton World Heritage Site, each open-walled "sanctuary" suite frames a breathtaking Piton view with its own private infinity pool. The all-inclusive here is a premium experience — thoughtful cuisine, private dining on your pool deck, and extraordinary service from dedicated "sky butlers."',
    heroTagline: 'Open-wall sanctuaries with private infinity pools above the Pitons.',
    amenities: ['Private infinity pools', 'Open-wall sanctuaries', 'Piton views', 'Sky butlers', 'Private beach access', 'World-class snorkeling', 'Full spa', 'Fine dining', 'Open bar', 'Sunset cruises'],
    affiliateLink: 'https://www.tripadvisor.com/Hotel_Review-g147394-d150907-Reviews-Jade_Mountain-Soufriere_St_Lucia.html',
    agodaLink: 'https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1959986&hl=en-us&hid=6018',
    ratings: { overall: 9.7, food: 9.4, beach: 8.5, pool: 9.9, atmosphere: 9.9, location: 9.9, room: 9.9, value: 8.5, cleanliness: 9.8, service: 9.8, sleepQuality: 9.8 },
  },
  {
    slug: 'guana-island',
    name: 'Guana Island',
    country: 'British Virgin Islands',
    countrySlug: 'british-virgin-islands',
    area: 'North Sound',
    airport: 'Terrance B. Lettsome International (EIS)',
    type: 'family',
    ageNote: null,
    description:
      'Guana Island is an 850-acre private island nature reserve in the British Virgin Islands, operating as an exclusive-use all-inclusive retreat. With just 15 cottages and a maximum of 30 guests, it\'s one of the most private resorts on earth. The property encompasses seven beaches, a working organic farm, and extraordinary bird and wildlife watching. Families book the whole island for multi-generational celebrations.',
    heroTagline: 'An 850-acre private-island nature reserve with seven beaches.',
    amenities: ['Private island (exclusive use available)', 'Seven private beaches', 'Tennis courts', 'Organic farm', 'Nature trails', 'Snorkeling', 'Kayaking', 'Wildlife sanctuary', 'All-inclusive dining', 'Open bar'],
    affiliateLink: 'https://www.tripadvisor.com/Hotel_Review-g147362-d150923-Reviews-Guana_Island-Guana_Island_British_Virgin_Islands.html',
    agodaLink: 'https://www.agoda.com/search?q=Guana+Island+British+Virgin+Islands&cid=1959986',
    ratings: { overall: 9.5, food: 9.5, beach: 9.7, pool: 7.5, atmosphere: 9.8, location: 9.8, room: 9.3, value: 8.8, cleanliness: 9.7, service: 9.8, sleepQuality: 9.8 },
  },
  {
    slug: 'turtle-inn',
    name: 'Turtle Inn',
    country: 'Belize',
    countrySlug: 'belize',
    area: 'Placencia',
    airport: 'Philip S. W. Goldson International (BZE)',
    type: 'family',
    ageNote: null,
    description:
      'Turtle Inn is Francis Ford Coppola\'s beachfront all-inclusive resort in Placencia, Belize. The property blends Balinese-inspired architecture with Caribbean warmth across private beach cottages and villas. The food program — guided by the Coppola family\'s culinary heritage — is outstanding, with fresh seafood and farm-to-table ingredients. A beautiful private beach, excellent diving and snorkeling, and heartfelt service make it ideal for families and couples alike.',
    heroTagline: 'Coppola\'s Balinese-inspired beachfront all-inclusive in Placencia, Belize.',
    amenities: ['Private beach', 'Balinese-style cottages', 'Scuba diving', 'Snorkeling', 'Kayaking', 'Paddleboarding', 'Spa', 'Culinary programs', 'All-inclusive dining', 'Open bar'],
    affiliateLink: 'https://www.tripadvisor.com/Hotel_Review-g291969-d306359-Reviews-Turtle_Inn-Placencia_Stann_Creek_District.html',
    agodaLink: 'https://www.agoda.com/search?q=Turtle+Inn+Placencia+Belize&cid=1959986',
    ratings: { overall: 9.4, food: 9.7, beach: 9.3, pool: 8.5, atmosphere: 9.6, location: 9.2, room: 9.5, value: 8.7, cleanliness: 9.7, service: 9.7, sleepQuality: 9.6 },
  },
]

function bySlug(slug) {
  return resorts.find(r => r.slug === slug)
}

function byCountry(countrySlug) {
  return resorts.filter(r => r.countrySlug === countrySlug)
}

function byType(type) {
  return resorts.filter(r => r.type === type)
}

function topBy(key, count = 5) {
  return [...resorts]
    .filter(r => r.ratings[key] !== null)
    .sort((a, b) => (b.ratings[key] || 0) - (a.ratings[key] || 0))
    .slice(0, count)
}

function countries() {
  const seen = new Set()
  return resorts
    .filter(r => {
      if (seen.has(r.countrySlug)) return false
      seen.add(r.countrySlug)
      return true
    })
    .map(r => ({ name: r.country, slug: r.countrySlug, count: byCountry(r.countrySlug).length }))
}

function allComparisonPairs() {
  const pairs = []
  for (let i = 0; i < resorts.length; i++) {
    for (let j = i + 1; j < resorts.length; j++) {
      const x = resorts[i]
      const y = resorts[j]
      const [a, b] = x.slug < y.slug ? [x, y] : [y, x]
      pairs.push({ a, b })
    }
  }
  return pairs
}

module.exports = { resorts, bySlug, byCountry, byType, topBy, countries, allComparisonPairs }
