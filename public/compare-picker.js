// Compare picker — vanilla JS, ~30 lines. No framework, no build step.
// Disables the same-resort option in the other dropdown, validates on submit,
// builds the canonical /compare/A-vs-B/ URL with alphabetically-sorted slugs.

(function () {
  const form  = document.getElementById('compare-form')
  const selA  = document.getElementById('resort-a')
  const selB  = document.getElementById('resort-b')
  const error = document.getElementById('compare-error')
  if (!form || !selA || !selB) return

  function syncDisabled() {
    for (const opt of selB.options) opt.disabled = opt.value !== '' && opt.value === selA.value
    for (const opt of selA.options) opt.disabled = opt.value !== '' && opt.value === selB.value
  }
  selA.addEventListener('change', syncDisabled)
  selB.addEventListener('change', syncDisabled)

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const a = selA.value, b = selB.value
    if (!a || !b) { error.textContent = 'Please pick two resorts.'; error.classList.remove('hidden'); return }
    if (a === b)  { error.textContent = 'Please pick two different resorts.'; error.classList.remove('hidden'); return }
    const [first, second] = [a, b].sort()
    window.location.href = `/compare/${first}-vs-${second}/`
  })
})()
