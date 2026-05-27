(function () {
  const resortDataEl = document.getElementById('resort-data')
  if (!resortDataEl) return

  const allResorts = JSON.parse(resortDataEl.textContent)

  // Build country → area → resorts hierarchy
  const hierarchy = {}
  allResorts.forEach(r => {
    if (!hierarchy[r.country]) hierarchy[r.country] = {}
    if (!hierarchy[r.country][r.area]) hierarchy[r.country][r.area] = []
    hierarchy[r.country][r.area].push(r)
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

  function setupSlot(countryId, areaRowId, areaId, resortId) {
    const countryEl = document.getElementById(countryId)
    const areaRowEl = document.getElementById(areaRowId)
    const areaEl    = document.getElementById(areaId)
    const resortEl  = document.getElementById(resortId)

    countryEl.addEventListener('change', () => {
      resetSelect(areaEl, 'Select area')
      resetSelect(resortEl, 'Select resort')
      updateSubmitBtn()

      const areas = hierarchy[countryEl.value]
      if (!areas) return

      const areaKeys = Object.keys(areas)
      if (areaKeys.length === 1) {
        // Single area — hide area row and go straight to resort
        areaRowEl.classList.add('hidden')
        areaEl.value = areaKeys[0]
        populateResorts(resortEl, areas[areaKeys[0]])
      } else {
        areaRowEl.classList.remove('hidden')
        areaKeys.forEach(area => {
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
      const areas = hierarchy[countryEl.value]
      if (!areas || !areaEl.value) return
      populateResorts(resortEl, areas[areaEl.value] || [])
    })

    resortEl.addEventListener('change', () => {
      syncDisabled()
      updateSubmitBtn()
    })
  }

  setupSlot('country-a', 'area-row-a', 'area-a', 'resort-a')
  setupSlot('country-b', 'area-row-b', 'area-b', 'resort-b')

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
