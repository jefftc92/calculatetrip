// Adds dynamic "+ Add Resort" functionality to comparison pages.
// 2-resort pages stay statically rendered for SEO. When ?add=<slug>
// query params are present, JS re-renders the comparison body with N
// columns (max 5 total, matching Car and Driver). The base 2-resort URL
// is what Google indexes — extra-column variants are noindex.

(function () {
  const MAX_TOTAL = 5

  const dataEl = document.getElementById('pair-data')
  if (!dataEl) return
  const data = JSON.parse(dataEl.textContent)
  const bySlug = Object.fromEntries(data.resorts.map(r => [r.slug, r]))

  function getExtras() {
    const params = new URLSearchParams(location.search)
    const raw = params.get('add')
    if (!raw) return []
    return raw.split(',')
      .map(s => s.trim())
      .filter(s => bySlug[s] && !data.base.includes(s))
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .slice(0, MAX_TOTAL - data.base.length)
  }

  function setExtras(slugs) {
    const url = new URL(location.href)
    if (slugs.length === 0) url.searchParams.delete('add')
    else url.searchParams.set('add', slugs.join(','))
    location.href = url.toString()
  }

  function scoreColor(s) {
    if (s === null || s === undefined) return 'text-gray-400'
    if (s >= 9.5) return 'text-emerald-600'
    if (s >= 9.0) return 'text-emerald-500'
    if (s >= 8.0) return 'text-amber-500'
    if (s >= 7.0) return 'text-orange-500'
    return 'text-red-500'
  }
  function scoreLabel(s) {
    if (s === null || s === undefined) return 'N/A'
    if (s >= 9.5) return 'Exceptional'
    if (s >= 9.0) return 'Superb'
    if (s >= 8.0) return 'Excellent'
    if (s >= 7.0) return 'Good'
    return 'Fair'
  }

  // ---------- Render with extras ----------

  function gridColsClass(n) {
    // Tailwind classes won't work for dynamic n, so use inline style
    return `repeat(${n}, minmax(70px, 90px))`
  }

  function renderHeroStrip(slugs) {
    const strip = document.getElementById('hero-strip')
    if (!strip) return
    strip.innerHTML = ''
    strip.className = 'flex gap-3 overflow-x-auto pb-2'
    slugs.forEach((slug, idx) => {
      const r = bySlug[slug]
      const isBase = data.base.includes(slug)
      const card = document.createElement('div')
      card.className = 'rounded-2xl p-4 sm:p-5 text-center border bg-white/5 border-white/10 relative flex-1 min-w-[160px]'
      card.innerHTML = `
        ${!isBase ? `<button type="button" data-remove="${slug}" class="absolute top-2 right-2 text-white/40 hover:text-white text-lg leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">×</button>` : ''}
        <a href="/resorts/${r.slug}/" class="font-serif text-base sm:text-lg font-bold text-white hover:text-gold-300 transition-colors block leading-snug mb-1 pr-4">${r.name}</a>
        <p class="font-sans text-xs text-ocean-400 mb-3">${r.country} · ${r.type === 'adults-only' ? 'Adults Only' : 'Family'}</p>
        <div class="font-serif text-4xl font-bold tabular-nums ${scoreColor(r.ratings.overall)}">${r.ratings.overall}</div>
        <div class="font-sans text-xs text-ocean-400 mt-0.5">${scoreLabel(r.ratings.overall)}</div>
        <a href="${r.agodaLink}" target="_blank" rel="noopener noreferrer sponsored" class="mt-4 block font-sans text-sm font-semibold rounded-xl py-2.5 transition-colors bg-gold-500 hover:bg-gold-600 text-white">Book on Agoda →</a>
      `
      strip.appendChild(card)
    })
    if (slugs.length < MAX_TOTAL) {
      const addBtn = document.createElement('button')
      addBtn.type = 'button'
      addBtn.id = 'add-resort-slot'
      addBtn.className = 'rounded-2xl p-4 sm:p-5 border-2 border-dashed border-white/20 hover:border-gold-500/60 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 min-h-[180px] text-ocean-300 hover:text-gold-300 flex-1 min-w-[160px]'
      addBtn.innerHTML = '<span class="text-3xl">+</span><span class="font-sans text-xs font-bold uppercase tracking-widest">Add Resort</span>'
      strip.appendChild(addBtn)
    }
    strip.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const slug = btn.dataset.remove
        const extras = getExtras().filter(s => s !== slug)
        setExtras(extras)
      })
    })
  }

  function renderRatingsTable(slugs) {
    const wrap = document.getElementById('ratings-table')
    if (!wrap) return
    const cols = slugs.length
    const tmpl = `1fr ${gridColsClass(cols)}`

    // Header
    const header = wrap.querySelector('.ratings-header')
    header.style.gridTemplateColumns = tmpl
    header.className = 'ratings-header grid bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider'
    header.innerHTML = `<div class="px-4 sm:px-5 py-3.5">Category</div>` +
      slugs.map(s => `<div class="py-3.5 text-center truncate px-1 text-ocean-300">${bySlug[s].name.split(' ')[0]}</div>`).join('')

    // Remove existing rows
    wrap.querySelectorAll('.ratings-row').forEach(el => el.remove())

    // Agoda row
    const agoda = document.createElement('div')
    agoda.className = 'ratings-row grid border-b border-ocean-50 bg-white'
    agoda.style.gridTemplateColumns = tmpl
    agoda.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-semibold">Book Online</div>` +
      slugs.map(s => `<div class="py-3 flex items-center justify-center"><a href="${bySlug[s].agodaLink}" target="_blank" rel="noopener noreferrer sponsored" class="inline-block font-sans text-[11px] font-bold uppercase tracking-wide bg-ocean-900 hover:bg-ocean-950 text-white px-3 py-1.5 rounded transition-colors">Agoda</a></div>`).join('')
    wrap.appendChild(agoda)

    // Rating rows
    data.ratingRows.forEach((row, i) => {
      const scores = slugs.map(s => bySlug[s].ratings[row.key])
      if (scores.every(v => v === null)) return
      const rowEl = document.createElement('div')
      rowEl.className = `ratings-row grid border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-ocean-50/40'}`
      rowEl.style.gridTemplateColumns = tmpl
      const labelBadge = row.key === 'overall'
        ? '<span class="text-[10px] font-bold uppercase tracking-wider text-ocean-400 bg-ocean-100 px-1.5 py-0.5 rounded">Overall</span>'
        : ''
      rowEl.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium flex items-center gap-2">${row.label}${labelBadge}</div>` +
        scores.map(v => v !== null
          ? `<div class="py-3.5 flex items-center justify-center"><span class="font-sans text-base font-bold tabular-nums ${scoreColor(v)}">${v}</span></div>`
          : `<div class="py-3.5 flex items-center justify-center"><span class="text-gray-300">—</span></div>`
        ).join('')
      wrap.appendChild(rowEl)
    })
  }

  function renderAmenitiesTable(slugs) {
    const wrap = document.getElementById('amenities-table')
    if (!wrap) return
    const cols = slugs.length
    const tmpl = `1fr ${gridColsClass(cols)}`
    const allAmenities = Array.from(new Set(slugs.flatMap(s => bySlug[s].amenities)))

    const header = wrap.querySelector('.amenities-header')
    header.style.gridTemplateColumns = tmpl
    header.className = 'amenities-header grid bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider'
    header.innerHTML = `<div class="px-4 sm:px-5 py-3.5">Amenity</div>` +
      slugs.map(s => `<div class="py-3.5 text-center truncate px-1 text-ocean-300">${bySlug[s].name.split(' ')[0]}</div>`).join('')

    wrap.querySelectorAll('.amenities-row').forEach(el => el.remove())

    allAmenities.forEach((am, i) => {
      const rowEl = document.createElement('div')
      rowEl.className = `amenities-row grid border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-ocean-50/40' : 'bg-white'}`
      rowEl.style.gridTemplateColumns = tmpl
      rowEl.innerHTML = `<div class="px-4 sm:px-5 py-3 font-sans text-sm text-ocean-700">${am}</div>` +
        slugs.map(s => bySlug[s].amenities.includes(am)
          ? `<div class="py-3 flex items-center justify-center"><span class="text-emerald-500 text-lg">✓</span></div>`
          : `<div class="py-3 flex items-center justify-center"><span class="text-gray-300">—</span></div>`
        ).join('')
      wrap.appendChild(rowEl)
    })
  }

  function renderTitle(slugs) {
    const title = document.getElementById('comparison-title')
    if (!title) return
    title.innerHTML = slugs.map((s, i) =>
      `${i > 0 ? '<span class="block font-sans font-normal text-ocean-500 text-xl my-2">vs</span>' : ''}${bySlug[s].name}`
    ).join('')
  }

  function applyExtras() {
    const extras = getExtras()
    if (extras.length === 0) return

    const slugs = [...data.base, ...extras]

    // Noindex the variant — base 2-resort URL stays the canonical indexable page
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, follow'
    document.head.appendChild(robots)

    // Hide sections that don't make sense with 3+ resorts
    const editorial = document.getElementById('editorial-summary')
    const verdict = document.getElementById('verdict-section')
    if (editorial) editorial.style.display = 'none'
    if (verdict) verdict.style.display = 'none'

    renderTitle(slugs)
    renderHeroStrip(slugs)
    renderRatingsTable(slugs)
    renderAmenitiesTable(slugs)
  }

  // ---------- Add resort modal ----------

  const modal = document.getElementById('add-resort-modal')
  const closeBtn = document.getElementById('add-resort-close')
  const form = document.getElementById('add-resort-form')
  const countryEl = document.getElementById('add-country')
  const areaRowEl = document.getElementById('add-area-row')
  const areaEl = document.getElementById('add-area')
  const resortEl = document.getElementById('add-resort')
  const submitBtn = document.getElementById('add-resort-submit')

  function currentSlugs() {
    return [...data.base, ...getExtras()]
  }

  function buildHierarchy(excludeSlugs) {
    const h = {}
    data.resorts.forEach(r => {
      if (excludeSlugs.includes(r.slug)) return
      if (!h[r.country]) h[r.country] = {}
      if (!h[r.country][r.area]) h[r.country][r.area] = []
      h[r.country][r.area].push(r)
    })
    return h
  }

  function populateCountries() {
    const h = buildHierarchy(currentSlugs())
    countryEl.innerHTML = '<option value="">Select country</option>'
    Object.keys(h).sort().forEach(c => {
      const opt = document.createElement('option')
      opt.value = c
      opt.textContent = c
      countryEl.appendChild(opt)
    })
    areaRowEl.classList.add('hidden')
    areaEl.disabled = true
    areaEl.innerHTML = '<option value="">Select area</option>'
    resortEl.disabled = true
    resortEl.innerHTML = '<option value="">Select resort</option>'
    submitBtn.disabled = true
  }

  function openModal() {
    populateCountries()
    modal.classList.remove('hidden')
  }
  function closeModal() {
    modal.classList.add('hidden')
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'add-resort-slot' || e.target.closest('#add-resort-slot')) openModal()
  })
  closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })

  countryEl.addEventListener('change', () => {
    const h = buildHierarchy(currentSlugs())
    areaEl.innerHTML = '<option value="">Select area</option>'
    resortEl.innerHTML = '<option value="">Select resort</option>'
    resortEl.disabled = true
    submitBtn.disabled = true

    const areas = h[countryEl.value]
    if (!areas) {
      areaRowEl.classList.add('hidden')
      areaEl.disabled = true
      return
    }
    const areaKeys = Object.keys(areas)
    if (areaKeys.length === 1) {
      areaRowEl.classList.add('hidden')
      areaEl.value = areaKeys[0]
      populateResortOptions(areas[areaKeys[0]])
    } else {
      areaRowEl.classList.remove('hidden')
      areaKeys.forEach(a => {
        const opt = document.createElement('option')
        opt.value = a
        opt.textContent = a
        areaEl.appendChild(opt)
      })
      areaEl.disabled = false
    }
  })

  function populateResortOptions(resorts) {
    resortEl.innerHTML = '<option value="">Select resort</option>'
    resorts.forEach(r => {
      const opt = document.createElement('option')
      opt.value = r.slug
      opt.textContent = r.name
      resortEl.appendChild(opt)
    })
    resortEl.disabled = resorts.length === 0
  }

  areaEl.addEventListener('change', () => {
    const h = buildHierarchy(currentSlugs())
    const areas = h[countryEl.value]
    if (!areas || !areaEl.value) return
    populateResortOptions(areas[areaEl.value] || [])
    submitBtn.disabled = true
  })

  resortEl.addEventListener('change', () => {
    submitBtn.disabled = !resortEl.value
  })

  form.addEventListener('submit', e => {
    e.preventDefault()
    if (!resortEl.value) return
    const extras = [...getExtras(), resortEl.value]
    setExtras(extras)
  })

  // ---------- Initialize ----------
  applyExtras()
})()
