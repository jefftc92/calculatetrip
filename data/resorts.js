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
    whatYouNeedToKnow: `Nayara Bocas del Toro sits in a remote corner of Panama's Bocas del Toro Archipelago, accessible only by small aircraft to a tiny airstrip and then a boat transfer — the journey itself signals the seclusion ahead. Overwater bungalows with private plunge pools sit directly above turquoise Caribbean water, surrounded by mangroves and rainforest teeming with toucans, sloths, and dolphins. The all-inclusive package covers all meals, drinks, snorkeling, kayaking, guided wildlife excursions, and transfers. Service ratings are among the highest in our database, reflecting a staff-to-guest ratio that allows for genuinely personal attention. Best visited during February–April or September–October, Bocas del Toro's driest windows; Panama sits outside the Atlantic hurricane belt, making it a strong year-round alternative to Caribbean islands.`,
    bestTimeToVisit: `Panama's Bocas del Toro region sits outside the Atlantic hurricane belt, making Nayara a strong year-round choice. The driest stretches are typically February through April and again September through October — those windows offer the most reliable sunny days and calmest seas for snorkeling. November through January can be wetter but remain excellent for wildlife viewing, with rain showers usually brief and afternoon-bound.`,
    activities: `Nayara's all-inclusive includes snorkeling, kayaking, guided wildlife tours through the archipelago, and all boat transfers between the resort and nearby islands. Guests routinely spot toucans, sloths, and dolphins on guided excursions, or spend the day in their private plunge pool above the water. Spa treatments, sunset cocktails, and meals at the open-air dining room round out daily life — there's no traditional beach, but the overwater bungalows are the main attraction.`,
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
    whatYouNeedToKnow: `Coco Plum occupies a private reef caye off the coast of Belize with just 16 cabanas — fewer than almost any other all-inclusive anywhere. The Mesoamerican Barrier Reef begins just offshore, and the all-inclusive package includes unlimited shore diving, making it one of the most generous dive inclusions available at any price point. Adults-only (16+) policy ensures a relaxed, couples-focused atmosphere. Access is via domestic flight to Dangriga followed by a 45-minute boat transfer. Peak season runs late November through April, with February and March offering the calmest diving conditions on the reef.`,
    bestTimeToVisit: `Belize is best from late November through April — the dry season delivers calm seas, excellent diving visibility, and reliable sunshine. February and March are peak months with the calmest reef conditions, though pricing peaks as well. May through October brings warmer weather but increased rainfall and Atlantic hurricane risk, which peaks in September; portions of the low season may see partial closures, so verify availability before booking.`,
    activities: `Coco Plum is built squarely around the Mesoamerican Reef — unlimited shore diving is included in the all-inclusive package, an unusually generous inclusion. Guests also have unlimited use of snorkel gear, kayaks, paddleboards, and windsurfers directly from the island. Off-property excursions to the Blue Hole, mainland Mayan ruins, and the wider Belize Barrier Reef are available for an additional charge. With just 16 cabanas, daily life centers on water activities and beach time.`,
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
    whatYouNeedToKnow: `Jade Mountain's open-wall "sanctuary" suites dissolve the boundary between room and landscape — every suite faces the UNESCO-listed Pitons directly, with a private infinity pool as the foreground and no fourth wall. A dedicated sky butler is assigned to each sanctuary, available around the clock for private dining, in-suite service, and itinerary planning. The resort shares its beach and a world-class dive site with sister property Anse Chastanet, giving guests the rare combination of a design-forward clifftop retreat and reef access. December through April is peak season; the green season (June–November) brings lush scenery and softer pricing, though Atlantic storm risk increases September through October.`,
    bestTimeToVisit: `Saint Lucia's high season runs December through April, with the most reliable weather and pricing to match. May and June often offer good shoulder-season value with mostly sunny conditions, though humidity rises. June through November is Atlantic hurricane season, with September and October the highest-risk months — Jade Mountain stays open year-round, but flexible cancellation terms become more important during storm season.`,
    activities: `Each Jade Mountain sanctuary centers on a private infinity pool, so much of the experience happens directly in your suite. Beyond the room, the resort shares beach access, world-class snorkeling, and reef diving with sister property Anse Chastanet down the hill. Sky butlers arrange spa treatments, private in-suite dining, sunset cruises, and excursions to the Pitons, Sulphur Springs, and the island's drive-in volcano. The all-inclusive covers meals, drinks, and most on-property amenities; some excursions are extra.`,
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
    whatYouNeedToKnow: `Guana Island's 850 acres stretch across a private BVI nature reserve, giving just 15 cottages the run of seven beaches, coral-fringed bays, and nature trails teeming with rare geckos, iguanas, and endemic birds. The resort can be booked on an exclusive-use basis for groups of up to 30, making it one of the only true full-island buyout options in the Caribbean. Access is by private charter boat from Tortola, typically a 30-minute transfer. The all-inclusive package covers all meals, drinks, and most activities. Best from December through May; Atlantic hurricane risk runs June through November, with September and October the most disruptive months in the BVI.`,
    bestTimeToVisit: `The BVI's reliable high season runs December through May, with February through April delivering peak conditions for sailing, beaches, and water clarity. June through November is Atlantic hurricane season; September and October carry the highest storm risk, and Guana typically closes for part of this stretch for property renewals. Shoulder months — early December and late May — often deliver strong weather at softer rates.`,
    activities: `Guana Island's 850-acre nature reserve includes seven private beaches, marked nature trails through a working wildlife sanctuary, tennis courts, and an organic farm that supplies much of the kitchen. Snorkeling and kayaking are included in the all-inclusive along with all meals, drinks, and most non-motorized water sports. Scuba diving and motorized excursions are available for an additional fee. The resort can be booked exclusively for groups of up to 30 — a buyout option rare in the Caribbean.`,
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
    whatYouNeedToKnow: `Turtle Inn is Francis Ford Coppola's contribution to Belize's hospitality landscape — a collection of Balinese-inspired thatched cottages and villas on a private beach in Placencia, with a culinary program that rivals standalone destination restaurants. The food score is the highest of any family-friendly resort in our database, reflecting the Coppola family's longstanding investment in ingredients and wine. Families and couples are equally well served; the resort has warmth and personal character that feel distinct from large-scale all-inclusives. Placencia is accessible by domestic flight from Belize City or by road, making logistics easier than most remote Belize properties. Best from late November through April.`,
    bestTimeToVisit: `Belize's dry season runs late November through April, with February and March offering the most reliable weather and calmest Caribbean conditions. Placencia's beachfront stays warm and breezy throughout high season. May through October sees more rain and elevated hurricane risk that peaks in September; Turtle Inn typically stays open year-round, but late summer and early fall stays should include cancellation flexibility.`,
    activities: `Turtle Inn's culinary program is itself a destination — cooking classes, garden tours of the on-site organic garden, and three on-property restaurants drive much of daily life. Water sports include scuba diving, snorkeling, kayaking, and paddleboarding directly from the private beach, with off-site excursions to inland jungle, Mayan ruins, and the Belize Barrier Reef available. The spa offers Balinese-inspired treatments, and the calm beachfront water suits families and casual swimmers.`,
    amenities: ['Private beach', 'Balinese-style cottages', 'Scuba diving', 'Snorkeling', 'Kayaking', 'Paddleboarding', 'Spa', 'Culinary programs', 'All-inclusive dining', 'Open bar'],
    affiliateLink: 'https://www.tripadvisor.com/Hotel_Review-g291969-d306359-Reviews-Turtle_Inn-Placencia_Stann_Creek_District.html',
    agodaLink: 'https://www.agoda.com/search?q=Turtle+Inn+Placencia+Belize&cid=1959986',
    ratings: { overall: 9.4, food: 9.7, beach: 9.3, pool: 8.5, atmosphere: 9.6, location: 9.2, room: 9.5, value: 8.7, cleanliness: 9.7, service: 9.7, sleepQuality: 9.6 },
  },
]

const pairOverviews = {
  'coco-plum-island-resort-vs-guana-island': {
    keyDifferences: `Both are private-island all-inclusives with small guest counts and a nature-first ethos, but they serve very different travelers. Coco Plum is an adults-only retreat in Belize built around the Mesoamerican Reef, with unlimited shore diving as the headline inclusion. Guana Island, by contrast, is a family-friendly 850-acre nature reserve in the BVI with seven private beaches and the option to buy out the entire island for groups of up to 30. Coco Plum edges ahead in overall polish and service consistency; Guana wins on sheer scale, beach variety, and family flexibility. The decision comes down to whether you want a focused, reef-centered adults-only honeymoon or a sprawling island playground that welcomes kids and full groups.`,
    whoShouldChooseA: `Couples, divers, and honeymooners who want an adults-only reef escape with unlimited diving included should book Coco Plum. It's the stronger pick any time the ocean is the primary itinerary item.`,
    whoShouldChooseB: `Multi-generational families, friend groups, and anyone considering a full island buyout for a milestone celebration should choose Guana Island. It's also the right call for guests who want multiple beaches to explore and more land-based activities.`,
    whenToVisit: `Coco Plum peaks late November through April during Belize's dry season, with February and March offering the calmest diving conditions. Guana Island is most reliable December through May; both destinations sit in the Atlantic hurricane belt, so September and October carry the highest storm risk in either location.`,
    activities: `Coco Plum's all-inclusive covers unlimited shore diving, snorkeling, kayaking, paddleboarding, and windsurfing. Guana Island balances water and land with snorkeling, kayaking, tennis, nature trails, an organic farm, and wildlife watching across its 850-acre reserve. Coco Plum is the dive resort; Guana is the island explorer's resort.`,
  },
  'coco-plum-island-resort-vs-jade-mountain': {
    keyDifferences: `These two adults-only resorts represent opposite design philosophies in the Caribbean. Coco Plum is a barefoot private island in Belize with simple cabanas and an all-in focus on the reef beneath it. Jade Mountain in Saint Lucia is one of the most architecturally striking hotels in the world, with open-wall sanctuaries, private infinity pools in every suite, sky butlers, and direct views of the Pitons. Coco Plum scores slightly higher overall thanks to stronger value and service consistency, but Jade Mountain delivers a more visually iconic, once-in-a-lifetime room experience that has no real equivalent. Choose Coco Plum for active reef seclusion; choose Jade Mountain when the room and the view are the point.`,
    whoShouldChooseA: `Divers, snorkelers, and couples who want an active water-focused holiday with strong value should book Coco Plum. It's also the better pick for travelers who'd rather spend on reef time than on architectural drama.`,
    whoShouldChooseB: `Honeymooners and couples celebrating a milestone occasion who want the most photogenic room in the Caribbean should choose Jade Mountain. It's right for anyone whose priority is a bucket-list suite with a private pool and an irreplaceable view.`,
    whenToVisit: `Coco Plum peaks late November through April in Belize's dry season. Saint Lucia is best December through April; both destinations face Atlantic hurricane season June through November, with September and October carrying the highest risk for either property.`,
    activities: `Coco Plum offers unlimited shore diving, snorkeling, kayaking, paddleboarding, and windsurfing as part of the all-inclusive. Jade Mountain centers on private infinity pools, sky butler service, beach access, snorkeling, a full spa, fine dining, and sunset cruises. Coco Plum is the active water-sports resort; Jade Mountain is about lingering in your suite and savoring the setting.`,
  },
  'coco-plum-island-resort-vs-nayara-bocas-del-toro': {
    keyDifferences: `Both are remote adults-only all-inclusives accessible only by boat, but the settings are strikingly different. Coco Plum is a sun-drenched Belizean reef caye built around beach and diving. Nayara Bocas del Toro is a Panamanian rainforest archipelago resort with overwater bungalows, private plunge pools, and a wildlife-immersion identity rather than a traditional beach. Nayara has a slight edge overall, driven by exceptional room and service scores, while Coco Plum leads on beach and offers a more active dive program with unlimited shore diving included. Choose Coco Plum for reef, sand, and value; choose Nayara for jungle, overwater architecture, and the highest available service ratings.`,
    whoShouldChooseA: `Divers and reef enthusiasts who want unlimited shore diving included in the rate, a proper Caribbean beach, and stronger value should book Coco Plum. It's the better pick for couples who plan to spend most of their time in or on the water.`,
    whoShouldChooseB: `Couples seeking an overwater bungalow with a private plunge pool, rainforest wildlife at the doorstep, and a more design-forward stay should choose Nayara. It's also a strong pick during Atlantic hurricane season since Panama sits outside that risk zone.`,
    whenToVisit: `Coco Plum peaks late November through April in Belize's dry season. Bocas del Toro is typically driest in February–April and again in September–October; Panama sits outside the Atlantic hurricane belt entirely, making Nayara a reliable option when Caribbean islands are more exposed.`,
    activities: `Coco Plum delivers unlimited shore diving, snorkeling, kayaking, paddleboarding, and windsurfing as part of the all-inclusive. Nayara focuses on guided wildlife tours, snorkeling, kayaking, sunset cocktails, and spa time, with overwater bungalows and plunge pools serving as their own activities. Coco Plum is about getting in the water; Nayara is about being suspended over it.`,
  },
  'coco-plum-island-resort-vs-turtle-inn': {
    keyDifferences: `Both are Belize all-inclusives, making this the most direct apples-to-apples comparison in our database. Coco Plum is an adults-only private island caye with 16 cabanas and unlimited reef diving. Turtle Inn is Francis Ford Coppola's family-friendly beachfront resort on the Placencia peninsula, with a culinary program that is among the best of any all-inclusive. Coco Plum edges Turtle Inn overall on beach, seclusion, and value; Turtle Inn wins on food and serves families where Coco Plum does not. Both are in Belize, both share similar seasonal patterns, and both offer diving and snorkeling — the choice turns on whether you want adults-only island isolation or a mainland resort with Coppola-level cuisine.`,
    whoShouldChooseA: `Couples, honeymooners, and divers who want adults-only seclusion with unlimited shore diving directly off the island should pick Coco Plum. It's the stronger value play and the purer reef experience.`,
    whoShouldChooseB: `Families and food-focused couples who want outstanding cuisine, easier mainland access, and a stylish beach experience should choose Turtle Inn. It's also the better option for guests who want to combine beach time with inland Belize jungle excursions.`,
    whenToVisit: `Both resorts share Belize's seasonal calendar. Late November through April is the driest and most reliable stretch, with February and March peak. June through October brings increased rainfall and elevated hurricane risk, particularly in September.`,
    activities: `Coco Plum leads on water sports: unlimited shore diving, snorkeling, kayaking, paddleboarding, and windsurfing from the island. Turtle Inn offers scuba diving, snorkeling, kayaking, paddleboarding, a spa, and its standout culinary programs, with a private beach as the daily anchor. Coco Plum is the dive-first resort; Turtle Inn is the beach-and-food resort.`,
  },
  'guana-island-vs-jade-mountain': {
    keyDifferences: `These two resorts occupy very different niches at the top of the all-inclusive market. Guana Island is a family-friendly 850-acre private nature reserve in the BVI with seven beaches, wildlife trails, and an exclusive-use buyout option. Jade Mountain is an adults-only architectural landmark in Saint Lucia where each open-wall suite has a private infinity pool and an unobstructed Piton view. Jade Mountain edges ahead in room experience and overall design drama, while Guana wins on beach variety, family suitability, and the sheer space to roam. The decision turns on whether you're traveling with kids who need acreage or as a couple chasing a signature room.`,
    whoShouldChooseA: `Families, friend groups, and anyone planning a full-island buyout for a multi-generational celebration should choose Guana Island. It's also the right call for guests who want diverse beaches and land activities alongside the water.`,
    whoShouldChooseB: `Honeymooners and couples celebrating a milestone occasion who want the most visually dramatic all-inclusive room in the Caribbean should choose Jade Mountain. It's right when the private infinity pool and the Piton view are the whole trip.`,
    whenToVisit: `Both the BVI and Saint Lucia peak December through April or May. Both sit in the Atlantic hurricane belt, with June through November bringing elevated storm risk; September and October are the most disruptive months for either island destination.`,
    activities: `Guana Island spans seven beaches, snorkeling, kayaking, tennis, an organic farm, and nature trails through its wildlife sanctuary. Jade Mountain centers on private infinity pools, sky butler service, beach access, snorkeling, a full spa, fine dining, and sunset cruises. Guana is about exploring a whole island; Jade Mountain is about staying in your suite and experiencing the view.`,
  },
  'guana-island-vs-nayara-bocas-del-toro': {
    keyDifferences: `Both resorts deliver remote, nature-immersed privacy, but the settings and guest profiles diverge sharply. Guana Island is a family-friendly 850-acre BVI nature reserve with seven beaches and up to 30 guests at a time. Nayara Bocas del Toro is an adults-only Panamanian rainforest archipelago with overwater bungalows, private plunge pools, and no traditional beach. Nayara scores higher overall, particularly on food, service, and room, while Guana wins on beach variety and family flexibility. Choose Guana for a Caribbean island you can explore on foot; choose Nayara for a jungle-and-water retreat you experience from above the water.`,
    whoShouldChooseA: `Families, multigenerational groups, and anyone eyeing a full island buyout should choose Guana Island. It's also the better pick for guests who want multiple beaches and extensive land activities.`,
    whoShouldChooseB: `Adults-only couples seeking overwater bungalows, plunge pools, rainforest wildlife, and top-tier service should choose Nayara. It's also a reliable hurricane-season option since Panama sits outside the Atlantic storm belt.`,
    whenToVisit: `Guana Island peaks December through May, with Atlantic hurricane risk peaking September through October in the BVI. Bocas del Toro is typically driest in February–April and September–October; Panama's position outside the hurricane belt makes Nayara a useful alternative when the Caribbean is at seasonal risk.`,
    activities: `Guana Island offers seven private beaches, snorkeling, kayaking, tennis, an organic farm, and nature trails through its wildlife sanctuary. Nayara centers on guided wildlife tours, snorkeling, kayaking, sunset cocktails, spa, and overwater bungalow life with private plunge pools. Guana is about exploring an entire island; Nayara is about immersing in the rainforest from directly above the water.`,
  },
  'guana-island-vs-turtle-inn': {
    keyDifferences: `Both resorts welcome families and sit in the upper tier of Caribbean all-inclusives, but they deliver that experience in different geographies and with different strengths. Guana Island is an 850-acre private BVI nature reserve with seven beaches, a buyout option, and exceptional seclusion. Turtle Inn is Coppola's family-friendly Balinese-inspired beachfront resort on Belize's Placencia Peninsula, with the strongest food program of any family resort in our database. Guana edges Turtle Inn overall on location, atmosphere, and beach breadth; Turtle Inn wins on food and offers easier logistics from North America. The choice is between full Caribbean island privacy and a more accessible, food-forward mainland beach stay.`,
    whoShouldChooseA: `Families and groups who want genuine private-island seclusion, multiple beaches to choose from, or the option of a full island buyout should pick Guana Island. It's the more dramatic, exclusive choice for milestone trips.`,
    whoShouldChooseB: `Food-focused families and couples who want a beautiful beach, outstanding cuisine, and easier access from North American cities should choose Turtle Inn. Placencia is far simpler to reach than the BVI, and Turtle Inn's food program is unmatched at this resort category.`,
    whenToVisit: `Guana Island peaks December through May, with the BVI's Atlantic hurricane risk highest in September and October. Turtle Inn follows Belize's dry season from late November through April, with similar storm exposure in late summer and early fall. Both are best avoided September–October at the height of Atlantic hurricane season.`,
    activities: `Guana offers seven private beaches, snorkeling, kayaking, tennis, an organic farm, and wildlife trails. Turtle Inn delivers scuba diving, snorkeling, kayaking, paddleboarding, a spa, and its signature culinary programs on a private beach. Guana is about exploring acreage; Turtle Inn is about eating exceptionally well between water activities.`,
  },
  'jade-mountain-vs-nayara-bocas-del-toro': {
    keyDifferences: `Both are adults-only, design-driven resorts at the apex of the all-inclusive market, but they differ in geography and experience. Jade Mountain in Saint Lucia is defined by its open-wall sanctuaries and private infinity pools overlooking a UNESCO World Heritage site — the architecture and the view are the core offering. Nayara Bocas del Toro in Panama is an overwater bungalow resort in a remote rainforest archipelago, where the experience is about immersion in a thriving ecosystem as much as the room itself. Nayara edges Jade Mountain overall on food, service, and value; Jade Mountain wins on pool experience and the singular drama of its setting. Both are among the most memorable resort stays available anywhere.`,
    whoShouldChooseA: `Honeymooners and couples who want the most architecturally iconic all-inclusive in the Caribbean — a private infinity pool with an unobstructed Piton view — should choose Jade Mountain. It's right when the room itself is the destination.`,
    whoShouldChooseB: `Couples who want wildlife immersion, overwater bungalows, stronger value, and a more remote jungle-and-sea experience should choose Nayara. It's also the smarter pick during Atlantic hurricane season since Panama sits outside the storm belt.`,
    whenToVisit: `Jade Mountain peaks December through April, with Atlantic hurricane risk running June through November and peaking September–October in Saint Lucia. Bocas del Toro is typically driest February–April and September–October, with Panama sitting outside the hurricane belt entirely — making Nayara a reliable shoulder-season option.`,
    activities: `Jade Mountain centers on private infinity pools, sky butler service, beach access, world-class snorkeling, a full spa, fine dining, and sunset cruises. Nayara focuses on guided wildlife tours, snorkeling, kayaking, sunset cocktails, spa, and overwater bungalow life with plunge pools. Jade Mountain is about the room and the Piton view; Nayara is about engaging with the rainforest from above the water.`,
  },
  'jade-mountain-vs-turtle-inn': {
    keyDifferences: `Jade Mountain and Turtle Inn represent two ends of the all-inclusive personality spectrum. Jade Mountain is an adults-only Saint Lucian icon: open-wall suites, private infinity pools, sky butlers, and a UNESCO mountain view. Turtle Inn is Coppola's family-friendly Balinese-inspired beachfront resort in Belize, distinguished above all by its exceptional food program. Jade Mountain edges Turtle Inn in overall score, room experience, and design drama; Turtle Inn wins on food and welcomes families where Jade Mountain does not. Choose Jade Mountain for a bucket-list room; choose Turtle Inn for a warm, food-forward beach stay that works for the whole family.`,
    whoShouldChooseA: `Couples celebrating a honeymoon or milestone occasion who want the most dramatic room in the Caribbean should choose Jade Mountain. It's right when the private pool and the Piton view are the primary reason for the trip.`,
    whoShouldChooseB: `Families and food-obsessed couples who want exceptional cuisine, a relaxed beachfront vibe, easier North American access, and flexibility for diving and jungle day trips should pick Turtle Inn.`,
    whenToVisit: `Jade Mountain peaks December through April, with Atlantic hurricane risk highest September–October in Saint Lucia. Turtle Inn follows Belize's dry season from late November through April, with similar storm exposure in late summer and fall. Both are best avoided during peak Atlantic hurricane season.`,
    activities: `Jade Mountain offers private infinity pools, sky butler service, beach access, world-class snorkeling, a full spa, fine dining, and sunset cruises. Turtle Inn delivers scuba diving, snorkeling, kayaking, paddleboarding, a spa, and its standout culinary programs on a private beach. Jade Mountain is about the room and the view; Turtle Inn is about outstanding food, the beach, and the water.`,
  },
  'nayara-bocas-del-toro-vs-turtle-inn': {
    keyDifferences: `Both are intimate, character-rich Central American all-inclusives, but the experiences diverge substantially. Nayara Bocas del Toro is an adults-only Panamanian rainforest resort with overwater bungalows, plunge pools, and a wildlife-immersion focus. Turtle Inn is Coppola's family-friendly Balinese-inspired beachfront property in Belize's Placencia, anchored by an exceptional culinary program and a private Caribbean beach. Nayara leads on atmosphere, room, service, and overall score; Turtle Inn wins on food and is the more practical choice for families and travelers seeking easier logistics from North America. Panama sits outside the Atlantic hurricane belt, giving Nayara a meaningful seasonal advantage.`,
    whoShouldChooseA: `Adults-only couples who want overwater bungalows, rainforest wildlife, and top-tier service in a completely remote setting should choose Nayara. It's also the better bet year-round since Panama avoids the Atlantic hurricane belt entirely.`,
    whoShouldChooseB: `Families and foodies who want a private Caribbean beach, outstanding cuisine, and straightforward access from North American hubs should choose Turtle Inn. Placencia is far simpler to reach than Bocas del Toro, and the Coppola food program is a genuine differentiator.`,
    whenToVisit: `Nayara is driest February–April and September–October; Panama's position outside the hurricane belt makes it a reliable option year-round. Turtle Inn follows Belize's dry season from late November through April, with Atlantic hurricane risk elevated June through November and peaking in September.`,
    activities: `Nayara centers on guided wildlife tours, snorkeling, kayaking, sunset cocktails, spa, and life in an overwater bungalow with a private plunge pool. Turtle Inn offers scuba diving, snorkeling, kayaking, paddleboarding, a spa, and its signature culinary programs on a private beach. Nayara is about rainforest and water immersion; Turtle Inn is about beach, diving, and food.`,
  },
}

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

module.exports = { resorts, bySlug, byCountry, byType, topBy, countries, allComparisonPairs, pairOverviews }
