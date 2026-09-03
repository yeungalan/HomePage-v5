#!/usr/bin/env node
/**
 * Turns the merged mochawesome report produced by `cypress-mochawesome-reporter`
 * into a Markdown summary, and (in CI, on a pull_request run) posts or updates
 * a single PR comment with it — identified by a hidden HTML marker so re-runs
 * update the same comment instead of piling up new ones.
 *
 * Run locally with `npm run report:comment` after a `npm run cypress:run` to
 * just print the Markdown (no GITHUB_TOKEN/PR_NUMBER means it skips posting).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import path from 'node:path'

const REPORT_DIR = path.resolve(process.cwd(), 'cypress/reports')
const MERGED_REPORT = path.join(REPORT_DIR, 'mochawesome.json')
const COMMENT_MARKER = '<!-- cypress-comprehensive-report -->'

/** Recursively collect every test in a mochawesome suite tree. */
function collectTests(suite, out = []) {
  for (const test of suite.tests ?? []) {
    out.push({
      title: test.fullTitle || test.title,
      state: test.state ?? (test.pending ? 'pending' : 'unknown'),
      duration: test.duration ?? 0,
      errorMessage: test.err?.message,
      file: suite.file,
    })
  }
  for (const child of suite.suites ?? []) {
    collectTests(child, out)
  }
  return out
}

function loadReport() {
  if (existsSync(MERGED_REPORT)) {
    return JSON.parse(readFileSync(MERGED_REPORT, 'utf8'))
  }

  // Fall back to summing the per-spec reports if the merge step didn't run
  // (e.g. a local `cypress run` interrupted before `after:run`).
  const jsonsDir = path.join(REPORT_DIR, '.jsons')
  if (!existsSync(jsonsDir)) {
    throw new Error(
      `No mochawesome report found at ${MERGED_REPORT} or ${jsonsDir}. Did the Cypress run finish?`,
    )
  }
  const files = readdirSync(jsonsDir).filter((f) => f.endsWith('.json'))
  const results = files.map((f) => JSON.parse(readFileSync(path.join(jsonsDir, f), 'utf8')))
  return {
    stats: results.reduce(
      (acc, r) => ({
        suites: acc.suites + (r.stats?.suites ?? 0),
        tests: acc.tests + (r.stats?.tests ?? 0),
        passes: acc.passes + (r.stats?.passes ?? 0),
        failures: acc.failures + (r.stats?.failures ?? 0),
        pending: acc.pending + (r.stats?.pending ?? 0),
        skipped: acc.skipped + (r.stats?.skipped ?? 0),
        duration: acc.duration + (r.stats?.duration ?? 0),
      }),
      { suites: 0, tests: 0, passes: 0, failures: 0, pending: 0, skipped: 0, duration: 0 },
    ),
    results,
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

function buildMarkdown(report) {
  const { stats } = report
  const allTests = (report.results ?? []).flatMap((r) => collectTests(r))
  const failed = allTests.filter((t) => t.state === 'failed')
  const passed = allTests.filter((t) => t.state === 'passed')
  const pending = allTests.filter((t) => t.state === 'pending')

  const passRate = stats.tests > 0 ? Math.round((stats.passes / stats.tests) * 100) : 0
  const overallEmoji = failed.length === 0 ? '✅' : '❌'

  const lines = []
  lines.push(COMMENT_MARKER)
  lines.push(`## ${overallEmoji} Cypress E2E Report`)
  lines.push('')
  lines.push(
    `**${stats.passes}/${stats.tests} passed (${passRate}%)** across ${stats.suites} suites in ${formatDuration(stats.duration)}.`,
  )
  lines.push('')
  lines.push('| ✅ Passed | ❌ Failed | ⏭️ Pending |')
  lines.push('|---|---|---|')
  lines.push(`| ${stats.passes} | ${stats.failures} | ${stats.pending} |`)

  if (failed.length > 0) {
    lines.push('')
    lines.push(`<details open><summary><strong>❌ Failures (${failed.length})</strong></summary>`)
    lines.push('')
    for (const t of failed) {
      lines.push(`- **${t.title}**${t.file ? ` _(${t.file})_` : ''}`)
      if (t.errorMessage) {
        const firstLine = t.errorMessage.split('\n')[0].slice(0, 300)
        lines.push(`  \`\`\`\n  ${firstLine}\n  \`\`\``)
      }
    }
    lines.push('')
    lines.push('</details>')
  }

  if (pending.length > 0) {
    lines.push('')
    lines.push(`<details><summary>⏭️ Pending/skipped (${pending.length})</summary>`)
    lines.push('')
    pending.forEach((t) => lines.push(`- ${t.title}`))
    lines.push('')
    lines.push('</details>')
  }

  lines.push('')
  lines.push(`<details><summary>✅ Passed (${passed.length})</summary>`)
  lines.push('')
  passed.forEach((t) => lines.push(`- ${t.title} _(${formatDuration(t.duration)})_`))
  lines.push('')
  lines.push('</details>')

  const { GITHUB_REPOSITORY, GITHUB_RUN_ID, GITHUB_SHA } = process.env
  if (GITHUB_REPOSITORY && GITHUB_RUN_ID) {
    lines.push('')
    lines.push(
      `_Run for [\`${(GITHUB_SHA ?? '').slice(0, 7)}\`](https://github.com/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}) · [full workflow run](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})_`,
    )
  }

  return lines.join('\n')
}

async function upsertPrComment(body) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY, PR_NUMBER } = process.env
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !PR_NUMBER) {
    console.log('GITHUB_TOKEN / GITHUB_REPOSITORY / PR_NUMBER not set — printing report only.\n')
    console.log(body)
    return
  }

  const api = `https://api.github.com/repos/${GITHUB_REPOSITORY}`
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const listRes = await fetch(`${api}/issues/${PR_NUMBER}/comments?per_page=100`, { headers })
  if (!listRes.ok) {
    throw new Error(`Failed to list PR comments: ${listRes.status} ${await listRes.text()}`)
  }
  const comments = await listRes.json()
  const existing = comments.find((c) => c.body?.includes(COMMENT_MARKER))

  if (existing) {
    const res = await fetch(`${api}/issues/comments/${existing.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) throw new Error(`Failed to update comment: ${res.status} ${await res.text()}`)
    console.log(`Updated existing PR comment ${existing.html_url}`)
  } else {
    const res = await fetch(`${api}/issues/${PR_NUMBER}/comments`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) throw new Error(`Failed to create comment: ${res.status} ${await res.text()}`)
    const created = await res.json()
    console.log(`Posted PR comment ${created.html_url}`)
  }
}

const report = loadReport()
const markdown = buildMarkdown(report)
await upsertPrComment(markdown)
