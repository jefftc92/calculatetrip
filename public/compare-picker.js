(function () {
  const resortDataEl = document.getElementById('resort-data')
  if (!resortDataEl) return

  const allResorts = JSON.parse(resortDataEl.textContent)

  // Build country → area → resorts hierarchy, skipping blank countries.
  // Resorts with a blank area are collected under __all__ only.
  const hierarchy = {}
  allResorts.forEach(r => {
    if (!r.country) return
    if (!hierarchy[r.country]) hierarchy[r.country] = { __all__: [] }
    hierarchy[r.country].__all__.push(r)
    if (r.area) {
      if (!hierarchy[r.country][r.area]) hierarchy[r.country][r.area] = []
      hierarchy[r.country][r.area].push(r)
    }
  })

  const form  = document.getElementById('compare-form')
  const btn   = document.getElementById('compare-btn')
  const error = document.getElementById('compare-error')
  if (!form) return

  function resetSelect(el, placeholder) {
    el.innerHTML = `<option value="">${placeholder}</option>`
    el.disabled = true
  }

  function populateResorts(el, resorts) {
    el.innerHTML = '<option value="">Select resort</option>'
    resorts.forEach(r => {
      const opt = document.createElement('option')
      opt.value = r.slug
      opt.textContent = r.name
      el.appendChild(opt)
    })
    el.disabled = resorts.length === 0
  }

  function syncDisabled() {
    const a = document.getElementById('resort-a').value
    const b = document.getElementById('resort-b').value
    for (const opt of document.getElementById('resort-a').options) {
      if (opt.value) opt.disabled = opt.value === b
    }
    for (const opt of document.getElementById('resort-b').options) {
      if (opt.value) opt.disabled = opt.value === a
    }
  }

  function updateSubmitBtn() {
    const a = document.getElementById('resort-a').value
    const b = document.getElementById('resort-b').value
    btn.disabled = !a || !b || a === b
  }

  function getResortsForArea(country, areaValue) {
    const areas = hierarchy[country]
    if (!areas) return []
    if (areaValue === '__all__') return areas.__all__ || []
    return areas[areaValue] || []
  }

  function setupSlot(countryId, areaId, resortId) {
    const countryEl = document.getElementById(countryId)
    const areaEl    = document.getElementById(areaId)
    const resortEl  = document.getElementById(resortId)

    countryEl.addEventListener('change', () => {
      resetSelect(areaEl, 'Select region / area')
      areaEl.classList.add('hidden')
      resetSelect(resortEl, 'Select resort')
      updateSubmitBtn()

      const areas = hierarchy[countryEl.value]
      if (!areas) return

      // Named areas only (exclude __all__ sentinel)
      const namedAreas = Object.keys(areas).filter(k => k !== '__all__').sort()

      if (namedAreas.length === 0) {
        // All resorts have blank area — show them directly
        populateResorts(resortEl, areas.__all__)
      } else if (namedAreas.length === 1) {
        // Only one named area — skip area picker
        populateResorts(resortEl, areas.__all__)
      } else {
        // Multiple areas — show area picker with "All" first
        areaEl.classList.remove('hidden')
        const allOpt = document.createElement('option')
        allOpt.value = '__all__'
        allOpt.textContent = 'All areas'
        areaEl.appendChild(allOpt)
        namedAreas.forEach(area => {
          const opt = document.createElement('option')
          opt.value = area
          opt.textContent = area
          areaEl.appendChild(opt)
        })
        areaEl.disabled = false
      }
    })

    areaEl.addEventListener('change', () => {
      resetSelect(resortEl, 'Select resort')
      updateSubmitBtn()
      if (!areaEl.value) return
      populateResorts(resortEl, getResortsForArea(countryEl.value, areaEl.value))
    })

    resortEl.addEventListener('change', () => {
      syncDisabled()
      updateSubmitBtn()
    })
  }

  setupSlot('country-a', 'area-a', 'resort-a')
  setupSlot('country-b', 'area-b', 'resort-b')

  form.addEventListener('submit', e => {
    e.preventDefault()
    const a = document.getElementById('resort-a').value
    const b = document.getElementById('resort-b').value
    if (!a || !b) {
      error.textContent = 'Please select two resorts.'
      error.classList.remove('hidden')
      return
    }
    if (a === b) {
      error.textContent = 'Please select two different resorts.'
      error.classList.remove('hidden')
      return
    }
    error.classList.add('hidden')
    const [first, second] = [a, b].sort()
    window.location.href = `/compare/${first}-vs-${second}/`
  })
})()
