'use client'

import { useTranslation } from '@/i18n'
import { LinkCardGrid } from '@/components/LinkCard'
import { PROJECTS_DATA } from '@/data/projects'

export default function ProjectsPage() {
  const t = useTranslation()
  return (
    <div className="pt-5">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('projects.title')}</h1>
        <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('projects.subtitle')}</h3>
      </header>
      <main className="mt-10 flex w-full flex-col">
        <LinkCardGrid entries={PROJECTS_DATA} />
      </main>
    </div>
  )
}
