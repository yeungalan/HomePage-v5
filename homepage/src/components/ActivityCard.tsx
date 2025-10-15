'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { useMemo } from 'react'

import {
  FaSolidFeatherAlt,
  IcTwotoneSignpost,
  MdiLightbulbOn20,
} from '@/components/icons/menu-collection'

export const iconClassName =
  'rounded-full border shrink-0 border-accent/30 text-xs center inline-flex size-6 text-accent'

export const ActivityCard = () => {
  const Content = useMemo(() => {
        let toLink = `/posts/134`
        /*
        return (
          <div className="relative flex flex-col justify-center gap-2">
            <div
              className={clsx(
                'absolute left-0 top-1/2 -translate-y-1/4',
                iconClassName,
              )}
            >
              <i className="i-mingcute-comment-line" />
            </div>
            <div className="flex items-center gap-2 pl-8">
              <div className="space-x-2">
                {"123" && (
                  <img
                    src={"456"}
                    className="inline size-[16px] rounded-full ring-2 ring-slate-200 dark:ring-zinc-800"
                  />
                )}
                <span className="font-medium">{"789"}</span>{' '}
                <small>在</small>{' '}
                <Link className="shiro-link--underline" href={toLink}>
                  <b>
                    '一条想法中'
                  </b>
                </Link>{' '}
                <small>说：</small>
              </div>
            </div>
            <div className="flex pl-8">
              <div
                className={clsx(
                  'relative inline-block rounded-xl p-3 text-zinc-800 dark:text-zinc-200',
                  'rounded-tl-sm bg-zinc-600/5 dark:bg-zinc-500/20',
                  'max-w-full overflow-auto',
                )}
              >
                {"ABCDEFG"}
              </div>
            </div>
          </div>
        )
      */
      
        return (
          <div className="flex translate-y-1/4 gap-2">
            <div className={clsx(iconClassName)}>
              <FaSolidFeatherAlt />
            </div>
            <div className="space-x-2">
              <small>发布了</small>{' '}
              <Link href={"456"}>
                <b>456</b>
              </Link>
            </div>
          </div>
        )
        
        /*
        return (
          <div className="flex translate-y-1/4 gap-2">
            <div className={clsx(iconClassName)}>
              <IcTwotoneSignpost />
            </div>
            <div className="space-x-2">
              <small>发布了</small>{' '}
              <Link href={`/posts/${activity.slug}`}>
                <b>{activity.title}</b>
              </Link>
            </div>
          </div>
        )
          */
  }, [])

  return <div className="pb-4 text-base">{Content}</div>
}
