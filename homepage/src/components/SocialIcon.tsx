import type { ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { Icon } from '@iconify/react'

import { BilibiliIcon } from '@/components/icons/platform/BilibiliIcon'
import { BlueskyIcon } from '@/components/icons/platform/BlueskyIcon'
import { NeteaseCloudMusicIcon } from '@/components/icons/platform/NeteaseIcon'
import { SteamIcon } from '@/components/icons/platform/SteamIcon'
import { XIcon } from '@/components/icons/platform/XIcon'
import { MotionButtonBase } from '@/components/MotionButtonBase'
import { FloatPopover } from './FloatPopOver'
import Link from 'next/link'

interface SocialIconProps {
  type: string
  id: string
}

const iconSet: Record<
  string,
  [string, string | (() => ReactNode), string, (id: string) => string]
> = {
  github: [
    'Github',
    'mingcute:github-line',
    '#181717',
    (id) => `https://github.com/${id}`,
  ],
  twitter: [
    'Twitter',
    'mingcute:twitter-line',
    '#1DA1F2',
    (id) => `https://twitter.com/${id}`,
  ],
  x: ['X', () => <XIcon />, 'rgba(36,46,54,1.00)', (id) => `https://x.com/${id}`],
  telegram: [
    'Telegram',
    'mingcute:telegram-line',
    '#0088cc',
    (id) => `https://t.me/${id}`,
  ],
  linkedin: [
    'Linkedin',
    'mingcute:linkedin-line',
    '#0088cc',
    (id) => `https://linkedin.com/in/${id}`,
  ],
  instagram: [
    'Instagram',
    'mingcute:instagram-line',
    '#f00075',
    (id) => `https://instagram.com/${id}`,
  ],
  mail: [
    'Email',
    'mingcute:mail-line',
    '#D44638',
    (id) => `mailto:${id}`,
  ],
  get email() {
    return this.mail
  },
  get feed() {
    return this.rss
  },
  rss: ['RSS', 'mingcute:rss-line', '#FFA500', (id) => id],
  bilibili: [
    '哔哩哔哩',
    () => <BilibiliIcon />,
    '#00A1D6',
    (id) => `https://space.bilibili.com/${id}`,
  ],
  netease: [
    '网易云音乐',
    () => <NeteaseCloudMusicIcon />,
    '#C20C0C',
    (id) => `https://music.163.com/#/user/home?id=${id}`,
  ],
  qq: [
    'QQ',
    'mingcute:qq-fill',
    '#1e6fff',
    (id) => `https://wpa.qq.com/msgrd?v=3&uin=${id}&site=qq&menu=yes`,
  ],
  wechat: [
    '微信',
    'mingcute:wechat-fill',
    '#2DC100',
    (id) => id,
  ],
  weibo: [
    '微博',
    'mingcute:weibo-line',
    '#E6162D',
    (id) => `https://weibo.com/${id}`,
  ],
  discord: [
    'Discord',
    'mingcute:discord-fill',
    '#7289DA',
    (id) => `https://discord.gg/${id}`,
  ],
  bluesky: [
    'Bluesky',
    () => <BlueskyIcon />,
    '#0085FF',
    (id) => `https://bsky.app/profile/${id}`,
  ],
  steam: [
    'Steam',
    () => <SteamIcon />,
    '#0F1C30',
    (id) => `https://steamcommunity.com/id/${id}`,
  ],
}
const icons = Object.keys(iconSet)

export const isSupportIcon = (icon: string) => icons.includes(icon)
export const SocialIcon = memo((props: SocialIconProps) => {
  const { id, type } = props

  const [name, iconData, iconBg, hrefFn] = useMemo(() => {
    const result = iconSet[type] || []
    return result as [string, string | (() => ReactNode), string, (id: string) => string]
  }, [type])

  if (!name) return null
  const href = hrefFn(id)

  const IconComponent = typeof iconData === 'string'
    ? <Icon icon={iconData} />
    : iconData()

  return (
<FloatPopover
      type="tooltip"
      triggerElement={
        <MotionButtonBase
          className="center flex aspect-square size-10 rounded-full text-2xl text-white"
          style={{
            background: iconBg,
          }}
        >
          <Link
            target="_blank"
            href={href}
            className="center flex"
            rel="noreferrer"
          >
            {IconComponent}
          </Link>
        </MotionButtonBase>
      }
    >
      {name}
    </FloatPopover>
  )
})
SocialIcon.displayName = 'SocialIcon'