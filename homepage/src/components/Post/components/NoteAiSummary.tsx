import React from 'react'
import { Icon } from '@iconify/react'
import { useCurrentNoteDataSelector } from '../hooks/useCurrentNoteData'
import { useTranslation } from '@/i18n'

/** Summary of the post, read from the AI_SUMMARY line of its AUTOMATE FIELD block. */
export const NoteAiSummary: React.FC = () => {
  const t = useTranslation()
  const summary = useCurrentNoteDataSelector(data => data?.data.aiSummary)

  if (!summary) return null

  return (
    <section
      aria-label={t('post.aiSummary')}
      className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60"
    >
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-zinc-200">
        <Icon icon="mingcute:ai-line" aria-hidden="true" />
        {t('post.aiSummary')}
      </h2>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-300">{summary}</p>
    </section>
  )
}
