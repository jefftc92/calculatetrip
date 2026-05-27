import Anthropic from '@anthropic-ai/sdk'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// Maps every root Next.js src/ file to its Vite equivalent
const FILE_MAP = {
  'src/app/page.js':                                              'artifacts/calculatetrip/src/pages/HomePage.tsx',
  'src/components/Navigation.js':                                 'artifacts/calculatetrip/src/components/Navigation.tsx',
  'src/data/resorts.js':                                          'artifacts/calculatetrip/src/data/resorts.ts',
  'src/components/ResortCard.js':                                 'artifacts/calculatetrip/src/components/ResortCard.tsx',
  'src/components/Footer.js':                                     'artifacts/calculatetrip/src/components/Footer.tsx',
  'src/components/Breadcrumb.js':                                 'artifacts/calculatetrip/src/components/Breadcrumb.tsx',
  'src/components/RatingBar.js':                                  'artifacts/calculatetrip/src/components/RatingBar.tsx',
  'src/components/ComparePicker.js':                              'artifacts/calculatetrip/src/components/ComparePicker.tsx',
  'src/app/resorts/page.js':                                      'artifacts/calculatetrip/src/pages/AllResortsPage.tsx',
  'src/app/resorts/[slug]/page.js':                               'artifacts/calculatetrip/src/pages/ResortDetailPage.tsx',
  'src/app/compare/page.js':                                      'artifacts/calculatetrip/src/pages/CompareHubPage.tsx',
  'src/app/compare/[pair]/page.js':                               'artifacts/calculatetrip/src/pages/ComparePage.tsx',
  'src/app/destination/[country]/page.js':                        'artifacts/calculatetrip/src/pages/DestinationPage.tsx',
  'src/app/best-adults-only-all-inclusive-resorts/page.js':       'artifacts/calculatetrip/src/pages/AdultsOnlyPage.tsx',
  'src/app/best-family-all-inclusive-resorts/page.js':            'artifacts/calculatetrip/src/pages/FamilyPage.tsx',
  'src/app/best-value-all-inclusive-resorts/page.js':             'artifacts/calculatetrip/src/pages/BestValuePage.tsx',
  'src/app/best-beach-all-inclusive-resorts/page.js':             'artifacts/calculatetrip/src/pages/BestBeachPage.tsx',
}

const SYSTEM_PROMPT = `You are a code porter. You receive:
1. A git diff of a Next.js file that was just changed
2. The current contents of the equivalent Vite/React+wouter file

Your job is to apply the INTENT of the diff to the Vite file.

RULES:
- Output ONLY the complete updated Vite file. No explanations, no markdown fences.
- Preserve all Vite-specific code: wouter imports/hooks, relative imports, TypeScript types, BASE_URL usage.
- Never introduce Next.js APIs: no next/link, no next/navigation, no useRouter, no notFound(), no metadata exports, no generateStaticParams.
- Replace any next/link <Link> with wouter <Link href="..."> (no trailing slashes needed).
- Replace useRouter().push() with useLocation() from wouter: const [, setLocation] = useLocation(); setLocation(path).
- Replace notFound() with <Redirect to="/" />.
- Keep existing comments and structure of the Vite file where unchanged.
- If the diff adds a new resort to resorts.js, add it to resorts.ts with the same data and TypeScript types.
- If the diff only touches Next.js-specific things (metadata, generateStaticParams, canonical URLs), make no changes to the Vite file and output it unchanged.`

async function port(nextjsFile, vitePath, diff) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const viteContents = existsSync(vitePath)
    ? readFileSync(vitePath, 'utf8')
    : '(file does not exist yet — create it from scratch based on the diff)'

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Next.js file changed: ${nextjsFile}
Vite equivalent: ${vitePath}

=== GIT DIFF ===
${diff}

=== CURRENT VITE FILE ===
${viteContents}

Output the complete updated Vite file:`,
      },
    ],
  })

  return message.content[0].text.trim()
}

async function main() {
  const changedFiles = (process.env.CHANGED_FILES || '')
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)

  if (changedFiles.length === 0) {
    console.log('No relevant src/ files changed.')
    process.exit(0)
  }

  const client_files = changedFiles.filter((f) => FILE_MAP[f])
  const unmapped = changedFiles.filter((f) => !FILE_MAP[f])

  if (unmapped.length > 0) {
    console.log('No Vite equivalent for (skipping):', unmapped.join(', '))
  }

  if (client_files.length === 0) {
    console.log('No mappable files changed.')
    process.exit(0)
  }

  for (const nextjsFile of client_files) {
    const vitePath = FILE_MAP[nextjsFile]
    console.log(`Porting ${nextjsFile} → ${vitePath}`)

    let diff
    try {
      diff = execSync(`git diff HEAD~1 HEAD -- "${nextjsFile}"`, { encoding: 'utf8' })
    } catch {
      console.warn(`Could not get diff for ${nextjsFile}, skipping.`)
      continue
    }

    if (!diff.trim()) {
      console.log(`Empty diff for ${nextjsFile}, skipping.`)
      continue
    }

    try {
      const ported = await port(nextjsFile, vitePath, diff)
      writeFileSync(vitePath, ported, 'utf8')
      console.log(`✓ Written: ${vitePath}`)
    } catch (err) {
      console.error(`✗ Failed to port ${nextjsFile}:`, err.message)
      process.exit(1)
    }
  }
}

main()
