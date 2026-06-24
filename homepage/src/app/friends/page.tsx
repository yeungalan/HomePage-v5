'use client'

import { useTranslation } from '@/i18n'
import { LinkCardGrid } from '@/components/LinkCard'
import { FRIENDS_DATA } from '@/data/friends'

export default function FriendsPage() {
  const t = useTranslation()
  return (
    <div className="pt-5">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">{t('friends.title')}</h1>
        <h3 className="text-xl text-gray-600 dark:text-gray-300">{t('friends.subtitle')}</h3>
      </header>
      <main className="mt-10 flex w-full flex-col">
        <LinkCardGrid entries={FRIENDS_DATA} />
      </main>
    </div>
  )
}
