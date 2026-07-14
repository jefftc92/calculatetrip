(function () {
  const MAX_TOTAL = 5

  const dataEl = document.getElementById('pair-data')
  if (!dataEl) return
  // Inline data holds only { base, ratingRows }; the full resort dataset is
  // fetched once from /pair-data.json (cached across all compare pages).
  const data = JSON.parse(dataEl.textContent)
  data.resorts = []
  let bySlug = {}

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

  function gridColsClass(n) {
    return `repeat(${n}, minmax(110px, 140px))`
  }

  function renderHeroStrip(slugs) {
    const strip = document.getElementById('hero-strip')
    if (!strip) return
    strip.innerHTML = ''
    strip.className = 'flex gap-3 overflow-x-auto pb-2'
    slugs.forEach(slug => {
      const r = bySlug[slug]
      const isBase = data.base.includes(slug)
      const chips = r.amenities
        .map(am => `<span class="font-sans text-[10px] bg-white/10 text-ocean-200 px-2 py-0.5 rounded-full leading-tight">${am}</span>`)
        .join('')
      const card = document.createElement('div')
      card.className = 'rounded-2xl p-4 sm:p-5 border bg-white/5 border-white/10 relative flex-1 min-w-[160px]'
      card.innerHTML = `
        ${!isBase ? `<button type="button" data-remove="${slug}" class="absolute top-2 right-2 text-white/40 hover:text-white text-lg leading-none w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10">×</button>` : ''}
        <a href="/resorts/${r.slug}/" class="font-serif text-base sm:text-lg font-bold text-white hover:text-gold-300 transition-colors block leading-snug mb-1 pr-4">${r.name}</a>
        <p class="font-sans text-xs text-ocean-400 mb-3">${r.country} · ${r.type === 'adults-only' ? 'Adults Only' : 'Family'}</p>
        <div class="font-serif text-4xl font-bold tabular-nums ${scoreColor(r.ratings.overall)}">${r.ratings.overall ?? '—'}</div>
        <div class="font-sans text-xs text-ocean-400 mt-0.5 mb-4">${scoreLabel(r.ratings.overall)}</div>
        <div class="flex flex-wrap gap-1 mb-4">${chips}</div>
        <a href="${r.agodaLink}" target="_blank" rel="noopener noreferrer sponsored" class="block font-sans text-sm font-semibold rounded-xl py-2.5 transition-colors text-center bg-gold-500 hover:bg-gold-600 text-white">Check Prices →</a>
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
        setExtras(getExtras().filter(s => s !== btn.dataset.remove))
      })
    })
  }

  function renderRatingsTable(slugs) {
    const wrap = document.getElementById('ratings-table')
    if (!wrap) return
    const tmpl = `1fr ${gridColsClass(slugs.length)}`

    const header = wrap.querySelector('.ratings-header')
    header.style.gridTemplateColumns = tmpl
    header.className = 'ratings-header grid bg-ocean-950 text-white text-xs font-sans font-bold uppercase tracking-wider'
    header.innerHTML = `<div class="px-4 sm:px-5 py-3.5">Category</div>` +
      slugs.map(s => `<div class="py-3.5 text-center px-2 text-ocean-300 leading-tight">${bySlug[s].name}</div>`).join('')

    wrap.querySelectorAll('.ratings-row').forEach(el => el.remove())

    const bookRow = document.createElement('div')
    bookRow.className = 'ratings-row grid border-b border-ocean-50 bg-white'
    bookRow.style.gridTemplateColumns = tmpl
    bookRow.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-semibold">Book Online</div>` +
      slugs.map(s => `<div class="py-3 flex items-center justify-center"><a href="${bySlug[s].agodaLink}" target="_blank" rel="noopener noreferrer sponsored" class="inline-block font-sans text-[11px] font-bold uppercase tracking-wide bg-ocean-900 hover:bg-ocean-950 text-white px-3 py-1.5 rounded transition-colors">Book Now</a></div>`).join('')
    wrap.appendChild(bookRow)

    const hasPriceLevel = slugs.some(s => bySlug[s].priceLevel)
    if (hasPriceLevel) {
      const plRow = document.createElement('div')
      plRow.className = 'ratings-row grid border-b border-ocean-50 bg-ocean-50/40'
      plRow.style.gridTemplateColumns = tmpl
      plRow.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium">Price Level</div>` +
        slugs.map(s => `<div class="py-3.5 flex items-center justify-center"><span class="font-sans text-sm font-semibold text-ocean-800">${escapeHtml(bySlug[s].priceLevel || '—')}</span></div>`).join('')
      wrap.appendChild(plRow)
    }

    const gtRow = document.createElement('div')
    gtRow.className = 'ratings-row grid border-b border-ocean-50 bg-white'
    gtRow.style.gridTemplateColumns = tmpl
    gtRow.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium">Guest Type</div>` +
      slugs.map(s => {
        const r = bySlug[s]
        const label = r.type === 'adults-only' ? 'Adults Only' : 'Family'
        const note = r.ageNote ? `<br><span class="font-normal text-ocean-500">(${escapeHtml(r.ageNote)})</span>` : ''
        return `<div class="py-3.5 flex items-center justify-center px-2 text-center"><span class="font-sans text-xs font-semibold text-ocean-800 leading-tight">${label}${note}</span></div>`
      }).join('')
    wrap.appendChild(gtRow)

    const hasNotes = slugs.some(s => bySlug[s].notes)
    if (hasNotes) {
      const notesRow = document.createElement('div')
      notesRow.className = 'ratings-row grid border-b border-ocean-50 bg-ocean-50/40'
      notesRow.style.gridTemplateColumns = tmpl
      notesRow.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium">Notes</div>` +
        slugs.map(s => `<div class="py-3 px-3 flex items-center justify-center text-center"><span class="font-sans text-[11px] text-ocean-600 leading-snug">${escapeHtml(bySlug[s].notes || '—')}</span></div>`).join('')
      wrap.appendChild(notesRow)
    }

    data.ratingRows.forEach((row, i) => {
      const scores = slugs.map(s => bySlug[s].ratings[row.key])
      if (scores.every(v => v === null)) return
      const rowEl = document.createElement('div')
      rowEl.className = `ratings-row grid border-b border-ocean-50 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-ocean-50/40'}`
      rowEl.style.gridTemplateColumns = tmpl
      const badge = row.key === 'overall'
        ? '<span class="text-[10px] font-bold uppercase tracking-wider text-ocean-400 bg-ocean-100 px-1.5 py-0.5 rounded">Overall</span>'
        : ''
      rowEl.innerHTML = `<div class="px-4 sm:px-5 py-3.5 font-sans text-sm text-ocean-700 font-medium flex items-center gap-2">${row.label}${badge}</div>` +
        scores.map(v => v !== null
          ? `<div class="py-3.5 flex items-center justify-center"><span class="font-sans text-base font-bold tabular-nums ${scoreColor(v)}">${v}</span></div>`
          : `<div class="py-3.5 flex items-center justify-center"><span class="text-gray-300">—</span></div>`
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  }

  function renderMultiOverview(slugs) {
    const wrap = document.getElementById('overview-multi')
    if (!wrap) return
    wrap.classList.remove('hidden')

    // Per-resort grid sizing
    const perResortGridCols = slugs.length === 2 ? 'sm:grid-cols-2' : slugs.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'

    // When to Visit — one card per resort (repeat country text is fine in boilerplate)
    const whenCardsHtml = slugs.map(s => {
      const r = bySlug[s]
      return `
        <div class="bg-white border border-ocean-100 rounded-2xl shadow-card p-5 sm:p-6">
          <p class="font-sans text-[10px] font-bold uppercase tracking-widest text-ocean-400 mb-1">${escapeHtml(r.country)}</p>
          <h3 class="font-serif text-base font-bold text-ocean-950 mb-3">${escapeHtml(r.name)}</h3>
          <p class="font-sans text-sm text-ocean-700 leading-relaxed">${escapeHtml(r.bestTimeToVisit)}</p>
        </div>
      `
    }).join('')
    const whenHtml = `
      <div>
        <h2 class="font-serif text-xl font-bold text-ocean-950 mb-4">When to Visit</h2>
        <div class="grid grid-cols-1 ${perResortGridCols} gap-4">${whenCardsHtml}</div>
      </div>
    `
    const activitiesCardsHtml = slugs.map(s => {
      const r = bySlug[s]
      return `
        <div class="bg-white border border-ocean-100 rounded-2xl shadow-card p-5 sm:p-6">
          <h3 class="font-serif text-base font-bold text-ocean-950 mb-3">${escapeHtml(r.name)}</h3>
          <p class="font-sans text-sm text-ocean-700 leading-relaxed">${escapeHtml(r.activities)}</p>
        </div>
      `
    }).join('')
    const activitiesHtml = `
      <div>
        <h2 class="font-serif text-xl font-bold text-ocean-950 mb-4">Activities</h2>
        <div class="grid grid-cols-1 ${perResortGridCols} gap-4">${activitiesCardsHtml}</div>
      </div>
    `

    // What You Need to Know — per resort
    const wyntkCardsHtml = slugs.map(s => {
      const r = bySlug[s]
      return `
        <div class="bg-white border border-ocean-100 rounded-2xl shadow-card p-5 sm:p-6 flex flex-col">
          <p class="font-sans text-[10px] font-bold uppercase tracking-widest text-ocean-400 mb-1">${escapeHtml(r.country)} · ${r.type === 'adults-only' ? 'Adults Only' : 'Family'}</p>
          <h3 class="font-serif text-lg font-bold text-ocean-950 mb-3">${escapeHtml(r.name)}</h3>
          <p class="font-sans text-sm text-ocean-700 leading-relaxed flex-1">${escapeHtml(r.whatYouNeedToKnow)}</p>
          <a href="${escapeHtml(r.agodaLink)}" target="_blank" rel="noopener noreferrer sponsored" class="mt-5 block text-center font-sans text-sm font-bold bg-ocean-900 hover:bg-ocean-950 text-white rounded-xl py-3 transition-colors">Check Prices →</a>
        </div>
      `
    }).join('')
    const wyntkHtml = `
      <div>
        <h2 class="font-serif text-xl font-bold text-ocean-950 mb-4">What You Need to Know</h2>
        <div class="grid grid-cols-1 ${perResortGridCols} gap-4">${wyntkCardsHtml}</div>
      </div>
    `

    wrap.innerHTML = whenHtml + activitiesHtml + wyntkHtml
  }

  function applyExtras() {
    const extras = getExtras()
    if (extras.length === 0) return

    const slugs = [...data.base, ...extras]

    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex, follow'
    document.head.appendChild(robots)

    document.querySelectorAll('.two-resort-only').forEach(el => { el.style.display = 'none' })

    renderTitle(slugs)
    renderHeroStrip(slugs)
    renderRatingsTable(slugs)
    renderMultiOverview(slugs)
  }

  // Everything below needs the full dataset, so it runs after the fetch.
  function init() {
  // ---------- Add resort modal ----------

  const modal     = document.getElementById('add-resort-modal')
  const closeBtn  = document.getElementById('add-resort-close')
  const form      = document.getElementById('add-resort-form')
  const countryEl = document.getElementById('add-country')
  const areaEl    = document.getElementById('add-area')
  const resortEl  = document.getElementById('add-resort')
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
    areaEl.classList.add('hidden')
    areaEl.disabled = true
    areaEl.innerHTML = '<option value="">Select region / area</option>'
    resortEl.disabled = true
    resortEl.innerHTML = '<option value="">Select resort</option>'
    submitBtn.disabled = true
  }

  function openModal() { populateCountries(); modal.classList.remove('hidden') }
  function closeModal() { modal.classList.add('hidden') }

  document.addEventListener('click', e => {
    if (e.target.id === 'add-resort-slot' || e.target.closest('#add-resort-slot')) openModal()
  })
  closeBtn.addEventListener('click', closeModal)
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() })

  countryEl.addEventListener('change', () => {
    const h = buildHierarchy(currentSlugs())
    areaEl.innerHTML = '<option value="">Select region / area</option>'
    resortEl.innerHTML = '<option value="">Select resort</option>'
    resortEl.disabled = true
    submitBtn.disabled = true

    const areas = h[countryEl.value]
    if (!areas) { areaEl.classList.add('hidden'); areaEl.disabled = true; return }

    const areaKeys = Object.keys(areas)
    if (areaKeys.length === 1) {
      areaEl.classList.add('hidden')
      areaEl.value = areaKeys[0]
      populateResortOptions(areas[areaKeys[0]])
    } else {
      areaEl.classList.remove('hidden')
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

  resortEl.addEventListener('change', () => { submitBtn.disabled = !resortEl.value })

  form.addEventListener('submit', e => {
    e.preventDefault()
    if (!resortEl.value) return
    setExtras([...getExtras(), resortEl.value])
  })

  applyExtras()
  }

  // Load the shared dataset, then wire up the picker. The base two-resort
  // comparison is already server-rendered, so a slow or failed fetch only
  // affects the optional "add resort" picker, not the core page.
  fetch('/pair-data.json')
    .then(res => res.json())
    .then(d => {
      data.resorts = d.resorts
      bySlug = Object.fromEntries(d.resorts.map(r => [r.slug, r]))
      init()
    })
    .catch(() => {})
})()
